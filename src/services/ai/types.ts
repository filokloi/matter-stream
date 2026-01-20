export interface AIAnalysisResult {
    prompt: string;
    metadata?: Record<string, any>;
}

export interface AIReconstructionResult {
    outputUrl: string; // URL to image or text content
}

export interface AIService {
    analyzeImage(file: File, prompt?: string): Promise<AIAnalysisResult>;
    analyzeText(text: string, prompt?: string): Promise<AIAnalysisResult>;
    generateImage(prompt: string): Promise<AIReconstructionResult>;
    generateText(prompt: string): Promise<AIReconstructionResult>;
}

export interface AIConfig {
    apiKey: string;
    model: string;
}
