// services/agentOrchestrator.ts
import { getAiClient } from './geminiClient.ts';
import { 
    AnalysisFormData, 
    AnalyzedTranscription, 
    PsychologicalProfile, 
    StrategicBrief,
    StrategicRecommendation,
    PrePublicationAnalysis
} from '../types.ts';
import type { PythonAnalysisResult } from './pythonAnalyzer.ts';
import { createAnalysisSummaryForAI } from "../prompts/analysisFormatter.ts";
import { safeJsonParse } from "../utils/jsonUtils.ts";
import { readFileAsBase64 } from "../utils/fileUtils.ts";
import { logger } from './loggingService.ts';

// ====== AGENT 1: PSYCHOLOGIST ======
const runPsychologistAgent = async (
    formData: AnalysisFormData,
    analyzedTranscription: AnalyzedTranscription
): Promise<PsychologicalProfile> => {
    logger.info('Запуск агента: AI-Психолог...');
    const ai = await getAiClient();
    const { getPsychologistSystemInstruction } = await import('../prompts/systemInstructions.ts');
    const { PSYCHOLOGIST_SCHEMA } = await import('./schemas.ts');

    const systemInstruction = getPsychologistSystemInstruction(formData.language);
    
    const formattedTranscription = analyzedTranscription.sentences.map(s => s.text).join('\n');

    const parts = [
        { text: `Video Title: ${formData.videoTitle}` },
        { text: `Video Description: ${formData.videoDescription}` },
        { text: `Target Audience: ${formData.targetAudience}` },
        { text: `Full Transcription:\n${formattedTranscription}` },
    ];

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts },
        config: {
            systemInstruction,
            temperature: 0.2,
            responseMimeType: "application/json",
            responseSchema: PSYCHOLOGIST_SCHEMA,
        }
    });

    const profile = safeJsonParse(response.text) as PsychologicalProfile;
    logger.info('AI-Психолог успешно завершил работу.', { psychotype: profile.psychotype, personas: profile.personas.length });
    return profile;
};

// ====== AGENT 2: STRATEGIST ======
const runStrategistAgent = async (
    formData: AnalysisFormData,
    analyzedTranscription: AnalyzedTranscription,
    psychologicalProfile: PsychologicalProfile,
    pythonAnalysisResult: PythonAnalysisResult | null,
    prePublicationAnalysisResult: PrePublicationAnalysis | null
): Promise<StrategicBrief[]> => {
    logger.info('Запуск агента: AI-Стратег...');
    const ai = await getAiClient();
    const { getStrategistSystemInstruction } = await import('../prompts/systemInstructions.ts');
    const { STRATEGIST_SCHEMA } = await import('./schemas.ts');

    const systemInstruction = getStrategistSystemInstruction(formData.language, formData.mode, formData.triggerCount, formData.timeRange);
    
    const analysisSummary = createAnalysisSummaryForAI(pythonAnalysisResult);

    const formattedTranscription = analyzedTranscription.sentences.map(s => {
        if (s.startTime !== undefined) {
            return `[${s.startTime.toFixed(1)}s] ${s.text}`;
        }
        return s.text;
    }).join('\n');

    const parts = [
        { text: `PSYCHOLOGICAL PROFILE:\n${JSON.stringify(psychologicalProfile, null, 2)}`},
        { text: `RETENTION ANALYSIS SUMMARY:\n${analysisSummary}`},
        { text: `PRE-PUBLICATION ANALYSIS:\n${JSON.stringify(prePublicationAnalysisResult, null, 2)}`},
        { text: `FULL TRANSCRIPTION WITH TIMESTAMPS:\n${formattedTranscription}`},
    ];

    const response = await ai.models.generateContent({
        model: formData.model,
        contents: { parts },
        config: {
            systemInstruction,
            temperature: formData.temperature,
            responseMimeType: "application/json",
            responseSchema: STRATEGIST_SCHEMA,
        }
    });

    const briefs = safeJsonParse(response.text) as StrategicBrief[];
    logger.info('AI-Стратег успешно завершил работу.', { briefsGenerated: briefs.length });
    return briefs;
};


