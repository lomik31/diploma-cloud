import { useContext, createContext } from "react";
import { type User } from "../api/auth";

export interface AuthContextValue {
    user: User | null;
    login: (username: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
}
