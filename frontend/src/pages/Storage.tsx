import { useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { listFiles, uploadFile, type FileMeta } from "../api/files";
import { getUsers, type UserMeta } from "../api/users";
import { UploadModalProvider } from "../context/UploadModalContext";
import { useToast } from "../context/ToastContextHelpers";
import NavBar from "../components/Navbar";
import FileList from "../components/filesPage/FileList";
import UploadButton from "../components/filesPage/UploadButton";
import AdminPanelButton from "../components/AdminPanelButton";

import "./Storage.css";


function Storage() {
    const qc = useQueryClient();
    const toast = useToast();

    const adminQuery = useQuery<UserMeta[]>({
        queryKey: ["users"],
        queryFn: getUsers,
    });

    const isAdmin = adminQuery.data != null;
    const { owner } = useParams<{ owner?: string }>();
    const ownerId: number | undefined =
        owner !== undefined && !Number.isNaN(Number(owner)) ? Number(owner) : undefined;

    const filesQuery = useQuery<FileMeta[]>({
        queryKey: ["files", ownerId ?? null],
        queryFn: () => listFiles(ownerId),
    })

    if (filesQuery.isLoading) return <p>Loading...</p>;
    if (filesQuery.error) return <p>Error loading files</p>;

    return (
        <UploadModalProvider
            acceptedTypes="*"
            uploadFn={uploadFile}
            onComplete={() => {
                qc.invalidateQueries({ queryKey: ["files"] });
                toast({ message: "Файлы успешно загружены" });
            }}>
            <div className="fs-page">
                <NavBar rightSlot1={isAdmin ? <AdminPanelButton /> : null} rightSlot2={<UploadButton className="navbar__btn"/>} brandToMain />

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
