import { Link } from "react-router-dom";
import { Cloud } from "lucide-react";

import { useAuth } from "../context/AuthContextHelpers";

import "./Navbar.css";


interface Props {
    brandToMain?: boolean; // If true, brand link goes to main page, otherwise to files page
    rightSlot1?: React.ReactNode;
    rightSlot2?: React.ReactNode;
};

function NavBar({rightSlot1, rightSlot2, brandToMain }: Props) {
    const brandTo = brandToMain ? "/" : "/files";
    const { logout, user } = useAuth();

    return (
        <header className="navbar">
            <div className="navbar__inner">
                <Link to={brandTo} className="navbar__brand" aria-label="На главную">
                    {/* <span className="navbar__logo" aria-hidden>☁️</span> */}
                    <span className="navbar__title">ломка
                        <Cloud className="navbar__icon" />
                    </span>
                </Link>

                <div className="navbar__actions">
                    {rightSlot1}
                    {rightSlot2}
                    {user?.isLoggedIn ? (
                        <Link to="/" className="navbar__btn" onClick={() => {
                            logout();
                            window.location.replace("/login");
                        }}>
                            Выйти
                        </Link>
                    ) : (
                        <Link to="/login" className="navbar__btn">Войти</Link>
                    )}
                </div>
            </div>
        </header>
    );
}

export default NavBar;
