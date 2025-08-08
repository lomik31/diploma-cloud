export function isAuthenticated(): boolean {
    return !!sessionStorage.getItem("access_token") && !!localStorage.getItem("refresh_token");
}
