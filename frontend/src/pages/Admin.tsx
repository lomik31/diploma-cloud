import { useQuery } from "@tanstack/react-query";

import { getUsers, type UserMeta } from "../api/users";
import NavBar from "../components/Navbar";
import UserList from "../components/adminPage/UserList";

import "./Storage.css";


function AdminPage() {
    const usersQuery = useQuery<UserMeta[]>({
        queryKey: ["users"],
        queryFn: getUsers,
    });

    return (
        <div className="fs-page">
            <NavBar />

            <main className="fs-content">
                {usersQuery.isLoading && <p>Загрузка…</p>}
                {usersQuery.error && <p>Не удалось загрузить пользователей</p>}
                {usersQuery.data && <UserList users={usersQuery.data} />}
            </main>
        </div>
    );
}

export default AdminPage;
