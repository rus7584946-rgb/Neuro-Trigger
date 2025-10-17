import { getAiClient } from './geminiClient.ts';
import { runMultiAgentPipeline } from './agentOrchestrator.ts';
import type { PythonAnalysisResult } from './pythonAnalyzer.ts';
import { createAnalysisSummaryForAI } from '../prompts/analysisFormatter.ts';
import { readFileAsText } from '../utils/fileUtils.ts';
import { safeJsonParse } from '../utils/jsonUtils.ts';
import type { FullApiResponse, AnalysisFormData, FeedbackAnalysisResult, SeoResult, RetentionAnalysis, PromoKitResult, StrategicRecommendation, CommunityPostResult, DeveloperAgentResult } from '../types.ts';
import { analyzeTranscription } from './transcriptionAnalyzer.ts';
import { runPredictiveAnalysis } from './predictiveAnalysisService.ts';
import { runPrePublicationAnalysis } from './prePublicationAnalysisService.ts';
import { logger } from './loggingService.ts';

export const extractVideoMetadata = async (transcriptionText: string): Promise<{ videoTitle: string; videoDescription: string; targetAudience: string; }> => {
    try {
        logger.info('Вызов Gemini API: извлечение метаданных...');
        const ai = await getAiClient();
        const { getMetadataExtractionInstruction } = await import('../prompts/systemInstructions.ts');
        const { METADATA_EXTRACTION_SCHEMA } = await import('./schemas.ts');
        
        const systemInstruction = getMetadataExtractionInstruction();
        const parts = [{ text: `Transcription:\n${transcriptionText}` }];

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: parts },
            config: {
                systemInstruction: systemInstruction,
                temperature: 0.4,
                responseMimeType: "application/json",
                responseSchema: METADATA_EXTRACTION_SCHEMA,
            }
        });
        
        logger.info('Gemini API: метаданные успешно извлечены.');
        return safeJsonParse(response.text);
    } catch (err) {
        logger.error("Ошибка извлечения метаданных из Gemini API", err);
        console.error("Metadata extraction failed:", err);
        // Return empty strings as a fallback
        return { videoTitle: '', videoDescription: '', targetAudience: '' };
    }
};

export const runFeedbackAnalysis = async (
    pyodide: any,
    originalResults: FullApiResponse,
    newStatsFile: File
): Promise<FeedbackAnalysisResult> => {
    if (!pyodide) {
        throw new Error("Аналитический модуль (Pyodide) не загружен.");
    }

    const { getFeedbackAnalysisSystemInstruction } = await import('../prompts/systemInstructions.ts');
    const { FEEDBACK_ANALYSIS_SCHEMA } = await import('./schemas.ts');
    const { analyzeRetentionDataWithPython } = await import('./pythonAnalyzer.ts');

    const originalAnalysis = originalResults.retentionAnalysis;
    const strategicRecommendations = originalResults.strategicRecommendations;

    // 1. Analyze the new "after" stats file
    const newStatsText = await readFileAsText(newStatsFile);
    const afterAnalysis = await analyzeRetentionDataWithPython(pyodide, newStatsText, originalAnalysis.totalDuration);

    // 2. Create summaries for the AI prompt
    const originalSummary = createAnalysisSummaryForAI(originalAnalysis);
    const afterSummary = createAnalysisSummaryForAI(afterAnalysis as RetentionAnalysis);

    // 3. Call Gemini for feedback analysis
    const systemInstruction = getFeedbackAnalysisSystemInstruction(originalSummary, afterSummary, strategicRecommendations);
    
    logger.info('Вызов Gemini API: анализ эффективности...');
    const ai = await getAiClient();
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash', // Use the faster model for this complex comparison task
        contents: { parts: [{text: "Analyze the provided data."}] }, // Content is in system prompt
        config: {
            systemInstruction,
            temperature: 0.1,
            responseMimeType: "application/json",
            responseSchema: FEEDBACK_ANALYSIS_SCHEMA
        }
    });
    logger.info('Gemini API: анализ эффективности завершен.');

    const feedback = safeJsonParse(response.text);
    feedback.afterCurve = afterAnalysis.retentionCurve; // Attach the new curve for display

    return feedback as FeedbackAnalysisResult;
};

