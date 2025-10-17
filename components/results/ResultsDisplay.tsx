import React, { useCallback, useState, lazy, Suspense } from 'react';
import type { FullApiResponse, FeedbackAnalysisResult, SeoResult, PromoKitResult, CommunityPostResult, StrategicRecommendation, DeveloperAgentResult } from '../../types.ts';
import { RecommendationCard } from './RecommendationCard.tsx';
import { RetentionGraph } from './RetentionGraph.tsx';
import { Section } from '../common/Section.tsx';
import { PsychologicalProfileDisplay } from './PsychologicalProfileDisplay.tsx';
import { StatCard } from './StatCard.tsx';
import { ProblemPointCard, StrengthPointCard, RepeatedSegmentCard } from './AnalysisPointCards.tsx';
import { formatTime } from '../../utils/formatters.ts';
import { PrePublicationAnalysisDisplay } from './PrePublicationAnalysisDisplay.tsx';
import { FileInput } from '../form/FileInput.tsx';
import { AgentSection, AgentLoader } from '../common/AgentSection.tsx';

const SeoResultsDisplay = lazy(() => import('./SeoResultsDisplay.tsx'));
const PromoKitDisplay = lazy(() => import('./PromoKitDisplay.tsx'));
const CommunityPostDisplay = lazy(() => import('./CommunityPostDisplay.tsx'));
const DeveloperAgentDisplay = lazy(() => import('./DeveloperAgentDisplay.tsx'));


interface ResultsDisplayProps {
  results: FullApiResponse;
  onReset: () => void;
  mode: 'full' | 'creative';
  onUpdateResults: (updatedResults: FullApiResponse) => void;
  onAnalyzeFeedback: (newStatsFile: File) => void;
  isFeedbackLoading: boolean;
  feedbackResults: FeedbackAnalysisResult | null;
  feedbackError: string | null;
  onRunSeoAgent: () => void;
  isSeoLoading: boolean;
  seoResults: SeoResult | null;
  seoError: string | null;
  onRunPromoKitAgent: () => void;
  isPromoKitLoading: boolean;
  promoKitResults: PromoKitResult | null;
  promoKitError: string | null;
  onRunCommunityPostAgent: () => void;
  isCommunityPostLoading: boolean;
  communityPostResults: CommunityPostResult | null;
  communityPostError: string | null;
  onRunDeveloperAgent: () => void;
  isDeveloperAgentLoading: boolean;
  developerAgentResults: DeveloperAgentResult | null;
  developerAgentError: string | null;
}

