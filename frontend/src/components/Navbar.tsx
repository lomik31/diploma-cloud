import { Link } from "react-router-dom";
import { Cloud } from "lucide-react";

import "./Navbar.css";


interface Props {
    isAuth: boolean;
    brandToMain?: boolean; // If true, brand link goes to main page, otherwise to files page
    rightSlot1?: React.ReactNode;
    rightSlot2?: React.ReactNode;
};

function NavBar({ isAuth, rightSlot1, rightSlot2, brandToMain }: Props) {
    const brandTo = brandToMain ? "/" : "/files";

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
                    <Link to={isAuth ? "/login" : "/login"} className="navbar__btn">
                        {isAuth ? "Выйти" : "Войти"}
                    </Link>
                </div>
            </div>
        </header>
    );
}

export default NavBar;
