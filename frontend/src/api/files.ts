import api from "./axiosConfig";

export interface FileMeta {
    id: number;
    uuid: string;
    filename: string;
    comment: string;
    created: string;
    size: number;
    size_h: string;
    public_id: string | null;
    last_download: string | null;
}

export async function listFiles(): Promise<FileMeta[]> {
    const url = "/files/";
    const { data } = await api.get(url);
    return data;
};

export async function uploadFile(file: File, comment?: string): Promise<FileMeta> {
    const formData = new FormData();
    formData.append("content", file);
    if (comment) {
        formData.append("comment", comment);
    }
    const { data } = await api.post("/files/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return data.file;
};

export async function downloadFile(id: number): Promise<Blob> {
    const { data } = await api.get(`/files/${id}/download/`, { responseType: "blob" });
    return data;
};

export async function shareFile(id: number): Promise<string> {
    const { data } = await api.post(`/files/${id}/share/`);
    return data.share_url;
}

export async function deleteFile(id: number): Promise<void> {
    await api.delete(`/files/${id}/`);
};