export const runSeoAgent = async (analysisResults: FullApiResponse): Promise<SeoResult> => {
    const { getSeoAgentSystemInstruction } = await import('../prompts/systemInstructions.ts');
    const { SEO_AGENT_SCHEMA } = await import('./schemas.ts');
    const systemInstruction = getSeoAgentSystemInstruction();
    
    // Create a simplified context for the SEO agent to focus on relevant info
    const context = `
        Video Title: ${analysisResults.videoTitle}
        Video Description: ${analysisResults.videoDescription}
        Psychological Profile: ${JSON.stringify(analysisResults.psychologicalProfile, null, 2)}
        Strategic Recommendations Summary: ${analysisResults.strategicRecommendations.map(r => r.analysisSummary).join('. ')}
        Key Quotes: ${analysisResults.strategicRecommendations.map(r => r.primarySuggestion.contextQuote).join('; ')}
    `;
    
    logger.info('Вызов Gemini API: SEO агент...');
    const ai = await getAiClient();
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [{ text: `Here is the analysis context, generate the SEO kit:\n${context}` }] },
        config: {
            systemInstruction,
            temperature: 0.6,
            responseMimeType: "application/json",
            responseSchema: SEO_AGENT_SCHEMA
        }
    });
    logger.info('Gemini API: SEO агент завершил работу.');
    
    return safeJsonParse(response.text) as SeoResult;
};

export const runPromoKitAgent = async (analysisResults: FullApiResponse): Promise<PromoKitResult> => {
    const { getPromoKitAgentSystemInstruction } = await import('../prompts/systemInstructions.ts');
    const { PROMO_KIT_SCHEMA } = await import('./schemas.ts');
    const systemInstruction = getPromoKitAgentSystemInstruction();

    const context = JSON.stringify(analysisResults, null, 2);

    logger.info('Вызов Gemini API: Промо-кит агент...');
    const ai = await getAiClient();
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [{ text: `Here is the analysis context, generate the promo kit:\n${context}` }] },
        config: {
            systemInstruction,
            temperature: 0.7,
            responseMimeType: "application/json",
            responseSchema: PROMO_KIT_SCHEMA
        }
    });
    logger.info('Gemini API: Промо-кит агент завершил работу.');
    
    return safeJsonParse(response.text) as PromoKitResult;
};

export const runCommunityPostAgent = async (analysisResults: FullApiResponse): Promise<CommunityPostResult> => {
    const { getCommunityPostAgentSystemInstruction } = await import('../prompts/systemInstructions.ts');
    const { COMMUNITY_POST_AGENT_SCHEMA } = await import('./schemas.ts');
    const systemInstruction = getCommunityPostAgentSystemInstruction();

    const context = JSON.stringify(analysisResults, null, 2);

    logger.info('Вызов Gemini API: агент постов сообщества...');
    const ai = await getAiClient();
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [{ text: `Here is the analysis context, generate the community posts:\n${context}` }] },
        config: {
            systemInstruction,
            temperature: 0.7,
            responseMimeType: "application/json",
            responseSchema: COMMUNITY_POST_AGENT_SCHEMA
        }
    });
    logger.info('Gemini API: агент постов сообщества завершил работу.');
    
    return safeJsonParse(response.text) as CommunityPostResult;
};

export const runDeveloperAgent = async (analysisResults: FullApiResponse): Promise<DeveloperAgentResult> => {
    const { getDeveloperAgentSystemInstruction } = await import('../prompts/systemInstructions.ts');
    const { DEVELOPER_AGENT_SCHEMA } = await import('./schemas.ts');
    const systemInstruction = getDeveloperAgentSystemInstruction();
    
    const context = JSON.stringify(analysisResults, null, 2);

    logger.info('Вызов Gemini API: агент-разработчик...');
    const ai = await getAiClient();
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash', // Flash is sufficient for this analytical task
        contents: { parts: [{ text: `Analyze this full API response:\n${context}` }] },
        config: {
            systemInstruction,
            temperature: 0.2, // Low temperature for consistent, high-quality analysis
            responseMimeType: "application/json",
            responseSchema: DEVELOPER_AGENT_SCHEMA
        }
    });
    logger.info('Gemini API: агент-разработчик завершил работу.');
    
    return safeJsonParse(response.text) as DeveloperAgentResult;
};

