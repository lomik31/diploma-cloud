import { useUploadModal } from "../../context/UploadModalContextHelpers";

interface UploadButtonProps {
    label?: string;
    className?: string;
};

function UploadButton({ label = "Загрузить файлы", className = "fs-btn" }: UploadButtonProps) {
    const { open } = useUploadModal();
    return (
        <button onClick={() => open("manual")} className={className}>
            {label}
        </button>
    );
}

export default UploadButton;
