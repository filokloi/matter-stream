import { useState, useEffect } from 'react';
import { Pencil, Save, Copy, Check } from 'lucide-react';
import { cn } from '../../lib/utils';

interface PromptEditorProps {
    initialPrompt: string;
    onSave: (prompt: string) => void;
    isGenerating?: boolean;
}

export function PromptEditor({ initialPrompt, onSave }: PromptEditorProps) {
    const [prompt, setPrompt] = useState(initialPrompt);
    const [isEditing, setIsEditing] = useState(false);
    const [copied, setCopied] = useState(false);

    // Update local state if prop changes (e.g. re-analysis)
    useEffect(() => {
        setPrompt(initialPrompt);
    }, [initialPrompt]);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(prompt);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="flex flex-col h-full w-full bg-black/40 rounded-2xl border border-white/10 overflow-hidden">
            {/* Toolbar */}
            <div className="h-12 border-b border-white/10 flex items-center justify-between px-4 bg-white/5">
                <div className="flex items-center gap-2 text-white/50 text-xs font-mono uppercase">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    Blueprint DNA
                </div>

                <div className="flex items-center gap-1">
                    <button
                        onClick={() => setIsEditing(!isEditing)}
                        className={cn(
                            "p-2 rounded-lg hover:bg-white/10 transition-colors",
                            isEditing ? "text-primary bg-primary/10" : "text-white/40"
                        )}
                        title="Toggle Edit Mode"
                    >
                        <Pencil className="w-4 h-4" />
                    </button>
                    <button
                        onClick={handleCopy}
                        className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white/40 hover:text-white"
                        title="Copy to Clipboard"
                    >
                        {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                </div>
            </div>

            {/* Editor Area */}
            <div className="flex-1 relative group">
                {isEditing ? (
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        className="w-full h-full bg-transparent p-4 text-sm font-mono text-white/90 resize-none focus:outline-none custom-scrollbar leading-relaxed"
                        spellCheck={false}
                    />
                ) : (
                    <div className="w-full h-full p-4 overflow-y-auto custom-scrollbar">
                        <pre className="text-sm font-mono text-white/80 whitespace-pre-wrap leading-relaxed">
                            {prompt || <span className="text-white/20 italic">No genetic data extracted yet...</span>}
                        </pre>
                    </div>
                )}

                {/* Save visual cue when editing */}
                {isEditing && (
                    <div className="absolute bottom-4 right-4">
                        <button
                            onClick={() => {
                                onSave(prompt);
                                setIsEditing(false);
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-primary text-black rounded-lg font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all text-xs"
                        >
                            <Save className="w-3 h-3" />
                            Update Blueprint
                        </button>
                    </div>
                )}
            </div>

            {/* Status Bar */}
            <div className="h-8 border-t border-white/10 bg-black/20 flex items-center px-4 justify-between text-[10px] text-white/30 font-mono">
                <span>{prompt.length} chars</span>
                <span>{isEditing ? 'EDIT MODE' : 'READ ONLY'}</span>
            </div>
        </div>
    );
}
