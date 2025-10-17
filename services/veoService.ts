// services/veoService.ts

import { getAiClient, getApiKey } from './geminiClient.ts';
import type { Trigger } from '../types.ts';
import { veoAnimationDescriptions } from '../constants/neuroEffect.ts';
import { logger } from './loggingService.ts';

// =================================================================
// 1. VEO PROMPT GENERATION LOGIC
// (Moved from prompts/veoPrompts.ts)
// =================================================================
export const generateVeoPrompt = (trigger: Trigger): string => {
    const { neuroEffect, emotion, goal, triggerText = '', name, qrCode } = trigger;
    const { animation, color, accentColor, typography, overlayParts, backgroundVisual } = neuroEffect;

    const mainFont = (typeof typography === 'string' && typography) 
        ? typography.split(',')[0].trim()
        : 'sans-serif';

    const psychologicalCore = `Задача — вызвать у зрителя ощущение "${emotion}" и подтолкнуть к цели: "${goal}". Визуализация должна отражать суть триггера "${name}".`;

    const animationStyle = veoAnimationDescriptions[animation] || `анимирован с эффектом '${animation}'`;

    let textEffectsDescription = '';
    const accentParts = overlayParts.filter(p => p.accent && p.text).map(p => `"${p.text.trim()}"`);
    if (accentParts.length > 0) {
        textEffectsDescription = `Ключевые слова, такие как ${accentParts.join(', ')}, ярко выделены контрастным цветом ${accentColor} и светятся, чтобы приковать к ним взгляд.`;
    } else {
        textEffectsDescription = `Текст не является монохромным. Для усиления психологического воздействия, отдельные ключевые слова или фразы в тексте должны быть окрашены в акцентные цвета. Основной цвет текста — ${color}. Задача VEO — самостоятельно определить 1-3 самых значимых слова (или коротких фразы) в тексте "${triggerText}" и окрасить их в контрастные, психологически обоснованные цвета. Например, слова, связанные с опасностью или срочностью, могут быть окрашены в огненно-красный (#EF4444), а слова, символизирующие рост или возможность — в ярко-зеленый (#22C55E). Это создаст визуальный акцент и направит внимание зрителя на ключевую идею, усиливая эмоциональное воздействие.`;
    }

    const dynamicOverlayDescription = backgroundVisual || 'медленно движущиеся, переплетающиеся линии света.';
    
    const backgroundDirective = `Основной фон сцены — это темный, размытый. Поверх этого фона деликатно наложен второй, полупрозрачный, едва заметный слой, который добавляет контекст: ${dynamicOverlayDescription}. **Критически важно:** оба слоя вместе должны создавать единый, темный и неконтрастный фон, идеальный для последующего наложения (композитинга) на другое видео. Фон не должен содержать ярких, отвлекающих элементов.`;

    let qrCodeDirective = '';
    if (qrCode) {
        const placement = qrCode.placement || 'нижний правый угол';
        const platform = qrCode.platform || 'ресурс';
        qrCodeDirective = `
**QR-код:** В области экрана ('${placement}') появляется минималистичный, но хорошо читаемый QR-код. Он ведет на '${platform}'. QR-код должен гармонично вписаться в общую композицию, не перекрывая основной текст, и может иметь тонкую светящуюся рамку в акцентном цвете (${accentColor}) для привлечения внимания.`;
    }

    const veoPrompt = `
 ${psychologicalCore}
**Описание фона:** ${backgroundDirective}
**Главный объект:** В центре экрана появляется текст: "${triggerText}". Он написан жирным, выразительным шрифтом, похожим на '${mainFont}', и ${animationStyle}.
${qrCodeDirective}
**Цветовая палитра текста:** Основной цвет — ${color}. ${textEffectsDescription}
**Общая атмосфера:** Атмосфера должна быть в зависимости от эмоции, с абсолютным фокусом на максимальную читаемость и психологическое воздействие текста.
`.replace(/\s+/g, ' ').trim();

    return veoPrompt;
};


// =================================================================
// 2. VEO API CALL LOGIC
// (Moved from services/geminiService.ts)
// =================================================================
export const generateVideoWithVEO = async (prompt: string): Promise<string> => {
    try {
        logger.info("Запуск генерации VEO видео...", { prompt });
        const ai = await getAiClient();
        // FIX: Updated VEO model name to the correct one as per coding guidelines.
        let operation = await ai.models.generateVideos({
            model: 'veo-3.1-fast-generate-preview',
            prompt: prompt,
            config: { numberOfVideos: 1 }
        });

        logger.info("Операция VEO создана", { operationId: operation.name });

        while (!operation.done) {
            logger.info("Опрос статуса операции VEO...");
            await new Promise(resolve => setTimeout(resolve, 10000)); // Poll every 10 seconds
            operation = await ai.operations.getVideosOperation({ operation: operation });
        }

        logger.info("Операция VEO завершена.", { operation });

        const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
        if (!downloadLink) {
            throw new Error("Video generation succeeded, but no download link was found.");
        }

        logger.info("Загрузка сгенерированного видео...");
        const apiKey = await getApiKey();
        const videoResponse = await fetch(`${downloadLink}&key=${apiKey}`);
        
        if (!videoResponse.ok) {
            throw new Error(`Failed to download video: ${videoResponse.statusText}`);
        }

        const videoBlob = await videoResponse.blob();
        logger.info("Видео успешно загружено, создается Blob URL.", { size: videoBlob.size });
        return URL.createObjectURL(videoBlob);

    } catch (error) {
        logger.error("Ошибка генерации VEO видео", error);
        console.error("VEO video generation failed:", error);
        throw new Error(`Ошибка генерации видео: ${error instanceof Error ? error.message : String(error)}`);
    }
};


// =================================================================
// 3. VEO REACT COMPONENT LOGIC
// (Moved to components/results/triggerCard/VeoGenerationButton.tsx)
// =================================================================