import { useCallback, useState } from 'react';
import { Upload, AlertCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

interface FileDropZoneProps {
    onFileSelect: (file: File) => void;
}

export function FileDropZone({ onFileSelect }: FileDropZoneProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        setError(null);

        const files = Array.from(e.dataTransfer.files);
        if (files.length === 0) return;

        const file = files[0];
        // Basic validation
        const validTypes = ['image/jpeg', 'image/png', 'application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
        if (!validTypes.includes(file.type)) {
            setError("Unsupported file type. Please upload JPG, PNG, PDF, DOCX, or TXT.");
            return;
        }

        onFileSelect(file);
    }, [onFileSelect]);

    const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            setError(null);
            onFileSelect(files[0]);
        }
    }, [onFileSelect]);

    return (
        <label
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
                "relative flex flex-col items-center justify-center w-full h-full min-h-[300px] rounded-2xl border-2 border-dashed transition-all cursor-pointer overflow-hidden group",
                isDragging
                    ? "border-primary bg-primary/10 shadow-[0_0_30px_rgba(59,130,246,0.2)] scale-[0.99]"
                    : "border-white/10 hover:border-white/20 hover:bg-white/5",
                error ? "border-red-500/50 bg-red-500/5" : ""
            )}
        >
            <input
                type="file"
                className="hidden"
                onChange={handleFileInput}
                accept=".jpg,.jpeg,.png,.pdf,.docx,.txt"
            />

            <div className="flex flex-col items-center gap-4 p-8 text-center z-10">
                <div className={cn(
                    "w-20 h-20 rounded-full flex items-center justify-center transition-all duration-500",
                    isDragging ? "bg-primary text-black" : "bg-white/5 text-white/40 group-hover:scale-110 group-hover:text-white"
                )}>
                    {error ? <AlertCircle className="w-10 h-10 text-red-500" /> : <Upload className="w-10 h-10" />}
                </div>

                <div className="space-y-2">
                    <p className="text-xl font-light tracking-wide text-white">
                        {error ? <span className="text-red-400">{error}</span> : "Drop matter here"}
                    </p>
                    <p className="text-sm text-white/40 font-mono">
                        or click to browse local files
                    </p>
                </div>
            </div>

            {/* Grid Pattern Background */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{
                    backgroundImage: 'linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)',
                    backgroundSize: '40px 40px'
                }}
            />
        </label>
    );
}
