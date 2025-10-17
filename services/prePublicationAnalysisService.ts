import { getAiClient } from './geminiClient.ts';
import type { GeminiModel } from '../types.ts';

export const runPrePublicationAnalysis = async (
    formattedTranscription: string,
    model: GeminiModel
): Promise<string> => {
    const ai = await getAiClient();
    if (!ai) throw new Error("Gemini AI client is not initialized.");

    const { getPrePublicationSystemInstruction } = await import('../prompts/systemInstructions.ts');
    const { PRE_PUBLICATION_ANALYSIS_SCHEMA } = await import('./schemas.ts');
    
    const systemInstruction = getPrePublicationSystemInstruction();

    const parts = [
        { text: `Full Transcription with Timestamps:\n${formattedTranscription}` },
    ];

    const response = await ai.models.generateContent({
        model: model,
        contents: { parts: parts },
        config: {
            systemInstruction: systemInstruction,
            temperature: 0.1, // Low temperature for consistent, predictable analysis.
            responseMimeType: "application/json",
            responseSchema: PRE_PUBLICATION_ANALYSIS_SCHEMA,
        }
    });

    return response.text;
};