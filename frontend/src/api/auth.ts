import api from "./axiosConfig";

export interface User {
    isLoggedIn: boolean;
}

export async function login (username: string, password: string): Promise<User> {
    const { data } = await api.post("/auth/token/", { username, password });
    sessionStorage.setItem("access_token", data.access);
    localStorage.setItem("refresh_token", data.refresh);
    return { isLoggedIn: true };
};

export async function logout () {
    await api.post("/auth/token/logout/");
    sessionStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
};

export async function register (username: string, email: string, fullname: string, password: string) : Promise<User> {
    await api.post("/auth/register/", { username, email, fullname, password });
    return login(username, password);
};
