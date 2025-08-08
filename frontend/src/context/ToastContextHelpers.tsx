import { createContext, useContext } from "react";
import type { ToastInput } from "./ToastContext";

export const ToastContext = createContext<(toast: ToastInput) => void>(() => {});

export const useToast = () => useContext(ToastContext);
