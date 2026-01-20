
import { Download, ExternalLink, CheckCircle } from 'lucide-react';

interface OutputPreviewProps {
    outputUrl: string | null;
    type: 'image' | 'text';
}

export function OutputPreview({ outputUrl, type }: OutputPreviewProps) {
    if (!outputUrl) return null;

    return (
        <div className="w-full h-full rounded-2xl border border-green-500/20 bg-black/40 overflow-hidden flex flex-col relative group animate-in fade-in duration-700">
            {/* Success Indicator */}
            <div className="absolute top-4 left-4 z-20 flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full backdrop-blur-md">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-xs font-bold text-green-400 uppercase tracking-wider">Reconstruction Complete</span>
            </div>

            {/* Actions */}
            <div className="absolute top-4 right-4 z-20 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <a
                    href={outputUrl}
                    download={`teleported_file.${type === 'image' ? 'png' : 'txt'}`}
                    className="p-2 bg-white/10 hover:bg-white/20 rounded-lg backdrop-blur-md text-white transition-colors"
                    title="Download"
                >
                    <Download className="w-4 h-4" />
                </a>
                <a
                    href={outputUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 bg-white/10 hover:bg-white/20 rounded-lg backdrop-blur-md text-white transition-colors"
                    title="Open in New Tab"
                >
                    <ExternalLink className="w-4 h-4" />
                </a>
            </div>

            {/* Content */}
            <div className="flex-1 flex items-center justify-center p-4">
                {type === 'image' ? (
                    <img
                        src={outputUrl}
                        alt="Reconstructed Output"
                        className="max-w-full max-h-full object-contain rounded-lg shadow-2xl shadow-green-900/20"
                    />
                ) : (
                    <div className="w-full h-full bg-white text-black p-8 rounded-lg shadow-2xl overflow-y-auto font-serif whitespace-pre-wrap">
                        {/* If outputUrl is a blob URL for text, we might need to fetch it to display, 
                            but for MVP we might pass the text content directly or iframe it. 
                            For simplicity, let's assume it's an image or we use an iframe for text. */}
                        <iframe src={outputUrl} title="Text Output" className="w-full h-full border-none" />
                    </div>
                )}
            </div>
        </div>
    );
}
