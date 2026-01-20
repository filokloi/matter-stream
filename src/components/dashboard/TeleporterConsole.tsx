import { useState } from 'react';
import { FileDropZone } from '../ingestion/FileDropZone';
import { FilePreview } from '../preview/FilePreview';
import { PromptEditor } from '../analysis/PromptEditor';
import { OutputPreview } from '../preview/OutputPreview';
import { ArrowRight, Sparkles, RefreshCw, Zap, AlertTriangle } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useSettings } from '../../contexts/SettingsContext';
import { AIRegistry, type AIProvider } from '../../services/ai/registry';

import { useHistory, type Project } from '../../contexts/HistoryContext';
import { useEffect } from 'react';

interface TeleporterConsoleProps {
    initialProject?: Project | null;
    onProjectLoaded?: () => void;
}

export function TeleporterConsole({ initialProject, onProjectLoaded }: TeleporterConsoleProps) {
    const { settings } = useSettings();
    const { addProject } = useHistory();
    const [file, setFile] = useState<File | null>(null);
    const [prompt, setPrompt] = useState<string>("");
    const [outputUrl, setOutputUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isReconstructing, setIsReconstructing] = useState(false);
    const [step, setStep] = useState<'IDLE' | 'ANALYZING' | 'EDITING' | 'RECONSTRUCTING' | 'DONE'>('IDLE');

    const handleFileSelect = (selectedFile: File) => {
        setFile(selectedFile);
        setStep('IDLE');
        setPrompt("");
        setOutputUrl(null);
        setError(null);
    };

    // Load project from history if provided
    useEffect(() => {
        if (initialProject) {
            // We need to convert the data URL back to a File object or handle it visually
            // For now, we'll just set it visually if possible, or Mock a file
            if (initialProject.originalFilePreview) {
                fetch(initialProject.originalFilePreview)
                    .then(res => res.blob())
                    .then(blob => {
                        const restoredFile = new File([blob], "restored_file", { type: initialProject.originalFileType });
                        setFile(restoredFile);
                    });
            }
            setPrompt(initialProject.prompt);
            setOutputUrl(initialProject.outputUrl);
            setStep('DONE');
            if (onProjectLoaded) onProjectLoaded();
        }
    }, [initialProject, onProjectLoaded]);

    interface ExecutionStrategy {
        provider: AIProvider;
        key: string;
        model: string;
        name: string;
    }

    const getExecutionStrategies = (preferredModel: string): ExecutionStrategy[] => {
        const strategies: ExecutionStrategy[] = [];

        // Helper to add strategy if key exists
        const addStrategy = (provider: AIProvider, key: string, model: string, name: string) => {
            if (key) strategies.push({ provider, key, model, name });
        };

        // 1. Primary Strategy (User's Preference)
        // If it's a Google Model
        if (preferredModel.includes('gemini')) {
            addStrategy('google', settings.googleKey, preferredModel, "Google Native");
            addStrategy('openrouter', settings.openRouterKey, preferredModel, "OpenRouter (Gemini)");
            // Cross-provider fallback
            addStrategy('openai', settings.openaiKey, "gpt-4o", "OpenAI Fallback (GPT-4o)");
        }
        // If it's an OpenAI Model
        else if (preferredModel.includes('gpt') || preferredModel.includes('dall-e')) {
            addStrategy('openai', settings.openaiKey, preferredModel, "OpenAI Native");
            addStrategy('openrouter', settings.openRouterKey, preferredModel, "OpenRouter (OpenAI)");
            // Cross-provider fallback (only for text/vision, not image gen usually unless we map dall-e to imagen)
            if (!preferredModel.includes('dall-e')) {
                addStrategy('google', settings.googleKey, "gemini-1.5-flash", "Google Fallback (Gemini)");
            }
        }
        // Generic / OpenRouter only
        else {
            addStrategy('openrouter', settings.openRouterKey, preferredModel, "OpenRouter");
        }

        // Final catch-all if nothing else added (e.g. no specific keys), try OpenRouter with whatever key is there
        if (strategies.length === 0 && settings.openRouterKey) {
            strategies.push({ provider: 'openrouter', key: settings.openRouterKey, model: preferredModel, name: "OpenRouter Default" });
        }

        return strategies;
    };

    const executeWithFallback = async <T,>(
        strategies: ExecutionStrategy[],
        operation: (service: any, strategy: ExecutionStrategy) => Promise<T>,
        onRetry: (strategy: ExecutionStrategy, error: any) => void
    ): Promise<T> => {
        let lastError: any;

        for (const strategy of strategies) {
            try {
                // Get service for this specific strategy
                const service = AIRegistry.getService(strategy.provider, strategy.key, strategy.model);
                return await operation(service, strategy);
            } catch (err: any) {
                console.warn(`Strategy ${strategy.name} failed:`, err);
                lastError = err;
                onRetry(strategy, err);
                // Continue to next strategy
            }
        }
        throw lastError || new Error("All execution strategies failed.");
    };

    const handleAnalyze = async () => {
        if (!file) return;

        const strategies = getExecutionStrategies(settings.analyzerModel);
        if (strategies.length === 0) {
            setError("No valid API keys found for the selected model chain. Please check Settings.");
            return;
        }

        setIsAnalyzing(true);
        setStep('ANALYZING');
        setError(null);

        try {
            const result = await executeWithFallback(
                strategies,
                async (service) => {
                    if (file.type.startsWith('image/')) {
                        return await service.analyzeImage(file);
                    } else {
                        const text = await new Promise<string>((resolve) => {
                            const reader = new FileReader();
                            reader.onload = (e) => resolve(e.target?.result as string);
                            reader.readAsText(file);
                        });
                        return await service.analyzeText(text);
                    }
                },
                (failedStrategy, _err) => {
                    // Optional: Toast "Google failed, trying OpenAI..."
                    console.log(`Fallback: ${failedStrategy.name} failed. Retrying...`);
                }
            );

            setPrompt(result.prompt);
            setStep('EDITING');
        } catch (_err: any) {
            // ...
            // inside handleReconstruct
            const result = await executeWithFallback(
                strategies,
                async (service, _strategy) => {
                    if (file?.type.startsWith('image/')) {
                        return await service.generateImage(prompt);
                    } else {
                        return await service.generateText(prompt);
                    }
                },
                (failedStrategy, _err) => {
                    console.log(`Fallback: ${failedStrategy.name} failed. Retrying...`);
                }
            );

            setOutputUrl(result.outputUrl);
            setStep('DONE');

            // Auto-save to history
            if (file && result.outputUrl) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    addProject({
                        originalFileType: file.type,
                        originalFilePreview: e.target?.result as string,
                        prompt: prompt,
                        outputUrl: result.outputUrl,
                        status: 'completed'
                    });
                };
                reader.readAsDataURL(file);
            }
        } catch (err: any) {
            console.error(err);
            setError(`Reconstruction failed after trying ${strategies.length} methods. Last error: ${err.message}`);
            setStep('EDITING');
        } finally {
            setIsReconstructing(false);
        }
    };

    const handleReset = () => {
        setFile(null);
        setPrompt("");
        setOutputUrl(null);
        setError(null);
        setStep('IDLE');
    };

    return (
        <div className="h-full flex flex-col p-6 lg:p-10 max-w-[1600px] mx-auto w-full relative">
            {/* Error Toast Area */}
            {error && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top-4 fade-in">
                    <div className="bg-red-500/10 border border-red-500/20 text-red-200 px-4 py-2 rounded-lg backdrop-blur-md flex items-center gap-2 shadow-lg">
                        <AlertTriangle className="w-4 h-4 text-red-400" />
                        <span className="text-sm">{error}</span>
                        <button onClick={() => setError(null)} className="ml-2 hover:text-white"><Zap className="w-3 h-3 rotate-45" /></button>
                    </div>
                </div>
            )}

            <header className="mb-8 flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-light tracking-tight text-white glow-text">
                        Matter Stream
                    </h1>
                    <p className="text-white/40 mt-2 font-mono text-sm max-w-xl">
                        {step === 'IDLE' && "Ready to decompose digital objects."}
                        {step === 'ANALYZING' && "Analyzing atomic structure..."}
                        {step === 'EDITING' && "Blueprint extracted. Ready for modification."}
                        {step === 'RECONSTRUCTING' && "Reintegrating matter from blueprint..."}
                        {step === 'DONE' && "Teleportation successful."}
                    </p>
                </div>
                <div className="hidden lg:block">
                    <div className={cn(
                        "flex items-center gap-2 px-4 py-2 border rounded-full transition-colors",
                        step === 'ANALYZING' || step === 'RECONSTRUCTING'
                            ? "bg-yellow-500/10 border-yellow-500/20"
                            : "bg-green-500/10 border-green-500/20"
                    )}>
                        <div className={cn(
                            "w-2 h-2 rounded-full animate-pulse",
                            step === 'ANALYZING' || step === 'RECONSTRUCTING' ? "bg-yellow-500" : "bg-green-500"
                        )} />
                        <span className={cn(
                            "text-xs font-medium uppercase tracking-widest",
                            step === 'ANALYZING' || step === 'RECONSTRUCTING' ? "text-yellow-400" : "text-green-400"
                        )}>
                            {step === 'IDLE' ? "System Online" : step}
                        </span>
                    </div>
                </div>
            </header>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-0">
                {/* Panel A: Source */}
                <div className="col-span-1 lg:col-span-5 flex flex-col gap-6 h-full">
                    <div className="flex items-center justify-between text-white/50 text-xs font-mono uppercase tracking-widest px-1">
                        <span>Source Input</span>
                        <span>Stage 01</span>
                    </div>
                    <div className="flex-1 glass-panel rounded-3xl p-1 relative overflow-hidden transition-all duration-500 active-panel-glow">
                        {file ? (
                            <FilePreview file={file} onClear={handleReset} />
                        ) : (
                            <FileDropZone onFileSelect={handleFileSelect} />
                        )}
                    </div>
                </div>

                {/* Workflow Connector */}
                <div className="hidden lg:flex col-span-1 flex-col items-center justify-center gap-4 opacity-50">
                    <div className={cn("w-[2px] h-20 bg-gradient-to-b from-transparent via-white/20 to-transparent transition-all", step !== 'IDLE' ? "via-primary shadow-[0_0_10px_rgba(59,130,246,0.5)]" : "")} />
                    <button
                        disabled={step === 'IDLE' || step === 'ANALYZING'}
                        className={cn(
                            "p-3 border rounded-full transition-all duration-500",
                            step === 'RECONSTRUCTING' ? "border-primary bg-primary text-black scale-110 shadow-glow" : "border-white/20 text-white/20"
                        )}
                    >
                        <ArrowRight className="w-5 h-5" />
                    </button>
                    <div className={cn("w-[2px] h-20 bg-gradient-to-b from-transparent via-white/20 to-transparent transition-all", step === 'DONE' ? "via-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" : "")} />
                </div>

                {/* Panel B: Processing / Output */}
                <div className="col-span-1 lg:col-span-6 flex flex-col gap-6 h-full">
                    <div className="flex items-center justify-between text-white/50 text-xs font-mono uppercase tracking-widest px-1">
                        <span>
                            {step === 'DONE' ? "Reconstruction Output" : "Prompt Core"}
                        </span>
                        <span>Stage 02</span>
                    </div>

                    <div className="flex-1 glass-panel rounded-3xl p-1 relative overflow-hidden flex flex-col transition-all duration-500">
                        {step === 'DONE' && outputUrl ? (
                            <div className="flex flex-col h-full gap-4">
                                <OutputPreview outputUrl={outputUrl} type={file?.type.startsWith('image/') ? 'image' : 'text'} />
                                <button
                                    onClick={() => setStep('EDITING')}
                                    className="w-full py-3 border border-white/10 hover:bg-white/5 rounded-xl text-white/60 hover:text-white transition-colors flex items-center justify-center gap-2"
                                >
                                    <RefreshCw className="w-4 h-4" />
                                    <span>Back to Blueprint (Edit & Retry)</span>
                                </button>
                            </div>
                        ) : (
                            step === 'EDITING' || step === 'RECONSTRUCTING' ? (
                                <div className="flex flex-col h-full">
                                    <div className="flex-1 min-h-0">
                                        <PromptEditor
                                            initialPrompt={prompt}
                                            onSave={setPrompt}
                                        />
                                    </div>
                                    <div className="p-4 border-t border-white/10 bg-black/20 flex justify-end">
                                        <button
                                            onClick={handleReconstruct}
                                            disabled={isReconstructing}
                                            className="px-6 py-2 bg-gradient-to-r from-primary to-blue-600 text-white font-bold rounded-lg hover:shadow-lg hover:shadow-primary/20 transition-all flex items-center gap-2"
                                        >
                                            {isReconstructing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 fill-white" />}
                                            {isReconstructing ? "Reconstructing..." : "Initiate Teleport"}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                /* Empty / Analyzing State */
                                <div className="flex-1 bg-black/40 rounded-[20px] flex flex-col items-center justify-center border border-white/5 m-1 relative overflow-hidden">
                                    {/* Scanline Effect if Analyzing */}
                                    {isAnalyzing && (
                                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/10 to-transparent animate-scan" />
                                    )}

                                    {!file ? (
                                        <div className="text-center space-y-4 opacity-30">
                                            <Sparkles className="w-12 h-12 mx-auto" />
                                            <p className="font-mono text-sm">Waiting for matter input...</p>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center gap-4 z-10">
                                            {isAnalyzing ? (
                                                <div className="flex flex-col items-center gap-3">
                                                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                                                    <p className="text-primary font-mono text-sm animate-pulse">Decomposing Object...</p>
                                                </div>
                                            ) : (
                                                <div className="text-center">
                                                    <p className="text-white/60 mb-6 font-mono text-sm">Object detected. Ready for decomposition.</p>
                                                    <button
                                                        onClick={handleAnalyze}
                                                        className="px-8 py-3 bg-white text-black font-bold rounded-full hover:scale-105 hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] transition-all flex items-center gap-2"
                                                    >
                                                        <Sparkles className="w-5 h-5 text-purple-600" />
                                                        <span>Analyze Matter</span>
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
