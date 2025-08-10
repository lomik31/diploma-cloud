import { CloudUpload } from "lucide-react";

import { useUploadModal } from "../../context/UploadModalContextHelpers";


interface UploadButtonProps {
    label?: string;
    className?: string;
};

function UploadButton({ className = "fs-btn" }: UploadButtonProps) {
    const { open } = useUploadModal();
    return (
        <button onClick={() => open("manual")} className={className} title="Загрузить файл(ы)">
            <CloudUpload size={21}/>
        </button>
    );
}

export default UploadButton;