export const ResultsDisplay: React.FC<ResultsDisplayProps> = (props) => {
    const { 
        results, onReset, mode, onUpdateResults,
        onAnalyzeFeedback, isFeedbackLoading, feedbackResults, feedbackError,
        onRunSeoAgent, isSeoLoading, seoResults, seoError,
        onRunPromoKitAgent, isPromoKitLoading, promoKitResults, promoKitError,
        onRunCommunityPostAgent, isCommunityPostLoading, communityPostResults, communityPostError,
        onRunDeveloperAgent, isDeveloperAgentLoading, developerAgentResults, developerAgentError
    } = props;
    
    const [copySuccess, setCopySuccess] = useState('');
    const [feedbackFile, setFeedbackFile] = useState<File | null>(null);

    const copyToClipboard = useCallback(() => {
        navigator.clipboard.writeText(JSON.stringify(results, null, 2)).then(() => {
            setCopySuccess('Скопировано!');
            setTimeout(() => setCopySuccess(''), 2000);
        }, () => {
            setCopySuccess('Ошибка!');
            setTimeout(() => setCopySuccess(''), 2000);
        });
    }, [results]);
    
    const handleRecommendationUpdate = (updatedRecommendation: StrategicRecommendation) => {
        const updatedRecommendations = results.strategicRecommendations.map(rec => 
            rec.id === updatedRecommendation.id ? updatedRecommendation : rec
        );
        onUpdateResults({
            ...results,
            strategicRecommendations: updatedRecommendations,
        });
    };

    const handleFeedbackFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFeedbackFile(e.target.files[0]);
        }
    };

    const handleRunFeedback = () => {
        if (feedbackFile) {
            onAnalyzeFeedback(feedbackFile);
        }
    };

    const { 
        psychologicalProfile, 
        retentionAnalysis, 
        strategicRecommendations = [], 
        retentionCurve, 
        predictedRetentionCurve,
        prePublicationAnalysis,
        rawDataPoints 
    } = results;
    
    const isFullAnalysis = mode === 'full';

    const qrTriggersCount = strategicRecommendations.filter(rec => rec.primarySuggestion.qrCode).length;
    
    // Use the actual retention curve if available, otherwise fall back to the predicted one for calculations.
    const curveForCalculation = (retentionCurve && retentionCurve.length > 0) 
        ? retentionCurve 
        : predictedRetentionCurve;

    // Calculate the average retention from the available curve data.
    const curveAverageRetention = curveForCalculation && curveForCalculation.length > 0
        ? curveForCalculation.reduce((sum, point) => sum + point.value, 0) / curveForCalculation.length
        : 0;
    
    // Determine the final average retention based on analysis mode.
    // In 'full' mode, the Python analysis result is the most accurate.
    // In 'creative' mode, the average calculated from the predicted curve is used.
    const averageRetention = isFullAnalysis
        ? (retentionAnalysis?.averageRetention || 0)
        : curveAverageRetention;
    
    // The total duration is now reliably passed from the service for both modes.
    const totalDuration = results.retentionAnalysis?.totalDuration || 0;
    const avgWatchTimeSeconds = (averageRetention / 100) * totalDuration;
    const avgWatchTimeFormatted = formatTime(avgWatchTimeSeconds);
    
    const strengthPointsCount = isFullAnalysis ? retentionAnalysis?.strengthPoints?.length || 0 : 0;
    const problemPointsCount = isFullAnalysis ? retentionAnalysis?.problemPoints?.length || 0 : 0;
    const repeatedSegmentsCount = isFullAnalysis ? retentionAnalysis?.repeatedSegments?.length || 0 : 0;

    return (
    <div className="animate-fade-in">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2">
                    {isFullAnalysis ? 'Результаты Нейро-Анализа' : 'Результаты Креативной Генерации'}
                </h1>
                <p className="text-gray-400">
                    {isFullAnalysis 
                    ? 'Глубокий анализ данных и сгенерированные триггеры для удержания.' 
                    : 'Профиль аудитории и триггеры, сгенерированные по транскрипции.'}
                </p>
            </div>
            <div className="flex space-x-2 mt-4 md:mt-0">
                <button onClick={copyToClipboard} className="px-4 py-2 bg-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-600 transition-colors w-32">
                    {copySuccess || 'Копировать JSON'}
                </button>
                <button onClick={onReset} className="px-4 py-2 bg-blue-600 text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors">
                    Новый анализ
                </button>
            </div>
        </div>

        <div className={`grid grid-cols-2 ${isFullAnalysis ? 'md:grid-cols-5' : 'md:grid-cols-4'} gap-6 mb-12`}>
            <StatCard icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>} value={strategicRecommendations.length} label="Рекомендаций" />
            <StatCard icon={<svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M3 11h8V3H3v8zm2-6h4v4H5V5zM3 21h8v-8H3v8zm2-6h4v4H5v-4zM13 3v8h8V3h-8zm6 6h-4V5h4v4zM13 21h8v-8h-8v8zm2-6h4v4h-4v-4z"/></svg>} value={qrTriggersCount} label="Рекомендаций с QR" />
            {isFullAnalysis && (
                 <StatCard icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>} value={strengthPointsCount} label="Сильных моментов" />
            )}
            <StatCard icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>} value={`${averageRetention.toFixed(1)}%`} label="Сред. удержание" />
            <StatCard icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} value={avgWatchTimeFormatted} label="Сред. просмотр" />
        </div>

        <PsychologicalProfileDisplay psychologicalProfile={psychologicalProfile} />

        {prePublicationAnalysis && <PrePublicationAnalysisDisplay analysis={prePublicationAnalysis} totalDuration={totalDuration} />}

        {(isFullAnalysis && retentionAnalysis && retentionCurve && retentionCurve.length > 0) && (
            <Section title="Анализ Удержания Аудитории" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" /></svg>}>
                <RetentionGraph retentionCurve={retentionCurve} predictedRetentionCurve={predictedRetentionCurve} rawDataPoints={rawDataPoints} strategicRecommendations={strategicRecommendations} problemPoints={retentionAnalysis.problemPoints || []} strengthPoints={retentionAnalysis.strengthPoints || []} repeatedSegments={retentionAnalysis.repeatedSegments || []} repeatedSegmentsCurve={retentionAnalysis.repeatedSegmentsCurve} totalDuration={totalDuration} averageRetention={averageRetention} />
                <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    <div>
                        <h3 className="text-xl font-bold text-green-300 mb-4">Сильные моменты ({strengthPointsCount})</h3>
                        <div className="space-y-4 max-h-96 overflow-y-auto pr-2">{retentionAnalysis.strengthPoints && retentionAnalysis.strengthPoints.length > 0 ? (retentionAnalysis.strengthPoints.map(point => <StrengthPointCard key={`str-${point.timestamp}`} point={point} />)) : <p className="text-gray-400">Сильных моментов для анализа не найдено.</p>}</div>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-red-300 mb-4">Проблемные моменты ({problemPointsCount})</h3>
                        <div className="space-y-4 max-h-96 overflow-y-auto pr-2">{retentionAnalysis.problemPoints && retentionAnalysis.problemPoints.length > 0 ? (retentionAnalysis.problemPoints.map(point => <ProblemPointCard key={`prob-${point.timestamp}`} point={point} />)) : <p className="text-gray-400">Критических проблем в удержании не найдено.</p>}</div>
                    </div>
                    <div className="lg:col-span-2 xl:col-span-1">
                        <h3 className="text-xl font-bold text-teal-300 mb-4">Пики интереса ({repeatedSegmentsCount})</h3>
                        <div className="space-y-4 max-h-96 overflow-y-auto pr-2">{retentionAnalysis.repeatedSegments && retentionAnalysis.repeatedSegments.length > 0 ? (retentionAnalysis.repeatedSegments.map(point => <RepeatedSegmentCard key={`rewatch-${point.timestamp}`} point={point} />)) : <p className="text-gray-400">Значимых пиков пересмотров не найдено.</p>}</div>
                    </div>
                </div>
            </Section>
        )}

        {(!isFullAnalysis && (predictedRetentionCurve || prePublicationAnalysis?.emotionalTrajectory)) && (
            <Section title="Прогноз по тексту" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" /></svg>}>
                 <RetentionGraph retentionCurve={[]} predictedRetentionCurve={predictedRetentionCurve} afterCurve={feedbackResults?.afterCurve} emotionalTrajectory={prePublicationAnalysis?.emotionalTrajectory} cognitiveLoad={prePublicationAnalysis?.cognitiveLoad} strategicRecommendations={strategicRecommendations} problemPoints={[]} strengthPoints={[]} repeatedSegments={[]} totalDuration={totalDuration} averageRetention={0} />
            </Section>
        )}

        <Section title="Стратегические Рекомендации" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>} tooltip="Каждая рекомендация — это комплексное предложение по усилению видео, включающее основную идею и альтернативы для A/B тестирования.">
            <div className="space-y-6">
                {strategicRecommendations.map((rec, index) => (
                    <RecommendationCard 
                        key={rec.id} 
                        recommendation={rec} 
                        index={index + 1}
                        onUpdate={handleRecommendationUpdate}
                        effectiveness={feedbackResults?.triggerEffectiveness.find(e => e.triggerId === rec.primarySuggestion.id)}
                    />
                ))}
            </div>
        </Section>
        
        <Section title="AI Агенты-помощники" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" /></svg>}>
            <div className="space-y-4">
                <AgentSection title="SEO Оптимизация" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>}
                    isLoading={isSeoLoading} error={seoError} onRun={onRunSeoAgent} results={seoResults} buttonText="Оптимизировать SEO">
                    <Suspense fallback={<AgentLoader />}>
                        <SeoResultsDisplay results={seoResults!} />
                    </Suspense>
                </AgentSection>
                
                <AgentSection title="Промо-материалы" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>}
                    isLoading={isPromoKitLoading} error={promoKitError} onRun={onRunPromoKitAgent} results={promoKitResults} buttonText="Создать Промо-кит">
                    <Suspense fallback={<AgentLoader />}>
                        <PromoKitDisplay results={promoKitResults!} />
                    </Suspense>
                </AgentSection>

                <AgentSection title="Посты для Сообщества" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21v-1a6 6 0 00-1.78-4.125a6 6 0 00-9.44-1.282" /></svg>}
                    isLoading={isCommunityPostLoading} error={communityPostError} onRun={onRunCommunityPostAgent} results={communityPostResults} buttonText="Сгенерировать Посты">
                    <Suspense fallback={<AgentLoader />}>
                        <CommunityPostDisplay results={communityPostResults!} />
                    </Suspense>
                </AgentSection>
                
                <AgentSection title="Агент-Разработчик" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066 2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
                    isLoading={isDeveloperAgentLoading} error={developerAgentError} onRun={onRunDeveloperAgent} results={developerAgentResults} buttonText="Проверить & Улучшить">
                    <Suspense fallback={<AgentLoader />}>
                        <DeveloperAgentDisplay results={developerAgentResults!} />
                    </Suspense>
                </AgentSection>
                
                 <div className="bg-gray-800/50 border border-gray-700 rounded-lg">
                    <div className="p-4">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-3">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                                <span className="text-xl font-bold text-white">Анализ Эффективности</span>
                            </div>
                             {isFeedbackLoading && <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>}
                        </div>
                        <p className="text-sm text-gray-400 mt-2">Загрузите новый файл статистики (.csv), снятый ПОСЛЕ применения триггеров, чтобы AI оценил их эффективность.</p>
                        
                        <div className="mt-4 flex flex-col sm:flex-row items-center gap-4">
                           <div className="w-full sm:w-2/3">
                            <FileInput id="feedback-stats" label="" files={feedbackFile ? [feedbackFile] : null} onChange={handleFeedbackFileChange} accept=".csv,.txt" />
                           </div>
                           <button onClick={handleRunFeedback} disabled={!feedbackFile || isFeedbackLoading} className="w-full sm:w-1/3 px-4 py-2 bg-teal-600 text-sm font-semibold rounded-lg hover:bg-teal-700 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed">
                               Сравнить
                           </button>
                        </div>
                        {feedbackError && <div className="bg-red-900/30 border border-red-500 text-red-300 p-3 rounded-lg mt-4">{feedbackError}</div>}
                        {feedbackResults && (
                            <div className="mt-4 animate-fade-in-fast space-y-3">
                                <h4 className="font-semibold text-teal-300">Общий вывод AI:</h4>
                                <p className="text-sm bg-gray-900/50 p-3 rounded-lg border border-gray-600">{feedbackResults.overallSummary}</p>
                                <p className="text-xs text-center text-gray-400">Результаты анализа эффективности также отображаются в карточках рекомендаций.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Section>
    </div>
    );
};