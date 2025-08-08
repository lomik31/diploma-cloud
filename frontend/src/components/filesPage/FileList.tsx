import FileItem from "./FileItem";
import { type FileMeta } from "../../api/files";

function FileList({ files }: { files: FileMeta[] }) {
    return (
        <main className="content">
            {files.length === 0 && (
                <p className="empty">Здесь пока пусто. Загрузите первый файл 📁</p>
            )}

            {files.map((file) => (
                <FileItem
                    file={file} />
            ))}
        </main>
    );
};

export default FileList;
