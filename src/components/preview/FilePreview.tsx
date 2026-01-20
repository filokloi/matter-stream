import { useMemo } from 'react';
import { FileText, Image as ImageIcon, X } from 'lucide-react';

interface FilePreviewProps {
    file: File;
    onClear: () => void;
}

export function FilePreview({ file, onClear }: FilePreviewProps) {
    const previewUrl = useMemo(() => {
        if (file.type.startsWith('image/')) {
            return URL.createObjectURL(file);
        }
        return null;
    }, [file]);

    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="w-full h-full rounded-2xl border border-white/10 bg-black/20 overflow-hidden flex flex-col relative group">
            {/* Header / Controls */}
            <div className="absolute top-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={onClear}
                    className="p-2 bg-black/60 backdrop-blur-md rounded-full text-white/70 hover:text-white hover:bg-red-500/20 hover:border-red-500/50 border border-white/10 transition-all"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Content Preview */}
            <div className="flex-1 relative flex items-center justify-center bg-dots-pattern">
                {previewUrl ? (
                    <img
                        src={previewUrl}
                        alt="Preview"
                        className="max-w-full max-h-full object-contain shadow-2xl"
                    />
                ) : (
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-24 h-24 rounded-2xl bg-white/5 flex items-center justify-center">
                            <FileText className="w-12 h-12 text-white/40" />
                        </div>
                    </div>
                )}
            </div>

            {/* Footer Metadata */}
            <div className="h-16 glass-panel border-t border-white/10 flex items-center justify-between px-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/5 rounded-lg">
                        {file.type.startsWith('image/') ? (
                            <ImageIcon className="w-4 h-4 text-purple-400" />
                        ) : (
                            <FileText className="w-4 h-4 text-blue-400" />
                        )}
                    </div>
                    <div>
                        <p className="text-sm font-medium text-white truncate max-w-[200px]">{file.name}</p>
                        <p className="text-xs text-white/40 font-mono">{formatSize(file.size)} • {file.type || 'Unknown Type'}</p>
                    </div>
                </div>
                <div className="px-3 py-1 rounded-full bg-white/5 border border-white/5 text-[10px] uppercase tracking-wider text-white/30 font-bold">
                    Original
                </div>
            </div>
        </div>
    );
}
