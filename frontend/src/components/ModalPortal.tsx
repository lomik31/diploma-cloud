import { createPortal } from "react-dom";

export default function ModalPortal({ children }: { children: React.ReactNode }) {
    const host = document.getElementById("modal-root") ?? document.body;
    return createPortal(children, host);
}
