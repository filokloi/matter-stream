import { GoogleService } from "./google";
import { OpenRouterService } from "./openrouter";
import { OpenAIService } from "./openai";
import type { AIService } from "./types";

export type AIProvider = 'google' | 'openai' | 'openrouter';

export class AIRegistry {
    static getService(provider: AIProvider, apiKey: string, model: string): AIService {
        switch (provider) {
            case 'google':
                return new GoogleService({ apiKey, model });
            case 'openai':
                return new OpenAIService({ apiKey, model });
            case 'openrouter':
                return new OpenRouterService({ apiKey, model });
            default:
                throw new Error(`Unsupported provider: ${provider}`);
        }
    }
}
