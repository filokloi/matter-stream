import type { AIAnalysisResult, AIConfig, AIReconstructionResult, AIService } from "./types";
import OpenAI from "openai";

export class OpenRouterService implements AIService {
    private client: OpenAI;
    private model: string;

    constructor(config: AIConfig) {
        this.client = new OpenAI({
            baseURL: "https://openrouter.ai/api/v1",
            apiKey: config.apiKey,
            dangerouslyAllowBrowser: true
        });
        this.model = config.model;
    }

    async analyzeImage(file: File, instruction?: string): Promise<AIAnalysisResult> {
        // Convert file to base64
        const base64 = await this.fileToBase64(file);

        const response = await this.client.chat.completions.create({
            model: "google/gemini-flash-1.5", // Good default for vision on OpenRouter
            messages: [
                {
                    role: "user",
                    content: [
                        { type: "text", text: instruction || "Analyze this image and provide a detailed text prompt that describes it perfectly for an image generation model. Include details about style, lighting, composition, and subjects. Output ONLY the prompt text." },
                        { type: "image_url", image_url: { url: base64 } }
                    ]
                }
            ]
        });

        return {
            prompt: response.choices[0]?.message?.content || "Analysis failed."
        };
    }

    async analyzeText(text: string, instruction?: string): Promise<AIAnalysisResult> {
        const response = await this.client.chat.completions.create({
            model: this.model,
            messages: [
                {
                    role: "system",
                    content: "You are an expert document analyzer. Your goal is to extract the structure and content of a document into a standardized blueprint format."
                },
                {
                    role: "user",
                    content: `${instruction || "Analyze the following text and reconstruct its formatting structure (headers, fonts, layout) and content into a structured textual blueprint."}\n\n---\n${text}`
                }
            ]
        });

        return {
            prompt: response.choices[0]?.message?.content || "Analysis failed."
        };
    }

    async generateImage(prompt: string): Promise<AIReconstructionResult> {
        if (this.model.includes('dall-e')) {
            const response = await this.client.images.generate({
                model: "dall-e-3",
                prompt: prompt,
                n: 1,
                size: "1024x1024",
                response_format: "b64_json"
            });

            const b64 = response.data?.[0]?.b64_json;
            if (!b64) throw new Error("Image generation failed: No data returned.");

            return {
                outputUrl: `data:image/png;base64,${b64}`
            };
        }

        throw new Error("Image generation not yet fully implemented for generic OpenRouter models in this MVP.");
    }

    async generateText(prompt: string): Promise<AIReconstructionResult> {
        const response = await this.client.chat.completions.create({
            model: this.model,
            messages: [
                { role: "user", content: `Reconstruct the valid file content based on this blueprint:\n\n${prompt}` }
            ]
        });

        // Create a blob for the text
        const content = response.choices[0]?.message?.content || "";
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
