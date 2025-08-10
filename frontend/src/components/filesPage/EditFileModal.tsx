import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react";

import { updateFileMeta, type FileMeta } from "../../api/files";
import { useToast } from "../../context/ToastContextHelpers";
import ModalPortal from "../ModalPortal";

import "./EditFileModal.css";
import "./UploadModal.css";

interface Props {
    isOpen: boolean;
    onRequestClose: () => void;
    file: FileMeta;
}

function EditFileModal({ isOpen, onRequestClose, file }: Props) {
    const [name, setName] = useState(file.filename);
    const [comment, setComment] = useState(file.comment ?? "");
    const qc = useQueryClient();
    const toast = useToast();

    useEffect(() => {
        if (isOpen) {
            setName(file.filename);
            setComment(file.comment ?? "");
        }
    }, [isOpen, file]);

    useEffect(() => {
        const onEsc = (e: KeyboardEvent) => e.key === "Escape" && onRequestClose();
        if (isOpen) window.addEventListener("keydown", onEsc);
        return () => window.removeEventListener("keydown", onEsc);
    }, [isOpen, onRequestClose]);

    const mutation = useMutation({
        mutationFn: () => updateFileMeta(file.id, name.trim(), comment.trim()),
        onSuccess: (updated) => {
            // Обновляем кэш списка файлов
            qc.setQueryData<FileMeta[]>(["files"], (prev) =>
                prev?.map((f) => (f.id === updated.id ? updated : f)) ?? prev
            );
            toast({ message: "Изменения сохранены" });
            onRequestClose();
        },
        onError: () => {
            toast({ message: "Не удалось сохранить изменения", type: "error" });
        },
    });

    if (!isOpen)
        return null;

    const onOverlayMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) onRequestClose();
    };

    const isDirty =
        name.trim() !== (file.filename ?? "").trim() ||
        (comment ?? "") !== (file.comment ?? "");

    return (
        <ModalPortal>
            <div className="fs-overlay" onMouseDown={onOverlayMouseDown}>
                <div className="fs-modal" role="dialog" aria-modal="true" aria-labelledby="edit-title">
                    <header className="fs-modal__header">
                        <h2 id="edit-title">Переименовать файл</h2>
                        <button
                            type="button"
                            className="fs-modal__close"
                            aria-label="Закрыть"
                            onClick={onRequestClose}
                        >
                            <X size={21}/>
                        </button>
                    </header>

                    <form
                        className="fm-form"
                        onSubmit={(e) => {
                            e.preventDefault();
                            if (!name.trim())
                                return;
                            mutation.mutate();
                        }}
                    >
                        <label className="fm-field">
                            <span className="fm-label">Название</span>
                            <input
                                className="fm-input"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Новое имя файла"
                                autoFocus
                            />
                        </label>

                        <label className="fm-field">
                            <span className="fm-label">Комментарий</span>
                            <textarea
                                className="fm-input fm-textarea"
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                rows={3}
                                placeholder="Комментарий к файлу"
                            />
                        </label>

                        <div className="fs-actions">
                            <button
                                type="button"
                                className="fm-cancel"
                                onClick={onRequestClose}
                                disabled={mutation.isPending}
                            >
                                Отмена
                            </button>
                            <button
                                type="submit"
                                className="fs-btn"
                                disabled={!isDirty || !name.trim() || mutation.isPending}
                            >
                                {mutation.isPending ? "Сохранение..." : "Сохранить"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </ModalPortal>
    );
}

export default EditFileModal;
