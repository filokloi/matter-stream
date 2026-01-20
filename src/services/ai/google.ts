import type { AIAnalysisResult, AIConfig, AIReconstructionResult, AIService } from "./types";
import { GoogleGenerativeAI } from "@google/generative-ai";

export class GoogleService implements AIService {
    private client: GoogleGenerativeAI;
    private model: string;

    constructor(config: AIConfig) {
        this.client = new GoogleGenerativeAI(config.apiKey);
        // Strip "google/" prefix
        let modelId = config.model.replace('google/', '');

        // Map OpenRouter aliases to Google AI Studio IDs
        const modelMappings: Record<string, string> = {
            'gemini-flash-1.5': 'gemini-1.5-flash',
            'gemini-pro-1.5': 'gemini-1.5-pro',
            // Add more mappings as needed
        };

        this.model = modelMappings[modelId] || modelId;
    }

    async analyzeImage(file: File, instruction?: string): Promise<AIAnalysisResult> {
        const base64 = await this.fileToBase64(file);
        // Remove data URL prefix (e.g. "data:image/jpeg;base64,")
        const base64Data = base64.split(',')[1];

        const model = this.client.getGenerativeModel({ model: this.model });
        const result = await model.generateContent([
            instruction || `Analyze this image as a professional director of photography and prompt engineer. Your goal is to reverse-engineer a text prompt that would generate an EXACT visual replica of this image.
            
            Focus heavily on:
            1. **Technical Meta-data**: Camera lens (e.g., 85mm f/1.8), Film stock (e.g., Kodak Portra 400), Shutter speed context (motion blur vs frozen).
            2. **Lighting Physics**: Exact direction, hardness/softness, color temperature (e.g., "Golden Hour 2500K backlighting"), and volumetric effects.
            3. **Texture & Quality**: Use keywords like "8k resolution", "photorealistic", "octane render", "unreal engine 5", "hyper-detailed".
            4. **Composition**: Rule of thirds, depth of field, foreground focus, background bokeh intensity.
            5. **Subject Specifics**: If a bird/insect, describe the EXACT feather/wing pattern, iridescence, and posture.
            
            Output ONLY the raw prompt text, no introductions or explanations.`,
            {
                inlineData: {
                    data: base64Data,
                    mimeType: file.type
                }
            }
        ]);

        return {
            prompt: result.response.text()
        };
    }

    async analyzeText(text: string, instruction?: string): Promise<AIAnalysisResult> {
        const model = this.client.getGenerativeModel({ model: this.model });
        const result = await model.generateContent([
            instruction || "Analyze the following text and reconstruct its formatting structure (headers, fonts, layout) and content into a structured textual blueprint.",
            text
        ]);

        return {
            prompt: result.response.text()
        };
    }

    async generateImage(_prompt: string): Promise<AIReconstructionResult> {
        // Gemini doesn't officially support Image Generation via this SDK universally yet (mostly text/multimodal in).
        // Imagen 2/3 is available via Vertex AI, but not always simplified AI Studio key.
        // We will throw default error or try to find a workaround.
        throw new Error("Image Generation is not supported directly via Google AI Studio keys in this MVP. Please use OpenAI/DALL-E.");
    }

    async generateText(prompt: string): Promise<AIReconstructionResult> {
        const model = this.client.getGenerativeModel({ model: this.model });
        const result = await model.generateContent([
            `Reconstruct the valid file content based on this blueprint:\n\n${prompt}`
        ]);

        const content = result.response.text();
        const blob = new Blob([content], { type: 'text/plain' });
        return {
            outputUrl: URL.createObjectURL(blob)
        };
    }

    private fileToBase64(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
        });
    }
}
