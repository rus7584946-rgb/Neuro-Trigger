import { getAiClient } from './geminiClient.ts';

export const runPredictiveAnalysis = async (
    videoTitle: string,
    videoDescription: string,
    transcriptionText: string,
    videoDuration: number
): Promise<string> => {
    const ai = await getAiClient();
    if (!ai) throw new Error("Gemini AI client is not initialized.");
    
    const { getPredictiveAnalysisSystemInstruction } = await import('../prompts/systemInstructions.ts');
    const { PREDICTIVE_ANALYSIS_SCHEMA } = await import('./schemas.ts');

    const systemInstruction = getPredictiveAnalysisSystemInstruction(videoDuration);
    
    const parts = [
        { text: `Video Title: ${videoTitle}` },
        { text: `Video Description: ${videoDescription}` },
        { text: `Full Transcription:\n${transcriptionText}` },
    ];

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash', // Use Flash for this focused, data-in/data-out task
        contents: { parts: parts },
        config: {
            systemInstruction: systemInstruction,
            temperature: 0.1, // Low temperature for predictable data generation
            responseMimeType: "application/json",
            responseSchema: PREDICTIVE_ANALYSIS_SCHEMA,
        }
    });
    
    return response.text;
};