import type { RetentionAnalysis } from '../types.ts';

/**
 * Creates a concise text summary of the analysis results for the AI prompt.
 * @param analysis The structured analysis object.
 * @returns A formatted string summary.
 */
export const createAnalysisSummaryForAI = (analysis: RetentionAnalysis | null): string => {
    // Helper to format points, ensuring type safety and handling of undefined arrays.
    const formatPoints = (points: {timestamp: number, [key:string]: any}[] | undefined, metric: 'retentionDip' | 'retentionPeak' | 'rewatchIntensity') => {
        if (!points || points.length === 0) return 'Не найдено';
        return points.map(p => `(${Math.round(p.timestamp)}s, ${(p[metric] || 0).toFixed(1)})`).join(', ');
    }

    if (!analysis) return 'Анализ удержания не проводился.';

    const hookInfo = analysis.hookAnalysis 
        ? `**Анализ хука (первые 30с):** Вердикт - ${analysis.hookAnalysis.verdict}, падение - ${analysis.hookAnalysis.initialDrop.toFixed(1)}%.`
        : '';
    
    const rewatchInfo = analysis.repeatedSegments && analysis.repeatedSegments.length > 0
        ? `**Самые пересматриваемые моменты (время, интенсивность):** ${formatPoints(analysis.repeatedSegments, 'rewatchIntensity')}.`
        : '';

    return `
**Общая длительность видео:** ${Math.round(analysis.totalDuration)} секунд.
**Среднее удержание аудитории:** ${analysis.averageRetention.toFixed(1)}%.
${hookInfo}
**Ключевые проблемные моменты (timestamp, % падения):** ${formatPoints(analysis.problemPoints, 'retentionDip')}.
**Ключевые сильные моменты (timestamp, % роста):** ${formatPoints(analysis.strengthPoints, 'retentionPeak')}.
${rewatchInfo}
`.trim();
};