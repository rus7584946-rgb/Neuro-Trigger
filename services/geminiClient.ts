// services/geminiClient.ts
import { GoogleGenAI } from "@google/genai";
import { logger } from './loggingService.ts';

// Per coding guidelines, API key must be from process.env.API_KEY.
// The previous implementation using window.google.aistudio has been removed.
const apiKey = process.env.API_KEY;

if (!apiKey) {
    const errorMsg = "Критическая ошибка: API-ключ не найден в переменной окружения process.env.API_KEY.";
    logger.error(errorMsg);
    console.error(errorMsg);
    throw new Error(errorMsg);
}

// FIX: Per coding guidelines, GoogleGenAI must be initialized with a named apiKey parameter.
const aiClient = new GoogleGenAI({ apiKey });
logger.info("Клиент Gemini API успешно инициализирован.");


export const getAiClient = async (): Promise<GoogleGenAI> => {
    return aiClient;
};

export const getApiKey = async (): Promise<string> => {
    if (!apiKey) {
        // This case should not be reached due to the check at the module level,
        // but it's here for type safety and robustness.
        throw new Error("API-ключ не был инициализирован.");
    }
    return apiKey;
};
