import { useQuery } from "@tanstack/react-query";

import NavBar from "../components/Navbar";
import FileList from "../components/filesPage/FileList";
import UploadButton from "../components/filesPage/UploadButton";
import AdminPanelButton from "../components/AdminPanelButton";
import { UploadModalProvider } from "../context/UploadModalContext";
import { getUsers, type UserMeta } from "../api/users";
import { listFiles, type FileMeta } from "../api/files";
import { isAuthenticated } from "../utils/auth";

import "./Storage.css";


function Storage() {
    const filesQuery = useQuery<FileMeta[]>({
        queryKey: ["files"],
        queryFn: listFiles,
    })

    const adminQuery = useQuery<UserMeta[]>({
        queryKey: ["users"],
        queryFn: getUsers,
    });

    const isAuth = isAuthenticated();
    const isAdmin = adminQuery.data != null;

    const uploadToServer = async (files: File[]) => {
        const form = new FormData();
        files.forEach((f) => form.append("files", f));
        // const res = await fetch("/api/upload", { method: "POST", body: form });
        // if (!res.ok) throw new Error("Upload failed");
        await new Promise((r) => setTimeout(r, 1000));
    };

    if (filesQuery.isLoading) return <p>Loading...</p>;
    if (filesQuery.error) return <p>Error loading files</p>;

    return (
        <UploadModalProvider acceptedTypes="*" uploadFn={uploadToServer} onComplete={() => console.log("Upload complete") }>
            <div className="fs-page">
                <NavBar isAuth={isAuth} rightSlot1={isAdmin ? <AdminPanelButton /> : null} rightSlot2={<UploadButton />} brandToMain={true}/>

                <main className="fs-content">
                        <p className="fs-hint">Перетащите файл(ы) на страницу, чтобы быстро открыть окно загрузки.</p>
                        {
                            filesQuery.isLoading ? <p>Loading...</p> : filesQuery.error ? <p>Error loading files</p> : <FileList files={filesQuery.data ?? []} />
                        }
                </main>
            </div>
        </UploadModalProvider>
    );
}

export default Storage;
