/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

import ModalPortal from "../ModalPortal";
import { useAuth } from "../../context/AuthContextHelpers";
import { register as registerApi } from "../../api/auth";

import "../filesPage/UploadModal.css";
import "../filesPage/EditFileModal.css";
import "./AuthModal.css";

type Mode = "login" | "register";

interface Props {
  isOpen: boolean;
  onRequestClose: () => void;
}

export default function AuthModal({ isOpen, onRequestClose }: Props) {
    const [mode, setMode] = useState<Mode>("login");

    const [loginUsername, setLoginUsername] = useState("");
    const [loginPassword, setLoginPassword] = useState("");
    const [loginError, setLoginError] = useState<string | null>(null);

    const [rUser, setRUser] = useState("");
    const [rEmail, setREmail] = useState("");
    const [rFullname, setRFullname] = useState("");
    const [rPass1, setRPass1] = useState("");
    const [rPass2, setRPass2] = useState("");
    const [registerError, setRegisterError] = useState<string | null>(null);
    const [regFieldErrors, setRegFieldErrors] = useState<Record<string, string[]>>({});
    const [loginFieldErrors, setLoginFieldErrors] = useState<Record<string, string[]>>({});

    const [isSubmitting, setIsSubmitting] = useState(false);

    const { user, login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const onEsc = (e: KeyboardEvent) => e.key === "Escape" && onRequestClose();
        if (isOpen)
            window.addEventListener("keydown", onEsc);
        return () => window.removeEventListener("keydown", onEsc);
    }, [isOpen, onRequestClose]);


    useEffect(() => {
        if (isOpen && user?.isLoggedIn) {
            navigate("/files", { replace: true });
        }
    }, [isOpen, user?.isLoggedIn, navigate]);


    const closeAndPopLoginFromPath = () => {
        const hasBackground = location.state?.background != null;
        if (hasBackground)
            navigate(-1);
        else
            navigate("/", { replace: true });
        onRequestClose();
    };

    const canLogin = loginUsername.trim().length > 0 && loginPassword.trim().length > 0;
    const canRegister =
    rUser.trim() && rEmail.trim() && rFullname.trim() && rPass1.trim() && rPass1 === rPass2;

    const handleLogin = async () => {
        if (!canLogin || isSubmitting) return;
        setIsSubmitting(true);
        setLoginError(null);
        setLoginFieldErrors({});
        try {
            await login(loginUsername.trim(), loginPassword.trim());
            navigate("/files", { replace: true });
        } catch (e: unknown) {
            const err = e as { response?: { status?: number; data?: unknown }, status?: number };
            const status = err.response?.status ?? err.status;
            if (status === 400 && err.response?.data && typeof err.response.data === "object") {
                const raw = err.response.data as Record<string, unknown>;
                const normalized: Record<string, string[]> = {};
                for (const [k, v] of Object.entries(raw)) {
                    if (Array.isArray(v)) normalized[k] = v.map(String);
                    else if (typeof v === "string") normalized[k] = [v];
                }
                if (typeof raw.detail === "string") {
                    normalized.non_field_errors = [...(normalized.non_field_errors ?? []), String(raw.detail)];
                }
                setLoginFieldErrors(normalized);
            } else if (status === 401) {
                setLoginError("Неверный логин или пароль. Попробуйте ещё раз.");
            } else if (status === 429) {
                setLoginError("Слишком много попыток. Подождите немного и повторите.");
            } else {
                setLoginError("Не удалось выполнить вход. Проверьте данные и соединение.");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRegister = async () => {
        if (!canRegister || isSubmitting)
            return;
        setIsSubmitting(true);
        setRegisterError(null);
        setRegFieldErrors({});
        try {
            await registerApi(rUser.trim(), rEmail.trim(), rFullname.trim(), rPass1.trim());
            await login(rUser.trim(), rPass1.trim());
        } catch (e: unknown) {
            const err = e as { response?: { status?: number; data?: unknown }, status?: number };
            const status = err.response?.status ?? err.status;
            if (status === 400 && err.response?.data && typeof err.response.data === "object") {
                const raw = err.response.data as Record<string, unknown>;
                const normalized: Record<string, string[]> = {};
                for (const [key, val] of Object.entries(raw)) {
                    if (Array.isArray(val)) normalized[key] = val.map(String);
                    else if (typeof val === "string") normalized[key] = [val];
                }
                setRegFieldErrors(normalized);
            } else if (status === 409) {
                setRegisterError("Такой пользователь уже существует.");
            } else {
                setRegisterError("Не удалось зарегистрироваться. Попробуйте ещё раз.");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (mode === "login")
            handleLogin();
        else
            handleRegister();
    };

    if (!isOpen)
        return null;

    return (
        <ModalPortal>
            <div className="fs-overlay" onMouseDown={(e) => e.target === e.currentTarget && closeAndPopLoginFromPath()}>
                <div className="fs-modal" role="dialog" aria-modal="true" aria-labelledby="auth-title">
                    <header className="fs-modal__header">
                        <h2 id="auth-title">{mode === "login" ? "Войти в аккаунт" : "Создать аккаунт"}</h2>
                        <button
                            type="button"
                            className="fs-modal__close"
                            aria-label="Закрыть"
                            onClick={closeAndPopLoginFromPath}
                        >
                            <X size={21} />
                        </button>
                    </header>

                    <div className="auth-tabs" role="tablist" aria-label="Переключение режима">
                        <button
                            className={`auth-tab ${mode === "login" ? "auth-tab--active" : ""}`}
                            role="tab"
                            aria-selected={mode === "login"}
                            onClick={() => setMode("login")}
                        >
                            Войти
                        </button>
                        <button
                            className={`auth-tab ${mode === "register" ? "auth-tab--active" : ""}`}
                            role="tab"
                            aria-selected={mode === "register"}
                            onClick={() => setMode("register")}
                        >
                            Регистрация
                        </button>
                    </div>

                    {mode === "login" ? (
                        <form className="fm-form" onSubmit={onSubmit}>
                            <label className="fm-field">
                                <span className="fm-label">Логин</span>
                                <input
                                    className="fm-input"
                                    value={loginUsername}
                                    onChange={(e) => {
                                        setLoginUsername(e.target.value);
                                        if (loginError)
                                            setLoginError(null);
                                        setLoginFieldErrors((prev) => {
                                            if (!prev.username) return prev;
                                            const { username, ...rest } = prev;
                                            return rest;
                                        });
                                    }}
                                    placeholder="username"
                                    autoFocus
                                />
                                {loginFieldErrors.username?.map((m, i) => (
                                    <div key={i} className="auth-error" role="alert">{m}</div>
                                ))}
                            </label>
                            <label className="fm-field">
                                <span className="fm-label">Пароль</span>
                                <input
                                    className="fm-input"
                                    type="password"
                                    value={loginPassword}
                                    onChange={(e) => {
                                        setLoginPassword(e.target.value);
                                        if (loginError)
                                            setLoginError(null);
                                        setLoginFieldErrors((prev) => {
                                            if (!prev.password) return prev;
                                            const { password, ...rest } = prev;
                                            return rest;
                                        });
                                    }}
                                />
                                {loginFieldErrors.password?.map((m, i) => (
                                    <div key={i} className="auth-error" role="alert">{m}</div>
                                ))}
                            </label>

                            {loginFieldErrors.non_field_errors?.map((m, i) => (
                                <div key={i} className="auth-error auth-error--block" role="alert">{m}</div>
                            ))}

                            {loginError && <div className="auth-error auth-error--block" role="alert">{loginError}</div>}

                            <div className="fs-actions">
                                <button
                                    type="button"
                                    className="fm-cancel"
                                    onClick={closeAndPopLoginFromPath}
                                    disabled={isSubmitting}
                                >
                                    Отмена
                                </button>
                                <button type="submit" className="fs-btn" disabled={!canLogin || isSubmitting}>
                                    {isSubmitting ? "Входим..." : "Войти"}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <form className="fm-form" onSubmit={onSubmit}>
                            <label className="fm-field">
                                <span className="fm-label">Логин</span>
                                <input
                                    className="fm-input"
                                    value={rUser}
                                    onChange={(e) => {
                                        setRUser(e.target.value);
                                        if (registerError)
                                            setRegisterError(null);
                                        setRegFieldErrors((prev) => {
                                            if (!prev.username) return prev;
                                            const { username, ...rest } = prev;
                                            return rest;
                                        });
                                    }}
                                    placeholder="username"
                                    autoFocus
                                />
                                {regFieldErrors.username?.map((m, i) => (
                                     <div key={i} className="auth-error" role="alert">{m}</div>
                                ))}
                            </label>
                            <label className="fm-field">
                                <span className="fm-label">Email</span>
                                <input
                                    className="fm-input"
                                    type="email"
                                    value={rEmail}
                                    onChange={(e) => {
                                        setREmail(e.target.value);
                                        if (registerError)
                                            setRegisterError(null);
                                        setRegFieldErrors((prev) => {
                                            if (!prev.email) return prev;
                                            const { email, ...rest } = prev;
                                            return rest;
                                        });
                                    }}
                                    placeholder="user@example.com"
                                />
                            </label>
                            <label className="fm-field">
                                <span className="fm-label">Полное имя</span>
                                <input
                                    className="fm-input"
                                    value={rFullname}
                                    onChange={(e) => {
                                        setRFullname(e.target.value);
                                        if (registerError)
                                            setRegisterError(null);
                                        }}
                                    placeholder="Иванов Иван Иванович"
                                />
                                {regFieldErrors.email?.map((m, i) => (
                                    <div key={i} className="auth-error" role="alert">{m}</div>
                                ))}
                            </label>
                            <label className="fm-field">
                                <span className="fm-label">Пароль</span>
                                <input
                                    className="fm-input"
                                    type="password"
                                    value={rPass1}
                                    onChange={(e) => {
                                        setRPass1(e.target.value);
                                        if (registerError)
                                            setRegisterError(null);
                                        setRegFieldErrors((prev) => {
                                            if (!prev.fullname) return prev;
                                            const { fullname, ...rest } = prev;
                                            return rest;
                                        });
                                    }}
                                />
                                {regFieldErrors.fullname?.map((m, i) => (
                                    <div key={i} className="auth-error" role="alert">{m}</div>
                                ))}
                            </label>
                            <label className="fm-field">
                                <span className="fm-label">Повтор пароля</span>
                                <input
                                    className="fm-input"
                                    type="password"
                                    value={rPass2}
                                    onChange={(e) => {
                                        setRPass2(e.target.value);
                                        if (registerError)
                                            setRegisterError(null);
                                        setRegFieldErrors((prev) => {
                                            if (!prev.password) return prev;
                                            const { password, ...rest } = prev;
                                            return rest;
                                        });
                                    }}
                                />
                                {regFieldErrors.password?.map((m, i) => (
                                    <div key={i} className="auth-error" role="alert">{m}</div>
                                ))}
                            </label>

                            {rPass1 && rPass2 && rPass1 !== rPass2 && (
                                <div className="auth-error" role="alert">Пароли не совпадают</div>
                            )}
                            {regFieldErrors.non_field_errors?.map((m, i) => (
                                <div key={i} className="auth-error auth-error--block" role="alert">{m}</div>
                            ))}
                            {registerError && <div className="auth-error auth-error--block" role="alert">{registerError}</div>}

                            <div className="fs-actions">
                                <button
                                    type="button"
                                    className="fm-cancel"
                                    onClick={closeAndPopLoginFromPath}
                                    disabled={isSubmitting}
                                >
                                    Отмена
                                </button>
                                <button type="submit" className="fs-btn" disabled={!canRegister || isSubmitting}>
                                    {isSubmitting ? "Создаём..." : "Зарегистрироваться"}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </ModalPortal>
    );
}
