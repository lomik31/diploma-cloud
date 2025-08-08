import { useUploadModal } from "../../context/UploadModalContextHelpers";

export type UploadButtonProps = {
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
