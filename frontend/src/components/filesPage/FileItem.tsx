import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Download, Share2, Trash, FilePenLine } from "lucide-react";

import { downloadFile, shareFile, deleteFile, type FileMeta} from "../../api/files";
import { useToast } from "../../context/ToastContextHelpers";
import EditFileModal from "./EditFileModal";

import "./FileItem.css";
import TrimmedText from "../TrimmedText";


function FileItem({ file }: { file: FileMeta }) {
    const [isEditOpen, setIsEditOpen] = useState(false);
    const toast = useToast();
    const qc = useQueryClient();

    const createdDate: string = new Date(file.created).toLocaleDateString("ru-RU", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    });
    const downloadDate: string = file.last_download ? new Date(file.last_download).toLocaleDateString("ru-RU", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    }) : "N/A";

    const deleteMutation = useMutation({
        mutationFn: () => deleteFile(file.id),

        onMutate: async () => {
            await qc.cancelQueries({ queryKey: ["files"] });
            const prev = qc.getQueryData<FileMeta[]>(["files"]);
            qc.setQueryData<FileMeta[]>(["files"], (old) =>
                old?.filter((x) => x.id !== file.id) ?? []
            );
            return { prev };
        },
        onError: (_err, _vars, ctx) => ctx?.prev && qc.setQueryData(["files"], ctx.prev),
        onSettled: () => {
            qc.invalidateQueries({ queryKey: ["files"] });
        },
    });

    const downloadMutation = useMutation({
        mutationFn: async () => {
            const blob = await downloadFile(file.id);
            return blob;
        },
        onSuccess: (blob) => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = file.filename;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
        },
        onError: () => {
            toast({ message: `Ошибка при скачивании файла`, type: "error" });
        },
    });

    const shareMutation = useMutation({
        mutationFn: () => shareFile(file.id),
        onSuccess: (share_url) => {
            navigator.clipboard.writeText(share_url);
            toast({ message: "Ссылка на файл скопирована в буфер обмена", type: "info" });
        },
        onError: () => {
            toast({ message: `Ошибка при создании ссылки на файл`, type: "error" });
        },
    });

    return (
        <div key={file.id} className="card">
            <div className="row-grid">
                <div className="file-info">
                    <p className="file-name">{file.filename}</p>
                    <TrimmedText className="comment" text={file.comment} limit={50} />
                </div>

                <div className="meta">
                    <p className="meta-label">Создан</p>
                    <p className="meta-value">{createdDate}</p>
                </div>

                <div className="meta">
                    <p className="meta-label">Скачан</p>
                    <p className="meta-value">{downloadDate}</p>
                </div>

                <div className="meta">
                    <p className="meta-label">Размер</p>
                    <p className="meta-value">{file.size_h}</p>
                </div>

                <div className="actions">
                    <button className="icon-btn" title="Скачать файл" onClick={() => downloadMutation.mutate()} disabled={downloadMutation.isPending}>
                        <Download />
                    </button>
                    <button className="icon-btn" title="Переименовать файл"onClick={() => setIsEditOpen(true)}>
                        <FilePenLine />
                    </button>
                    <button className="icon-btn" title="Поделиться файлом" onClick={() => shareMutation.mutate()} disabled={shareMutation.isPending}>
                        <Share2 />
                    </button>
                    <button className="icon-btn" title="Удалить файл" onClick={() => {
                        if (!window.confirm("Вы уверены, что хотите удалить этот файл?")) {
                            return;
                        }
                        deleteMutation.mutate();
                    }} disabled={deleteMutation.isPending}>
                        <Trash />
                    </button>
                </div>
            </div>

            <EditFileModal
                isOpen={isEditOpen}
                onRequestClose={() => setIsEditOpen(false)}
                file={file}
            />

        </div>
    );
};

export default FileItem;
