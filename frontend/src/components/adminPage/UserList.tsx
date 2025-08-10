import { type UserMeta } from "../../api/users";
import UserItem from "./UserItem";

import "./UserList.css";


function UserList({ users }: { users: UserMeta[] }) {
    console.log(users);
    return (
        <main className="admin-list">
            {users.length === 0 && (
                <p className="admin-empty">Пока нет пользователей.</p>
            )}
            {users.map((u) => <UserItem key={u.id} user={u} />)}
        </main>
    );
}

export default UserList;
