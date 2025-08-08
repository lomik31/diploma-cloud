import { type FileMeta } from "../../api/files";
import FileItem from "./FileItem";

import "./FileList.css";

function FileList({ files }: { files: FileMeta[] }) {
    return (
        <main className="filelist">
            {files.length === 0 && (
                <p className="filelist__empty">Здесь пока пусто. Загрузите первый файл 📁</p>
            )}
            {files.map((file) => <FileItem key={file.id} file={file} />)}
        </main>
    );
}
export default FileList;
