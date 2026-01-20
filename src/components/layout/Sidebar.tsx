import { Home, FolderOpen, Settings } from 'lucide-react';
import { cn } from '../../lib/utils';
import { SettingsModal } from '../settings/SettingsModal';
import { useState } from 'react';

type ViewMode = 'console' | 'history';

interface SidebarProps {
    currentView: ViewMode;
    onViewChange: (view: ViewMode) => void;
}

export function Sidebar({ currentView, onViewChange }: SidebarProps) {
    const [settingsOpen, setSettingsOpen] = useState(false);

    const navItems = [
        { icon: Home, label: 'Console', id: 'console' as const },
        { icon: FolderOpen, label: 'Projects', id: 'history' as const },
        // { icon: Terminal, label: 'Logs', id: 'logs' }, // Future
    ];

    return (
        <>
            <aside className="w-20 lg:w-24 border-r border-white/10 flex flex-col items-center py-8 z-20 bg-background/50 backdrop-blur-xl">
                <div className="mb-12">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-purple-600 flex items-center justify-center shadow-glow">
                        <span className="font-bold text-white text-xl">M</span>
                    </div>
                </div>

                <nav className="flex-1 flex flex-col gap-6 w-full px-4">
                    {navItems.map((item) => (
                        <button
                            key={item.label}
                            onClick={() => onViewChange(item.id)}
                            className={cn(
                                "p-3 rounded-xl transition-all duration-300 group relative flex justify-center",
                                currentView === item.id
                                    ? "bg-white/10 text-white shadow-inner"
                                    : "text-white/40 hover:text-white hover:bg-white/5"
                            )}
                        >
                            <item.icon className="w-6 h-6" />

                            {/* Tooltip */}
                            <span className="absolute left-full ml-4 px-2 py-1 bg-white/10 border border-white/10 rounded text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none backdrop-blur-md">
                                {item.label}
                            </span>

                            {/* Active Indicator */}
                            {currentView === item.id && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full shadow-[0_0_10px_#3b82f6]" />
                            )}
                        </button>
                    ))}
                </nav>

                <div className="mt-auto px-4 w-full">
                    <button
                        onClick={() => setSettingsOpen(true)}
                        className="p-3 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-all w-full flex justify-center"
                    >
                        <Settings className="w-6 h-6 spin-on-hover" />
                    </button>
                </div>
            </aside>

            <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
        </>
    );
}
