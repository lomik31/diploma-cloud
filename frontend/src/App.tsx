import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { AuthProvider } from "./context/AuthContext";
import ToastProvider from "./context/ToastContext";
import AuthModal from "./components/welcomePage/AuthModal";
import StoragePage from "./pages/Storage";
import MainPage from "./pages/Welcome";
import AdminPage from "./pages/Admin";

import "./App.css";

const qc = new QueryClient();



function RoutesWithModal() {
  const location = useLocation();
  const state = location.state as { background?: Location } | undefined;

  const isLogin = location.pathname === "/login";

    return (
        <>
            <Routes location={state?.background ?? location}>
                <Route path="/" element={<MainPage />} />
                <Route path="/login" element={<MainPage />} />
                <Route path="/files" element={<StoragePage />} />
                <Route path="/files/:owner" element={<StoragePage />} />
                <Route path="/admin" element={<AdminPage />} />
            </Routes>

            {isLogin && <AuthModal isOpen={true} onRequestClose={() => {}} />}
        </>
    );
}

function AppContent() {
    return (
         <BrowserRouter>
            <RoutesWithModal />
        </BrowserRouter>
    );
}

function App() {
    return (
        <AuthProvider>
        <ToastProvider>
            <QueryClientProvider client={qc}>
                <AppContent />
            </QueryClientProvider>
        </ToastProvider>
        </AuthProvider>
    );
};

export default App
