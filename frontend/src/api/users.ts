import api from "./axiosConfig";

export interface UserMeta {
    id: number;
    uuid: string;
    username: string;
    email: string;
    fullname: string;
    is_active: boolean;
    is_staff: boolean;
    files_count: number;
    total_size: number;
    total_size_h: string;
}

export async function getUsers(): Promise<UserMeta[]> {
    return (await api.get("/users/")).data;
}
