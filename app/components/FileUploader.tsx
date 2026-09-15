import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { formatSize } from '../lib/utils'

interface FileUploaderProps {
    onFileSelect?: (file: File | null) => void;
}

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

const FileUploader = ({ onFileSelect }: FileUploaderProps) => {
    const [file, setFile] = useState<File | null>(null);
    const [rejection, setRejection] = useState<string | null>(null);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const next = acceptedFiles[0] || null;
        setRejection(null);
        setFile(next);
        onFileSelect?.(next);
    }, [onFileSelect]);

    const onDropRejected = useCallback(() => {
        setRejection('THAT FILE IS NOT A PDF UNDER 20 MB');
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        onDropRejected,
        multiple: false,
        accept: { 'application/pdf': ['.pdf'] },
        maxSize: MAX_FILE_SIZE,
    })

    const clear = () => {
        setFile(null);
        onFileSelect?.(null);
    };

    return (
        <div className="flex flex-col gap-4 w-full">
            <div
                {...getRootProps()}
                className={`border border-dashed px-8 py-12 text-center flex flex-col items-center gap-4
                    cursor-pointer transition-colors duration-150 ${
                        isDragActive
                            ? 'border-accent bg-accent/10'
                            : 'border-accent/40 bg-accent/[0.04] hover:border-accent/70'
                    }`}
            >
                <input {...getInputProps()} />
                <div className="w-[62px] h-[62px] border border-accent/40 flex items-center justify-center">
                    <div className="w-0.5 h-[30px] bg-accent" />
                </div>
                <div className="text-lg md:text-[19px] font-medium">
                    Drop a PDF, or <span className="text-accent">choose a file</span>
                </div>
                <div className="mono-faint">PDF · MAX {formatSize(MAX_FILE_SIZE)}</div>
            </div>

            {rejection && (
                <div className="font-mono uppercase text-[11px] tracking-[0.14em] text-flag">
                    {rejection}
                </div>
            )}

            {file && (
                <div className="flex items-center justify-between gap-4 panel px-4.5 py-4">
                    <div className="flex items-center gap-3.5 min-w-0">
                        <img src="/images/pdf.png" alt="" className="w-8.5 h-8.5 object-contain" />
                        <div className="min-w-0">
                            <div className="text-base font-medium truncate">{file.name}</div>
                            <div className="mono-faint">{formatSize(file.size)} · PDF</div>
                        </div>
                    </div>
                    <button
                        type="button"
                        className="font-mono uppercase text-[11px] tracking-[0.14em] text-dim hover:text-ink cursor-pointer shrink-0"
                        onClick={clear}
                    >
                        REMOVE
                    </button>
                </div>
            )}
        </div>
    )
}

export default FileUploader
