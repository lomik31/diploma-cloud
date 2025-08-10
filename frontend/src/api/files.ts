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

export async function listFiles(ownerId?: number): Promise<FileMeta[]> {
    const url = ownerId
        ? `/files/?owner=${ownerId}`
        : "/files/";
    const { data } = await api.get(url);
    return data;
};

export async function uploadFile(files: File[], comments: string[]): Promise<FileMeta> {
    if (files.length !== comments.length) {
        throw new Error("Number of files and comments must match");
    }
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
        formData.append("content", files[i]);
        formData.append("comment", comments[i]);
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

export async function updateFileMeta(id: number, filename: string, comment: string): Promise<FileMeta> {
    const { data } = await api.patch(`/files/${id}/`, { filename, comment });
    return data;
}
