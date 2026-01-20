import type { AIAnalysisResult, AIConfig, AIReconstructionResult, AIService } from "./types";

export class MockService implements AIService {
    constructor(_config: AIConfig) { }

    async analyzeImage(_file: File, _instruction?: string): Promise<AIAnalysisResult> {
        await this.delay(1500);
        return {
            prompt: "A high-quality, photorealistic image of a futuristic teleportation device composed of shimmering glass and neon lights. Cyberpunk aesthetic, 8k resolution, cinematic lighting, blue and purple color palette."
        };
    }

    async analyzeText(_text: string, _instruction?: string): Promise<AIAnalysisResult> {
        await this.delay(1000);
        return {
            prompt: "Document Structure:\n- Header: Main Title (Bold, 24px)\n- Paragraph: Introduction text\n- List: 3 bullet points\n\nContent:\n1. Introduction to Teleportation\n2. Safety Protocols\n3. User Manual"
        };
    }

    async generateImage(_prompt: string): Promise<AIReconstructionResult> {
        await this.delay(2000);
        // Return a placeholder image
        return {
            outputUrl: "https://placehold.co/1024x1024/1a1a1a/FFF?text=Teleported+Image"
        };
    }

    async generateText(prompt: string): Promise<AIReconstructionResult> {
        await this.delay(1500);
        const content = `[MOCK RECONSTRUCTION]\n\nBased on blueprint:\n${prompt}\n\nHere is the reconstructed content...`;
        const blob = new Blob([content], { type: 'text/plain' });
        return {
            outputUrl: URL.createObjectURL(blob)
        };
    }

    private delay(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
