import * as Dialog from '@radix-ui/react-dialog';
import { Settings, X, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { useSettings } from '../../contexts/SettingsContext';
import { useState } from 'react';

interface SettingsModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
    const { settings, updateSettings } = useSettings();
    const [showKey, setShowKey] = useState<Record<string, boolean>>({});

    const toggleShowKey = (key: string) => {
        setShowKey(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <Dialog.Root open={open} onOpenChange={onOpenChange}>
            <Dialog.Trigger asChild>
                <button className="hidden" id="settings-trigger">Open Settings</button>
            </Dialog.Trigger>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 animate-in fade-in" />
                <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-zinc-900 border border-white/10 rounded-2xl p-6 shadow-2xl z-50 animate-in zoom-in-95 duration-200">
                    <div className="flex justify-between items-center mb-6">
                        <Dialog.Title className="text-xl font-bold text-white flex items-center gap-2">
                            <Settings className="w-5 h-5 text-primary" />
                            Configuration
                        </Dialog.Title>
                        <Dialog.Close asChild>
                            <button className="text-white/40 hover:text-white transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </Dialog.Close>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 flex gap-3 items-start">
                            <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                            <p className="text-xs text-yellow-200/80 leading-relaxed">
                                <strong>Privacy Notice:</strong> API keys are stored securely in your browser's local storage and are never sent to our servers. They are only used to communicate directly with AI providers.
                            </p>
                        </div>

                        {/* Model Configuration */}
                        <div className="space-y-4 pt-2 pb-6 border-b border-white/10">
                            <h3 className="text-sm font-semibold text-white/80 flex items-center gap-2">
                                <span className="w-1 h-4 bg-primary rounded-full" />
                                Model Selection
                            </h3>

                            <div className="grid grid-cols-1 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs text-white/60 uppercase tracking-wider font-semibold">Analyzer Model (Input)</label>
                                    <select
                                        value={settings.analyzerModel}
                                        onChange={(e) => updateSettings({ analyzerModel: e.target.value })}
                                        className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all outline-none font-mono text-sm appearance-none cursor-pointer hover:bg-white/5"
                                    >
                                        <option value="google/gemini-flash-1.5">Google Gemini Flash 1.5 (Recommended)</option>
                                        <option value="google/gemini-pro-1.5">Google Gemini Pro 1.5</option>
                                        <option value="openai/gpt-4o">OpenAI GPT-4o</option>
                                        <option value="mock/demo">✨ MOCK / DEMO MODE (Free)</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs text-white/60 uppercase tracking-wider font-semibold">Generator Model (Output)</label>
                                    <select
                                        value={settings.generatorModel}
                                        onChange={(e) => updateSettings({ generatorModel: e.target.value })}
                                        className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all outline-none font-mono text-sm appearance-none cursor-pointer hover:bg-white/5"
                                    >
                                        <option value="openai/dall-e-3">OpenAI DALL-E 3 (Recommended)</option>
                                        <option value="openai/gpt-4o">OpenAI GPT-4o (Text Reconstruction)</option>
                                        <option value="mock/demo">✨ MOCK / DEMO MODE (Free)</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {/* OpenRouter */}
                            <div className="space-y-2">
                                <label className="text-xs text-white/60 uppercase tracking-wider font-semibold">OpenRouter API Key</label>
                                <div className="relative">
                                    <input
                                        type={showKey['openrouter'] ? "text" : "password"}
                                        value={settings.openRouterKey}
                                        onChange={(e) => updateSettings({ openRouterKey: e.target.value })}
                                        placeholder="sk-or-..."
                                        className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-white/20 focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all outline-none font-mono text-sm"
                                    />
                                    <button
                                        onClick={() => toggleShowKey('openrouter')}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors"
                                    >
                                        {showKey['openrouter'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            {/* Google Gemini */}
                            <div className="space-y-2">
                                <label className="text-xs text-white/60 uppercase tracking-wider font-semibold">Google Gemini API Key</label>
                                <div className="relative">
                                    <input
                                        type={showKey['google'] ? "text" : "password"}
                                        value={settings.googleKey}
                                        onChange={(e) => updateSettings({ googleKey: e.target.value })}
                                        placeholder="AIza..."
                                        className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-white/20 focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all outline-none font-mono text-sm"
                                    />
                                    <button
                                        onClick={() => toggleShowKey('google')}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors"
                                    >
                                        {showKey['google'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            {/* OpenAI */}
                            <div className="space-y-2">
                                <label className="text-xs text-white/60 uppercase tracking-wider font-semibold">OpenAI API Key</label>
                                <div className="relative">
                                    <input
                                        type={showKey['openai'] ? "text" : "password"}
                                        value={settings.openaiKey}
                                        onChange={(e) => updateSettings({ openaiKey: e.target.value })}
                                        placeholder="sk-..."
                                        className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-white/20 focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all outline-none font-mono text-sm"
                                    />
                                    <button
                                        onClick={() => toggleShowKey('openai')}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors"
                                    >
                                        {showKey['openai'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                            <Dialog.Close asChild>
                                <button className="px-4 py-2 text-sm text-white/60 hover:text-white transition-colors">
                                    Close
                                </button>
                            </Dialog.Close>
                            <Dialog.Close asChild>
                                <button className="px-4 py-2 bg-white text-black text-sm font-bold rounded-lg hover:bg-white/90 transition-colors">
                                    Save Changes
                                </button>
                            </Dialog.Close>
                        </div>
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}
