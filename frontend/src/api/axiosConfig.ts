import axios from "axios";
const baseURL = import.meta.env.VITE_API_URL;

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
        if (error.response?.status === 401 && !originalRequest._retry) { // когда ошибка 401, и запрос еще не был повторен
            console.log(originalRequest);
            originalRequest._retry = true;
            try {
                if (!localStorage.getItem("refresh_token")) {
                    throw new Error("No refresh token available");
                }
                const { data } = await axios.post(
                    "/auth/token/refresh/",
                    {
                        refreshToken: localStorage.getItem("refresh_token")
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
                window.location.href = "/login/";
            }
        }
        return Promise.reject(error);
    }
);

export default api;
