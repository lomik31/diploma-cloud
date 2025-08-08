import { createContext, useContext } from "react";

export type UploadModalReason = "global" | "manual";

export interface UploadModalContextValue {
    isOpen: boolean;
    open: (reason?: UploadModalReason) => void;
    close: () => void;
};

export const UploadModalContext = createContext<UploadModalContextValue | null>(null);

export function useUploadModal(): UploadModalContextValue {
    const ctx = useContext(UploadModalContext);
    if (!ctx) throw new Error("useUploadModal must be used within UploadModalProvider");
    return ctx;
}
