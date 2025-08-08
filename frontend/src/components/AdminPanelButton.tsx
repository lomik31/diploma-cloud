import { Link } from "react-router-dom";
import { CircleUserRound } from "lucide-react";

import "./AdminPanelButton.css";


function AdminPanelButton() {
    return (
        <Link to="/admin" className="adminbtn" aria-label="Админка" title="Админка">
            <CircleUserRound className="adminbtn__icon" />
        </Link>
    );
}

export default AdminPanelButton;
