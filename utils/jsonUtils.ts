// utils/jsonUtils.ts
import { logger } from '../services/loggingService.ts';

export const safeJsonParse = (jsonString: string): any => {
    try {
        // The model sometimes returns JSON wrapped in markdown
        const cleanedString = jsonString.replace(/^```json\s*|```\s*$/g, '');
        return JSON.parse(cleanedString);
    } catch (error) {
        logger.error("Ошибка парсинга JSON ответа от AI", {
            error: error instanceof Error ? error.message : String(error),
            rawResponse: jsonString
        });
        console.error("Failed to parse JSON response from AI:", error);
        console.error("Raw response:", jsonString);
        throw new Error("Получен некорректный JSON-ответ от AI. Проверьте консоль и журнал для деталей.");
    }
};