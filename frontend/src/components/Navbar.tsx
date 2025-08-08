function NavBar({ isAuth, rightSlot1, rightSlot2 }: { isAuth: boolean, rightSlot1?: React.ReactNode, rightSlot2?: React.ReactNode }) {
    return (
        <header className="navbar">
            <div className="nav-inner">
                <h1 className="logo">ломка Drive</h1>
                <div className="nav-actions">
                    {rightSlot1}
                    {rightSlot2}
                    <button className="btn">{isAuth ? "Logout" : "Login"}</button>
                </div>
            </div>
        </header>
    )
}

export default NavBar;
