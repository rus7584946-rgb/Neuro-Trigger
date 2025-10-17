import React from 'react';
import type { PrePublicationAnalysis } from '../../types.ts';
import { Section } from '../common/Section.tsx';
import { PredictedProblemPointCard } from './PredictedProblemPointCard.tsx';
import { RetentionGraph } from './RetentionGraph.tsx';

interface PrePublicationAnalysisDisplayProps {
    analysis: PrePublicationAnalysis;
    totalDuration: number;
}

export const PrePublicationAnalysisDisplay: React.FC<PrePublicationAnalysisDisplayProps> = React.memo(({ analysis, totalDuration }) => {
    const points = analysis.predictedProblemPoints || [];
    const hasTrajectoryData = analysis.emotionalTrajectory && analysis.emotionalTrajectory.length > 0 || 
                              analysis.cognitiveLoad && analysis.cognitiveLoad.length > 0;

    if (points.length === 0 && !hasTrajectoryData) {
        return null;
    }

    return (
        <Section
            title="Предпубликационный Анализ (Прогноз по тексту)"
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>}
            tooltip="Этот блок основан ИСКЛЮЧИТЕЛЬНО на анализе текста транскрипции. Он НЕ использует данные из файла статистики и служит для поиска потенциальных проблем в 'сценарии' видео."
        >
            {hasTrajectoryData && (
                 <div className="mb-8">
                    <RetentionGraph
                        retentionCurve={[]}
                        emotionalTrajectory={analysis.emotionalTrajectory}
                        cognitiveLoad={analysis.cognitiveLoad}
                        strategicRecommendations={[]}
                        problemPoints={[]}
                        strengthPoints={[]}
                        repeatedSegments={[]}
                        totalDuration={totalDuration}
                        averageRetention={0}
                    />
                 </div>
            )}
            <div className="space-y-4">
                {points.map(point => (
                    <PredictedProblemPointCard key={`pred-prob-${point.timestamp}`} point={point} />
                ))}
            </div>
             {points.length === 0 && <p className="text-gray-400 text-center">Проблемных точек в тексте не предсказано.</p>}
        </Section>
    );
});