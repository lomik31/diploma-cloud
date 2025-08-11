import axios from "axios";
const baseURL = `https://${window.location.host}/api/`;

declare module "axios" {
    export interface AxiosRequestConfig {
        skipAuthRedirect401?: boolean;
        _retry?: boolean;
    }
}

const api = axios.create({
    baseURL: baseURL,
});

api.interceptors.request.use(config => {
    const token = sessionStorage.getItem("access_token");
    if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    response => response,
    async error => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && originalRequest.skipAuthRedirect401)
            return Promise.reject(error);

        if (error.response?.status === 401 && !originalRequest._retry) { // когда ошибка 401, и запрос еще не был повторен
            originalRequest._retry = true;
            try {
                if (!localStorage.getItem("refresh_token")) {
                    throw new Error("No refresh token available");
                }
                const { data } = await axios.post(
                    "/auth/token/refresh/",
                    {
                        refresh: localStorage.getItem("refresh_token")
                    },
                    {
                        baseURL: api.defaults.baseURL
                    }
                );
                const newToken: string = data.access;
                sessionStorage.setItem("access_token", newToken);
                originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
                return api(originalRequest);
            } catch {
                sessionStorage.removeItem("access_token");
                localStorage.removeItem("refresh_token");
                window.location.replace("/login");
            }
        }

        if (error.response?.status === 403) {
            if (window.location.pathname !== "/files") {
                window.location.replace("/files");
            }
        }


        return Promise.reject(error);
    }
);

export default api;
