import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { updateFileMeta, type FileMeta } from "../../api/files";
import { useToast } from "../../context/ToastContextHelpers";
import ModalPortal from "../ModalPortal";

import "./EditFileModal.css";

interface EditFileModalProps {
    isOpen: boolean;
    onRequestClose: () => void;
    file: FileMeta;
};

function EditFileModal({ isOpen, onRequestClose, file }: EditFileModalProps) {
    const [name, setName] = useState(file.filename);
    const [comment, setComment] = useState(file.comment ?? "");

    const qc = useQueryClient();
    const toast = useToast();

    useEffect(() => {
        if (!isOpen)
            return;
        setName(file.filename);
        setComment(file.comment ?? "");
    }, [file, isOpen]);

    const saveMutation = useMutation({
        mutationFn: () => updateFileMeta(file.id, name.trim(), comment.trim()),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["files"] });
            toast({ message: "Изменения сохранены" });
            onRequestClose();
        },
        onError: () => toast({ message: "Не удалось сохранить изменения", type: "error" }),
    });

    if (!isOpen)
        return null;

    const onOverlayMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) onRequestClose();
    };

    return (
        <ModalPortal>
            <div className="fs-em-overlay" onMouseDown={onOverlayMouseDown}>
                <div className="fs-em-modal" role="dialog" aria-modal="true" aria-labelledby="edit-title">
                    <div className="fs-em-overlay" onMouseDown={onOverlayMouseDown}>
                        <div className="fs-em-modal" role="dialog" aria-modal="true" aria-labelledby="edit-title">
                            <header className="fs-em-header">
                                <h2 id="edit-title">Переименовать файл</h2>
                                <button className="fs-em-close" aria-label="Закрыть" onClick={onRequestClose}>×</button>
                            </header>

                            <div className="fs-em-body">
                                <label className="fs-em-field">
                                    <span className="fs-em-label">Название</span>
                                    <input
                                        className="fs-em-input"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Новое имя файла"
                                    />
                                </label>

                                <label className="fs-em-field">
                                    <span className="fs-em-label">Комментарий</span>
                                    <input
                                        className="fs-em-input"
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        placeholder="Комментарий к файлу"
                                    />
                                </label>
                            </div>

                            <div className="fs-em-actions">
                                <button
                                    className="fs-em-btn"
                                    onClick={() => saveMutation.mutate()}
                                    disabled={saveMutation.isPending || !name.trim()}
                                >
                                    {saveMutation.isPending ? "Сохранение..." : "Сохранить"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ModalPortal>
    );
}

export default EditFileModal;