// ====== AGENT 3: CREATIVE TEAM ======
const runCreativeAgent = async (
    brief: StrategicBrief,
    formData: AnalysisFormData,
    psychologicalProfile: PsychologicalProfile,
    analyzedTranscription: AnalyzedTranscription
): Promise<StrategicRecommendation> => {
    logger.info(`Запуск агента: Творческая команда (Бриф #${brief.id})`, { pointType: brief.pointType, timestamp: brief.pointTimestamp });
    const ai = await getAiClient();
    const { getCreativeAgentSystemInstruction } = await import('../prompts/systemInstructions.ts');
    const { CREATIVE_AGENT_SCHEMA } = await import('./schemas.ts');
    
    const systemInstruction = getCreativeAgentSystemInstruction(formData.language, formData.qrCodeCount, formData.mode === 'full');

    const formattedTranscription = analyzedTranscription.sentences.map(s => s.text).join('\n');
    
    const parts: any[] = [
        { text: `STRATEGIC BRIEF:\n${JSON.stringify(brief, null, 2)}`},
        { text: `PSYCHOLOGICAL PROFILE:\n${JSON.stringify(psychologicalProfile, null, 2)}`},
        { text: `Full Transcription for Context:\n${formattedTranscription}` },
    ];

    if (formData.qrCodes.length > 0) {
        parts.push({ text: `Available QR Codes for Monetization (use their descriptions in the 'platform' field):` });
        for (const qr of formData.qrCodes) {
            const { data, mimeType } = await readFileAsBase64(qr.file);
            parts.push({ text: `- Description: "${qr.description}"` });
            parts.push({ inlineData: { mimeType, data } });
        }
    }

    const response = await ai.models.generateContent({
        model: formData.model,
        contents: { parts },
        config: {
            systemInstruction,
            temperature: formData.temperature,
            responseMimeType: "application/json",
            responseSchema: CREATIVE_AGENT_SCHEMA,
        }
    });
    
    const recommendation = safeJsonParse(response.text) as StrategicRecommendation;
    logger.info(`Творческая команда успешно завершила работу (Бриф #${brief.id})`);
    return recommendation;
};


// ====== ORCHESTRATOR ======
export const runMultiAgentPipeline = async (
    { formData, analyzedTranscription, pythonAnalysisResult, prePublicationAnalysisResult }: {
        formData: AnalysisFormData,
        analyzedTranscription: AnalyzedTranscription,
        pythonAnalysisResult: PythonAnalysisResult | null,
        prePublicationAnalysisResult: PrePublicationAnalysis | null,
    }
): Promise<{ 
    psychologicalProfile: PsychologicalProfile, 
    strategicRecommendations: StrategicRecommendation[],
    retentionAnalysis: any // We pass back a partial analysis from the agents
}> => {
    logger.info('Запуск мульти-агентного пайплайна...');

    // 1. Run Psychologist Agent
    const psychologicalProfile = await runPsychologistAgent(formData, analyzedTranscription);

    // 2. Run Strategist Agent
    const strategicBriefs = await runStrategistAgent(
        formData, 
        analyzedTranscription, 
        psychologicalProfile, 
        pythonAnalysisResult,
        prePublicationAnalysisResult
    );

    // 3. Run Creative Team Agent for each brief in parallel
    const creativePromises = strategicBriefs.map(brief => 
        runCreativeAgent(brief, formData, psychologicalProfile, analyzedTranscription)
    );
    const strategicRecommendations = await Promise.all(creativePromises);
    
    logger.info('Мульти-агентный пайплайн успешно завершен.');

    // The new architecture doesn't have a single agent outputting retention analysis text.
    // We return an empty shell; the main service will populate it with Python data.
    const agentRetentionAnalysis = {
        problemPoints: [],
        strengthPoints: [],
        repeatedSegments: [],
    };

    return { 
        psychologicalProfile, 
        strategicRecommendations,
        retentionAnalysis: agentRetentionAnalysis
    };
};