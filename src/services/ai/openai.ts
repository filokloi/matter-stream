import type { AIAnalysisResult, AIConfig, AIReconstructionResult, AIService } from "./types";
import OpenAI from "openai";

export class OpenAIService implements AIService {
    private client: OpenAI;
    private model: string;

    constructor(config: AIConfig) {
        this.client = new OpenAI({
            apiKey: config.apiKey,
            dangerouslyAllowBrowser: true
        });
        // Strip "openai/" prefix if present
        this.model = config.model.replace('openai/', '');
    }

    async analyzeImage(file: File, instruction?: string): Promise<AIAnalysisResult> {
        const base64 = await this.fileToBase64(file);

        const response = await this.client.chat.completions.create({
            model: "gpt-4o", // Strong default for vision
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
            model: this.model, // gpt-4o or gpt-3.5
            messages: [
                {
                    role: "system",
                    content: "You are an expert document analyzer."
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

    async generateText(prompt: string): Promise<AIReconstructionResult> {
        const response = await this.client.chat.completions.create({
            model: this.model,
            messages: [
                { role: "user", content: `Reconstruct the valid file content based on this blueprint:\n\n${prompt}` }
            ]
        });

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