export const analyzeContent = async (pyodide: any, formData: AnalysisFormData): Promise<FullApiResponse> => {
    // 1. Read and analyze transcription file
    const transcriptionText = await readFileAsText(formData.transcriptionFile);
    const analyzedTranscription = analyzeTranscription(transcriptionText, formData.transcriptionFile.name);
    let absoluteVideoDuration = analyzedTranscription.metadata.totalDuration;
    logger.info('Транскрипция проанализирована', { duration: absoluteVideoDuration, sentences: analyzedTranscription.metadata.sentenceCount });

    // 2. Prepare for analysis pipeline
    let pythonAnalysisResult: PythonAnalysisResult | null = null;
    let predictedCurve: { time: number, value: number }[] | undefined = undefined;
    let prePublicationAnalysisResult: any = null;

    // 3. Run Python analysis if in full mode
    if (formData.mode === 'full') {
        if (!pyodide) throw new Error("Аналитический модуль (Pyodide) не загружен. Переключитесь в креативный режим или перезагрузите страницу.");
        if (!formData.statsFiles || formData.statsFiles.length === 0) throw new Error("Для полного анализа необходимо загрузить файл(ы) статистики удержания.");

        if (absoluteVideoDuration === 0) logger.warn("Не удалось определить длительность видео из файла транскрипции. Анализ будет основан на данных из файла статистики.");
        
        const statsText = await readFileAsText(formData.statsFiles[0]);
        const { analyzeRetentionDataWithPython } = await import('./pythonAnalyzer.ts');
        pythonAnalysisResult = await analyzeRetentionDataWithPython(pyodide, statsText, absoluteVideoDuration, formData.dipSensitivity, formData.peakSensitivity);
        // Use the duration from python analysis if it's more accurate (e.g., from a longer stats file)
        if(pythonAnalysisResult.totalDuration > absoluteVideoDuration){
            absoluteVideoDuration = pythonAnalysisResult.totalDuration;
        }
    }

    // 4. Run optional beta analyses
    if (formData.predictiveAnalysisEnabled) {
        try {
            logger.info('Запуск бета-функции: Прогнозирование удержания...');
            const predictionResultJson = await runPredictiveAnalysis(formData.videoTitle, formData.videoDescription, transcriptionText, absoluteVideoDuration);
            predictedCurve = safeJsonParse(predictionResultJson).predictedRetentionCurve;
            logger.info('Прогнозирование удержания успешно завершено.');
        } catch (err) {
            logger.error("Ошибка прогнозирования удержания", err);
            console.error("Predictive analysis failed, continuing without it:", err);
        }
    }
    
    if (formData.prePublicationAnalysisEnabled) {
        try {
            logger.info('Запуск бета-функции: Предпубликационный анализ...');
            const formattedTranscription = analyzedTranscription.sentences.map(s => {
                if (s.startTime !== undefined) {
                    return `[${s.startTime.toFixed(1)}s] ${s.text}`;
                }
                return s.text;
            }).join('\n');
            const prePubResultJson = await runPrePublicationAnalysis(formattedTranscription, formData.model);
            prePublicationAnalysisResult = safeJsonParse(prePubResultJson);
            logger.info('Предпубликационный анализ успешно завершен.');
        } catch (err) {
            logger.error("Ошибка предпубликационного анализа", err);
            console.error("Pre-publication analysis failed, continuing without it:", err);
        }
    }
    
    // 5. Run the main multi-agent pipeline
    const agentResults = await runMultiAgentPipeline({
        formData,
        analyzedTranscription,
        pythonAnalysisResult,
        prePublicationAnalysisResult
    });

    // 6. Assemble the final response object
    const finalResult: FullApiResponse = {
        ...agentResults,
        videoTitle: formData.videoTitle,
        videoDescription: formData.videoDescription,
        transcriptionText: transcriptionText,
        retentionAnalysis: {
            averageCTR: 0,
            averageRetention: pythonAnalysisResult?.averageRetention ?? 0,
            totalDuration: absoluteVideoDuration,
            volatilityScore: pythonAnalysisResult?.volatilityScore,
            problemPoints: pythonAnalysisResult?.problemPoints ?? [],
            strengthPoints: pythonAnalysisResult?.strengthPoints ?? [],
            repeatedSegments: pythonAnalysisResult?.repeatedSegments,
            repeatedSegmentsCurve: pythonAnalysisResult?.repeatedSegmentsCurve,
            hookAnalysis: pythonAnalysisResult?.hookAnalysis,
        },
        retentionCurve: pythonAnalysisResult?.retentionCurve ?? [],
        rawDataPoints: pythonAnalysisResult?.rawDataPoints,
        predictedRetentionCurve: predictedCurve,
        prePublicationAnalysis: prePublicationAnalysisResult,
    };
    
    return finalResult;
};