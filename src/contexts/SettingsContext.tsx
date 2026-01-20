import React, { createContext, useContext, useState, useEffect } from 'react';

interface AppSettings {
    openRouterKey: string;
    openaiKey: string;
    googleKey: string;
    xaiKey: string;
    analyzerModel: string;
    generatorModel: string;
}

interface SettingsContextType {
    settings: AppSettings;
    updateSettings: (newSettings: Partial<AppSettings>) => void;
}

const defaultSettings: AppSettings = {
    openRouterKey: '',
    openaiKey: '',
    googleKey: '',
    xaiKey: '',
    analyzerModel: 'google/gemini-flash-1.5',
    generatorModel: 'openai/dall-e-3',
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
    const [settings, setSettings] = useState<AppSettings>(() => {
        const stored = localStorage.getItem('teleport_settings');
        return stored ? JSON.parse(stored) : defaultSettings;
    });

    useEffect(() => {
        localStorage.setItem('teleport_settings', JSON.stringify(settings));
    }, [settings]);

    const updateSettings = (newSettings: Partial<AppSettings>) => {
        setSettings(prev => ({ ...prev, ...newSettings }));
    };

    return (
        <SettingsContext.Provider value={{ settings, updateSettings }}>
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings() {
    const context = useContext(SettingsContext);
    if (!context) throw new Error("useSettings must be used within SettingsProvider");
    return context;
}
