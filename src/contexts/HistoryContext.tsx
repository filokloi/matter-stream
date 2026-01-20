import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Project {
    id: string;
    timestamp: number;
    originalFileType: string; // 'image/png', 'text/plain', etc.
    originalFilePreview: string | null; // Data URL for preview
    prompt: string;
    outputUrl: string | null;
    status: 'completed' | 'failed';
}

interface HistoryContextType {
    projects: Project[];
    addProject: (project: Omit<Project, 'id' | 'timestamp'>) => void;
    deleteProject: (id: string) => void;
    clearHistory: () => void;
}

const HistoryContext = createContext<HistoryContextType | undefined>(undefined);

export function HistoryProvider({ children }: { children: React.ReactNode }) {
    const [projects, setProjects] = useState<Project[]>(() => {
        try {
            const stored = localStorage.getItem('teleport_history');
            return stored ? JSON.parse(stored) : [];
        } catch (e) {
            console.error("Failed to load history", e);
            return [];
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem('teleport_history', JSON.stringify(projects));
        } catch (e) {
            console.error("Failed to save history", e);
        }
    }, [projects]);

    const addProject = (project: Omit<Project, 'id' | 'timestamp'>) => {
        const newProject: Project = {
            ...project,
            id: crypto.randomUUID(),
            timestamp: Date.now(),
        };
        setProjects(prev => [newProject, ...prev]);
    };

    const deleteProject = (id: string) => {
        setProjects(prev => prev.filter(p => p.id !== id));
    };

    const clearHistory = () => {
        setProjects([]);
    };

    return (
        <HistoryContext.Provider value={{ projects, addProject, deleteProject, clearHistory }}>
            {children}
        </HistoryContext.Provider>
    );
}

export function useHistory() {
    const context = useContext(HistoryContext);
    if (!context) throw new Error("useHistory must be used within HistoryProvider");
    return context;
}
