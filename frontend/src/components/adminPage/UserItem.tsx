import { Link } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash } from "lucide-react";

import { type UserMeta, updateUser, deleteUser } from "../../api/users";

import "./UserItem.css";


interface Props {
    user: UserMeta;
}

function UserItem({ user }: Props) {
    const qc = useQueryClient();

    const toggleMutation = useMutation({
        mutationFn: (next: boolean) => updateUser(user.id, { is_staff: next }),
        onMutate: async (next) => {
            await qc.cancelQueries({ queryKey: ["users"] });
            const prev = qc.getQueryData<UserMeta[]>(["users"]);
            qc.setQueryData<UserMeta[]>(["users"], (old) =>
                (old ?? []).map(u => u.id === user.id ? { ...u, is_staff: next } : u)
            );
            return { prev };
        },
        onError: (_e, _v, ctx) => ctx?.prev && qc.setQueryData(["users"], ctx.prev),
        onSuccess: (updated: UserMeta) => {
            qc.setQueryData<UserMeta[]>(["users"], (old) =>
                (old ?? []).map(u => u.id === updated.id ? updated : u)
            );
        },
        onSettled: () => qc.invalidateQueries({ queryKey: ["users"] }),
    });

    const delMutation = useMutation({
        mutationFn: () => deleteUser(user.id),
        onMutate: async () => {
            await qc.cancelQueries({ queryKey: ["users"] });
            const prev = qc.getQueryData<UserMeta[]>(["users"]);
            qc.setQueryData<UserMeta[]>(["users"], (old) => (old ?? []).filter(u => u.id !== user.id));
            return { prev };
        },
        onError: (_e, _v, ctx) => ctx?.prev && qc.setQueryData(["users"], ctx.prev),
        onSettled: () => qc.invalidateQueries({ queryKey: ["users"] }),
    });

    const storageLink = `/files/${user.id}/`;

    return (
        <div className="admin-card">
            <div className="admin-grid">
                <div className="admin-col">
                    <div className="admin-username">{user.username}</div>
                    <div className="admin-email">{user.email}</div>
                </div>

                <div className="admin-col">
                    <div className="admin-fullname">{user.fullname}</div>
                    <div className="admin-meta">
                        <Link
                            to={storageLink}
                            className="admin-files-link"
                            title="Открыть хранилище пользователя"
                        >
                            файлов: {user.files_count} / {user.total_size_h}
                        </Link>
                    </div>
                </div>

                <div className="admin-empty">
                </div>

                <div className="admin-col admin-col--center">
                    <label className="admin-check">
                        <input
                            type="checkbox"
                            checked={user.is_staff}
                            onChange={(e) => toggleMutation.mutate(e.target.checked)}
                            disabled={toggleMutation.isPending}
                        />
                        <span>админ?</span>
                    </label>
                </div>

                <div className="admin-actions">
                    <button
                        className="admin-iconbtn"
                        onClick={() => {
                            if (!window.confirm("Удалить пользователя вместе с файлами?")) return;
                            delMutation.mutate();
                        }}
                        disabled={delMutation.isPending}
                        aria-label="Удалить пользователя"
                        title="Удалить пользователя"
                    >
                        <Trash />
                    </button>
                </div>
            </div>
        </div>
    );
}

export default UserItem;
