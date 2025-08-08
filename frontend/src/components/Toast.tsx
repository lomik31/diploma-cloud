import { useEffect } from "react";
import { X } from "lucide-react";

import { type ToastInput } from "../context/ToastContext";

function Toast({ message, type, duration, onClose }: ToastInput & { onClose: () => void }) {
    useEffect(() => {
        const id = setTimeout(onClose, duration);
        return () => clearTimeout(id);
    }, [duration, onClose]);

    return (
        <div className={`toast toast-${type}`}>
            <span className="toast-msg">{message}</span>
            <button className="toast-close" onClick={onClose} aria-label="Close">
                <X size={14} />
            </button>
        </div>
    );
}

export default Toast;
