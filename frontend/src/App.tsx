import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Route, Routes } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import ToastProvider from "./context/ToastContext";
import StoragePage from "./pages/Storage";
import MainPage from "./pages/Welcome";

import "./App.css";

const qc = new QueryClient();


function AppContent() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<MainPage />} />
                <Route path="/files" element={<StoragePage />} />
            </Routes>
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
