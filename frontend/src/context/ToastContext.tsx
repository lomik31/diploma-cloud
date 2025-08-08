import { useState, useCallback } from "react";

import { ToastContext } from "./ToastContextHelpers";
import Toast from "../components/Toast";

import "../components/Toast.css";

interface ToastProps {
    id: number;
    message: string;
    type: "info" | "error";
    duration?: number;
}

export interface ToastInput {
    message: string;
    type?: "info" | "error";
    duration?: number;
}


export default function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<ToastProps[]>([]);

    const push = useCallback(({ message, type = "info", duration = 3000 }: ToastInput) => {
        const id = Date.now();
        setToasts((prev) => [...prev, { id, message, type, duration }]);
    }, []);

    const remove = useCallback((id: number) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={push}>
        {children}
        {/* Контейнер, фиксированный в углу экрана */}
        <div className="toast-container">
            {toasts.map((toast) => (
            <Toast key={toast.id} {...toast} onClose={() => remove(toast.id)} />
            ))}
        </div>
        </ToastContext.Provider>
    );
}
