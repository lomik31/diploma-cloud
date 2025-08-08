import { useEffect, useMemo, useState } from "react";

import { UploadModalContext, type UploadModalContextValue, type UploadModalReason } from "./UploadModalContextHelpers";
import UploadModal from "../components/filesPage/UploadModal";


export type UploadModalProviderProps = {
    children: React.ReactNode;
    acceptedTypes?: string;
    uploadFn?: (files: File[]) => Promise<void>;
    onComplete?: (files: File[]) => void;
};

export function UploadModalProvider({ children, acceptedTypes = "*", uploadFn, onComplete }: UploadModalProviderProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [reason, setReason] = useState<UploadModalReason | null>(null);

    const open = (r: UploadModalReason = "manual") => {
        setIsOpen(true);
        setReason(r);
    };

    const close = () => {
        setIsOpen(false);
        setReason(null);
    };

    // --- Global DnD handlers live here so any page can benefit ---
    useEffect(() => {
        const hasDraggedFiles = (evt: DragEvent) => !!evt.dataTransfer && Array.from(evt.dataTransfer.types || []).includes("Files");

        const handleWindowDragEnter = (evt: DragEvent) => {
            if (!hasDraggedFiles(evt)) return;
            if (!isOpen) open("global");
        };

        const handleWindowDragOver = (evt: DragEvent) => {
            if (!hasDraggedFiles(evt)) return;
            evt.preventDefault();
        };

        const handleWindowDrop = (evt: DragEvent) => {
            if (!hasDraggedFiles(evt)) return;
            evt.preventDefault();
            if (isOpen && reason === "global") {
                const target = evt.target;
                const modalEl = document.querySelector<HTMLDivElement>(".fs-modal");
                if (!modalEl || !(target instanceof Node) || !modalEl.contains(target)) {
                    close();
                }
            }
        };

        const handleDocDragLeave = (evt: DragEvent) => {
            if (isOpen && reason === "global") {
                const { clientX: x, clientY: y } = evt;
                const rect = document.documentElement.getBoundingClientRect();
                const leftWindow = x <= rect.left || x >= rect.right || y <= rect.top || y >= rect.bottom;
                if (leftWindow) close();
            }
        };

        window.addEventListener("dragenter", handleWindowDragEnter, { passive: false });
        window.addEventListener("dragover", handleWindowDragOver, { passive: false });
        window.addEventListener("drop", handleWindowDrop, { passive: false });
        document.addEventListener("dragleave", handleDocDragLeave, { passive: true });

        return () => {
            window.removeEventListener("dragenter", handleWindowDragEnter);
            window.removeEventListener("dragover", handleWindowDragOver);
            window.removeEventListener("drop", handleWindowDrop);
            document.removeEventListener("dragleave", handleDocDragLeave);
        };
    }, [isOpen, reason]);

    const value = useMemo<UploadModalContextValue>(() => ({ isOpen, open, close }), [isOpen]);

    return (
        <UploadModalContext.Provider value={value}>
            {children}
            <UploadModal isOpen={isOpen} onRequestClose={close} acceptedTypes={acceptedTypes} uploadFn={uploadFn} onComplete={onComplete} />
        </UploadModalContext.Provider>
    );
}
