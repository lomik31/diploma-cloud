import { useMemo, useRef, useState } from "react";

export type UploadModalProps = {
    isOpen: boolean;
    onRequestClose: () => void;
    acceptedTypes?: string; // e.g. 'image/*'
    uploadFn?: (files: File[]) => Promise<void>; // optional: inject your API call
    onComplete?: (files: File[]) => void; // notify parent after successful upload
};

const DEFAULT_ACCEPT = "*";

function UploadModal({
    isOpen,
    onRequestClose,
    acceptedTypes = DEFAULT_ACCEPT,
    uploadFn,
    onComplete,
}: UploadModalProps) {
    const [files, setFiles] = useState<File[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [isDropzoneActive, setIsDropzoneActive] = useState(false);

    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const addFiles = (incoming: File[]) => {
        setFiles((prev) => {
            const map = new Map<string, File>();
            for (const f of prev) map.set(`${f.name}:${f.size}:${f.lastModified}`, f);
            for (const f of incoming) map.set(`${f.name}:${f.size}:${f.lastModified}`, f);
            return Array.from(map.values());
        });
    };

    const onPickFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length) {
            addFiles(Array.from(e.target.files));
            e.target.value = "";
        }
    };

    const removeFile = (idx: number) => setFiles((prev) => prev.filter((_, i) => i !== idx));

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
            if (uploadFn) {
                await uploadFn(files);
            } else {
                // Demo fallback: emulate network
                await new Promise((r) => setTimeout(r, 1000));
            }
            onComplete?.(files);
            setFiles([]);
            onRequestClose();
        } catch (err) {
            console.error(err);
            alert("Не удалось загрузить файлы. Проверьте консоль.");
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
                        ×
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
                                <li key={`${f.name}-${f.size}-${f.lastModified}`} className="fs-file">
                                    <div className="fs-file__meta">
                                        <span className="fs-file__name">{f.name}</span>
                                        <span className="fs-file__size">{(f.size / 1024 / 1024).toFixed(2)} MB</span>
                                    </div>
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
    );
}

export default UploadModal;
