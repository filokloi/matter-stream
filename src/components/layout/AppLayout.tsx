import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { TeleporterConsole } from '../dashboard/TeleporterConsole';
import { HistoryView } from '../dashboard/HistoryView';
import { type Project } from '../../contexts/HistoryContext';

export function AppLayout() {
    const [currentView, setCurrentView] = useState<'console' | 'history'>('console');
    const [projectToLoad, setProjectToLoad] = useState<Project | null>(null);

    const handleLoadProject = (project: Project) => {
        setProjectToLoad(project);
        setCurrentView('console');
    };

    return (
        <div className="flex h-screen w-full bg-[#050510] text-white overflow-hidden selection:bg-primary/30">
            <Sidebar currentView={currentView} onViewChange={setCurrentView} />

            <main className="flex-1 h-full overflow-hidden relative">
                {/* Dynamic Grid Background */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
                <div className="absolute inset-0 bg-radial-gradient from-primary/5 via-transparent to-transparent opacity-50 pointer-events-none" />

                {currentView === 'console' ? (
                    <TeleporterConsole
                        initialProject={projectToLoad}
                        onProjectLoaded={() => setProjectToLoad(null)}
                    />
                ) : (
                    <HistoryView onLoadProject={handleLoadProject} />
                )}
            </main>
        </div>
    );
}
