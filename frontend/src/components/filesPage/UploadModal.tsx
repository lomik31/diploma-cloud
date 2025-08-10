import { useMemo, useRef, useState } from "react";
import { X } from "lucide-react";

import type { FileMeta } from "../../api/files";
import { useToast } from "../../context/ToastContextHelpers";
import ModalPortal from "../ModalPortal";

import "./UploadModal.css";


interface UploadModalProps {
    isOpen: boolean;
    onRequestClose: () => void;
    acceptedTypes?: string;
    uploadFn: (files: File[], comments: string[]) => Promise<FileMeta | FileMeta[]>;
    onComplete?: (files: File[]) => void;
};

const DEFAULT_ACCEPT = "*";
const makeKey = (f: File) => `${f.name}:${f.size}:${f.lastModified}`;

function UploadModal({
    isOpen,
    onRequestClose,
    acceptedTypes = DEFAULT_ACCEPT,
    uploadFn,
    onComplete,
}: UploadModalProps) {
    const [files, setFiles] = useState<File[]>([]);
    const [comments, setComments] = useState<string[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [isDropzoneActive, setIsDropzoneActive] = useState(false);
    const toast = useToast();

    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const addFiles = (incoming: File[]) => {
        setFiles((prevFiles) => {
            const map = new Map<string, File>();
            prevFiles.forEach((f) => map.set(makeKey(f), f));
            incoming.forEach((f) => map.set(makeKey(f), f));
            const nextFiles = Array.from(map.values());

            // синхронизируем комментарии с результирующим списком файлов
            setComments((prevComments) => {
                const prevByKey = new Map<string, string>();
                prevFiles.forEach((f, i) => prevByKey.set(makeKey(f), prevComments[i] ?? ""));
                return nextFiles.map((f) => prevByKey.get(makeKey(f)) ?? "");
            });

            return nextFiles;
        });
    };

    const onPickFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length) {
            addFiles(Array.from(e.target.files));
            e.target.value = "";
        }
    };

    const removeFile = (idx: number) => {
        setFiles((prev) => prev.filter((_, i) => i !== idx));
        setComments((prev) => prev.filter((_, i) => i !== idx));
    };

    const triggerFileDialog = () => fileInputRef.current?.click();

    const onDropzoneDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        if (Array.from(e.dataTransfer.types).includes("Files")) {
            e.preventDefault();
            e.dataTransfer.dropEffect = "copy";
            setIsDropzoneActive(true);
        }
    };

    const onDropzoneDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        const related = e.relatedTarget;
        if (related instanceof Node && e.currentTarget.contains(related)) return;
        setIsDropzoneActive(false);
    };

    const onDropzoneDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDropzoneActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length) {
            addFiles(Array.from(e.dataTransfer.files));
        }
    };

    const handleUpload = async () => {
        if (!files.length) return;
        setIsUploading(true);
        try {
            // гарантируем, что длины совпадают, а пустые — это ""
            const safeComments =
                files.map((_, i) => (comments[i] ?? "").toString());

            await uploadFn(files, safeComments);
            onComplete?.(files);
            setFiles([]);
            setComments([]);
            onRequestClose();
        } catch (err) {
            console.error(err);
            toast({ message: "Не удалось загрузить файлы. Проверьте консоль.", type: "error" });
        } finally {
            setIsUploading(false);
        }
    };

    const acceptAttr = useMemo(() => acceptedTypes ?? DEFAULT_ACCEPT, [acceptedTypes]);

    if (!isOpen) return null;

    const onOverlayMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) onRequestClose();
    };

    const hasFiles = files.length > 0;

    return (
        <ModalPortal>
            <div className="fs-overlay" onMouseDown={onOverlayMouseDown}>
                <div className="fs-modal" role="dialog" aria-modal="true" aria-labelledby="upload-title">
                    <header className="fs-modal__header">
                        <h2 id="upload-title">Загрузка файлов</h2>
                        <button
                            type="button"
                            className="fs-modal__close"
                            aria-label="Закрыть"
                            onClick={onRequestClose}
                        >
                            <X size={21} />
                        </button>
                    </header>

                    <div
                        className={`fs-dropzone ${isDropzoneActive ? "fs-dropzone--active" : ""}`}
                        onDragOver={onDropzoneDragOver}
                        onDragLeave={onDropzoneDragLeave}
                        onDrop={onDropzoneDrop}
                        onClick={triggerFileDialog}
                        role="button"
                        aria-label="Перетащите файлы сюда или кликните для выбора"
                        tabIndex={0}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") triggerFileDialog();
                        }}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            accept={acceptAttr}
                            className="fs-dropzone__input"
                            onChange={onPickFiles}
                        />
                        <div className="fs-dropzone__inner">
                            <div className="fs-dropzone__icon">⬆️</div>
                            <div className="fs-dropzone__text">
                                Перетащите файлы сюда
                                <span className="fs-dropzone__sep">или</span>
                                <span className="fs-dropzone__link">выберите на компьютере</span>
                            </div>
                        </div>
                    </div>

                    {hasFiles && (
                        <>
                            <ul className="fs-filelist">
                                {files.map((f, i) => (
                                    <li
                                        key={`${f.name}-${f.size}-${f.lastModified}`}
                                        className="fs-file"
                                    >
                                        <div className="fs-file__meta">
                                            <span className="fs-file__name">{f.name}</span>
                                            <span className="fs-file__size">
                                                {(f.size / 1024 / 1024).toFixed(2)} MB
                                            </span>
                                        </div>

                                        <label className="fs-file__comment" aria-label="Комментарий к файлу">
                                            <input
                                                className="fs-file__comment-input"
                                                type="text"
                                                placeholder="Комментарий (необязательно)"
                                                value={comments[i] ?? ""}
                                                onChange={(e) =>
                                                    setComments((prev) =>
                                                        prev.map((c, idx) => (idx === i ? e.target.value : c))
                                                    )
                                                }
                                            />
                                        </label>

                                        <button className="fs-file__remove" onClick={() => removeFile(i)}>
                                            Удалить
                                        </button>
                                    </li>
                                ))}
                            </ul>

                            <div className="fs-actions">
                                <button className="fs-btn" disabled={isUploading} onClick={handleUpload}>
                                    {isUploading ? "Загрузка..." : "Загрузить на сервер"}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </ModalPortal>
    );
}

export default UploadModal;
