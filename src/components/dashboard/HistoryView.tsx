import { useHistory } from '../../contexts/HistoryContext';
import { Trash2, Calendar, FileText, Image as ImageIcon, ArrowRight } from 'lucide-react';
import { cn } from '../../lib/utils';

interface HistoryViewProps {
    onLoadProject?: (project: any) => void; // Optional: allow loading back into console
}

export function HistoryView({ onLoadProject }: HistoryViewProps) {
    const { projects, deleteProject, clearHistory } = useHistory();

    if (projects.length === 0) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-white/40">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                    <Calendar className="w-8 h-8 opacity-50" />
                </div>
                <h2 className="text-xl font-light mb-2">No Teleportation Records</h2>
                <p className="text-sm font-mono max-w-md text-center">
                    Matter streams will appear here once you successfully complete a teleportation cycle.
                </p>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col p-6 lg:p-10 max-w-[1600px] mx-auto w-full relative">
            <header className="mb-8 flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-light tracking-tight text-white glow-text">
                        Flight Recorder
                    </h1>
                    <p className="text-white/40 mt-2 font-mono text-sm">
                        {projects.length} recorded matter streams.
                    </p>
                </div>
                {projects.length > 0 && (
                    <button
                        onClick={clearHistory}
                        className="text-xs font-mono text-red-400 hover:text-red-300 transition-colors uppercase tracking-widest flex items-center gap-2"
                    >
                        <Trash2 className="w-4 h-4" />
                        Purge All Data
                    </button>
                )}
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 overflow-y-auto pb-10 pr-2 custom-scrollbar">
                {projects.map((project) => (
                    <div
                        key={project.id}
                        className="bg-zinc-900/50 border border-white/5 rounded-2xl overflow-hidden hover:border-white/20 transition-all group flex flex-col"
                    >
                        {/* Visual Header */}
                        <div className="h-48 relative bg-black/50 flex">
                            {/* Input Side */}
                            <div className="flex-1 border-r border-white/5 relative group/side">
                                {project.originalFilePreview ? (
                                    <img
                                        src={project.originalFilePreview}
                                        alt="Original"
                                        className="w-full h-full object-cover opacity-60 group-hover/side:opacity-100 transition-opacity"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-white/20">
                                        <FileText className="w-8 h-8" />
                                    </div>
                                )}
                                <div className="absolute top-2 left-2 px-2 py-1 bg-black/60 rounded text-[10px] font-mono uppercase text-white/60">Source</div>
                            </div>

                            {/* Center Divider Icon */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-black border border-white/10 flex items-center justify-center shadow-lg">
                                <ArrowRight className="w-3 h-3 text-white/60" />
                            </div>

                            {/* Output Side */}
                            <div className="flex-1 relative group/side">
                                {project.outputUrl ? (
                                    <img
                                        src={project.outputUrl}
                                        alt="Output"
                                        className="w-full h-full object-cover opacity-80 group-hover/side:opacity-100 transition-opacity"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-white/20">
                                        <ImageIcon className="w-8 h-8" />
                                    </div>
                                )}
                                <div className="absolute top-2 right-2 px-2 py-1 bg-black/60 rounded text-[10px] font-mono uppercase text-green-400/80">Result</div>
                            </div>
                        </div>

                        {/* Metadata Body */}
                        <div className="p-4 flex-1 flex flex-col">
                            <div className="flex justify-between items-start mb-3">
                                <div className="text-xs font-mono text-white/40">
                                    {new Date(project.timestamp).toLocaleString()}
                                </div>
                                <button
                                    onClick={() => deleteProject(project.id)}
                                    className="text-white/20 hover:text-red-400 transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="bg-black/20 rounded p-3 text-xs text-white/60 font-mono h-20 overflow-y-auto mb-4 border border-white/5 scrollbar-thin">
                                {project.prompt}
                            </div>

                            <div className="mt-auto">
                                <button
                                    onClick={() => onLoadProject?.(project)}
                                    className="w-full py-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg text-xs font-mono uppercase tracking-widest text-white/80 transition-colors"
                                >
                                    Load Data
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
