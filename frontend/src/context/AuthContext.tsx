import React, { useState } from "react";
import { AuthContext } from "./AuthContextHelpers";
import { login as loginFn, logout as logoutFn, type User } from "../api/auth";


export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);

    const login = async (username: string, password: string) => {
        const user = await loginFn(username, password);
        setUser(user);
    };

    const logout = async () => {
        await logoutFn();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}
