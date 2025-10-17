import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/common/Header.tsx';
import { InputForm } from './components/form/InputForm.tsx';
import { ResultsDisplay } from './components/results/ResultsDisplay.tsx';
import { LoadingIndicator } from './components/common/LoadingIndicator.tsx';
import { usePyodide } from './components/PyodideProvider.tsx';
import { analyzeContent, runFeedbackAnalysis, runSeoAgent, runPromoKitAgent, runCommunityPostAgent, runDeveloperAgent } from './services/geminiService.ts';
import type { AnalysisFormData, FullApiResponse, FeedbackAnalysisResult, SeoResult, PromoKitResult, CommunityPostResult, DeveloperAgentResult, HistoryEntry } from './types.ts';
import { logger } from './services/loggingService.ts';
import { HistoryPanel } from './components/history/HistoryPanel.tsx';
import { LogPanel } from './components/logging/LogPanel.tsx';
import { getAnalysisHistory, saveAnalysisToHistory, clearAnalysisHistory } from './services/historyService.ts';
import { Tour } from './components/tour/Tour.tsx';

const TOUR_STORAGE_KEY = 'neuroTriggerTourCompleted';

const App: React.FC = () => {
  // Main application state
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<FullApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentMode, setCurrentMode] = useState<'full' | 'creative'>('full');
  const [currentAnalysisId, setCurrentAnalysisId] = useState<string | null>(null);

  // Pyodide and UI panel states
  const { pyodide, isPyodideLoading, pyodideError } = usePyodide();
  const [isHistoryPanelOpen, setIsHistoryPanelOpen] = useState(false);
  const [isLogPanelOpen, setIsLogPanelOpen] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  
  // Tour state
  const [isTourActive, setIsTourActive] = useState(false);

  // States for secondary agents
  const [isFeedbackLoading, setIsFeedbackLoading] = useState(false);
  const [feedbackResults, setFeedbackResults] = useState<FeedbackAnalysisResult | null>(null);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  
  const [isSeoLoading, setIsSeoLoading] = useState(false);
  const [seoResults, setSeoResults] = useState<SeoResult | null>(null);
  const [seoError, setSeoError] = useState<string | null>(null);

  const [isPromoKitLoading, setIsPromoKitLoading] = useState(false);
  const [promoKitResults, setPromoKitResults] = useState<PromoKitResult | null>(null);
  const [promoKitError, setPromoKitError] = useState<string | null>(null);
  
  const [isCommunityPostLoading, setIsCommunityPostLoading] = useState(false);
  const [communityPostResults, setCommunityPostResults] = useState<CommunityPostResult | null>(null);
  const [communityPostError, setCommunityPostError] = useState<string | null>(null);

  const [isDeveloperAgentLoading, setIsDeveloperAgentLoading] = useState(false);
  const [developerAgentResults, setDeveloperAgentResults] = useState<DeveloperAgentResult | null>(null);
  const [developerAgentError, setDeveloperAgentError] = useState<string | null>(null);

  // Load history and check for tour on mount
  useEffect(() => {
    setHistory(getAnalysisHistory());
    try {
      const tourCompleted = localStorage.getItem(TOUR_STORAGE_KEY);
      if (!tourCompleted) {
        setIsTourActive(true);
      }
    } catch (e) {
      logger.warn('Не удалось получить доступ к localStorage для проверки статуса тура.');
    }
  }, []);
  
  const handleTourFinish = () => {
    try {
      localStorage.setItem(TOUR_STORAGE_KEY, 'true');
      setIsTourActive(false);
      logger.info('Режим обучения завершен и сохранен в localStorage.');
    } catch (e) {
      logger.warn('Не удалось сохранить статус завершения тура в localStorage.');
    }
  };


  const resetAllAgentResults = () => {
    setFeedbackResults(null);
    setFeedbackError(null);
    setSeoResults(null);
    setSeoError(null);
    setPromoKitResults(null);
    setPromoKitError(null);
    setCommunityPostResults(null);
    setCommunityPostError(null);
    setDeveloperAgentResults(null);
    setDeveloperAgentError(null);
  };

  const handleReset = useCallback(() => {
    setIsLoading(false);
    setResults(null);
    setError(null);
    setCurrentAnalysisId(null);
    resetAllAgentResults();
    logger.info('Приложение сброшено к начальному состоянию.');
  }, []);
  
  const handleSubmit = useCallback(async (formData: AnalysisFormData) => {
    setIsLoading(true);
    setError(null);
    setResults(null);
    setCurrentAnalysisId(null);
    resetAllAgentResults();
    setCurrentMode(formData.mode);
    logger.info(`Запуск анализа в режиме: ${formData.mode}`, { formData });

    try {
        const analysisResults = await analyzeContent(pyodide, formData);
        logger.info('Анализ успешно завершен.', { videoTitle: analysisResults.videoTitle });
        
        const newHistoryEntry: HistoryEntry = {
          id: `analysis-${Date.now()}`,
          timestamp: Date.now(),
          videoTitle: analysisResults.videoTitle,
          results: analysisResults,
          mode: formData.mode,
        };
        const updatedHistory = saveAnalysisToHistory(newHistoryEntry, history);
        setHistory(updatedHistory);
        setResults(analysisResults);
        setCurrentAnalysisId(newHistoryEntry.id);

    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Произошла неизвестная ошибка во время анализа.';
        setError(errorMessage);
        logger.error('Ошибка в процессе анализа', err);
    } finally {
        setIsLoading(false);
    }
  }, [pyodide, history]);
  
  const handleUpdateResults = useCallback((updatedResults: FullApiResponse) => {
      setResults(updatedResults);
      // FIX: Correctly update the specific history entry instead of always updating the first one.
      if (currentAnalysisId) {
          const updatedHistory = history.map(entry =>
              entry.id === currentAnalysisId
                  ? { ...entry, results: updatedResults }
                  : entry
          );
          // Only update state and localStorage if a change actually occurred
          if (JSON.stringify(history) !== JSON.stringify(updatedHistory)) {
              setHistory(updatedHistory);
              try {
                  localStorage.setItem('neuroTriggerAnalysisHistory', JSON.stringify(updatedHistory));
                  logger.info('Запись истории обновлена.', { id: currentAnalysisId });
              } catch (error) {
                  logger.error("Не удалось сохранить обновленную историю в localStorage", error);
              }
          }
      }
  }, [history, currentAnalysisId]);
  
  const handleLoadHistory = useCallback((entry: HistoryEntry) => {
      logger.info('Загрузка результатов из истории', { id: entry.id, title: entry.videoTitle });
      setResults(entry.results);
      setCurrentMode(entry.mode);
      setError(null);
      setIsLoading(false);
      setCurrentAnalysisId(entry.id);
      resetAllAgentResults();
      setIsHistoryPanelOpen(false);
  }, []);

  const handleClearHistory = useCallback(() => {
      logger.info('Очистка истории анализов.');
      clearAnalysisHistory();
      setHistory([]);
  }, []);
  
  // Agent runners
  const handleAnalyzeFeedback = useCallback(async (newStatsFile: File) => {
    if (!results) return;
    setIsFeedbackLoading(true);
    setFeedbackError(null);
    try {
      const feedback = await runFeedbackAnalysis(pyodide, results, newStatsFile);
      setFeedbackResults(feedback);
    } catch (err) {
      setFeedbackError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsFeedbackLoading(false);
    }
  }, [results, pyodide]);

  const handleRunSeoAgent = useCallback(async () => {
    if (!results) return;
    setIsSeoLoading(true);
    setSeoError(null);
    try {
      const seo = await runSeoAgent(results);
      setSeoResults(seo);
    } catch (err) {
      setSeoError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsSeoLoading(false);
    }
  }, [results]);

  const handleRunPromoKitAgent = useCallback(async () => {
    if (!results) return;
    setIsPromoKitLoading(true);
    setPromoKitError(null);
    try {
      const promo = await runPromoKitAgent(results);
      setPromoKitResults(promo);
    } catch (err) {
      setPromoKitError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsPromoKitLoading(false);
    }
  }, [results]);

  const handleRunCommunityPostAgent = useCallback(async () => {
    if (!results) return;
    setIsCommunityPostLoading(true);
    setCommunityPostError(null);
    try {
      const posts = await runCommunityPostAgent(results);
      setCommunityPostResults(posts);
    } catch (err) {
      setCommunityPostError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsCommunityPostLoading(false);
    }
  }, [results]);

  const handleRunDeveloperAgent = useCallback(async () => {
    if (!results) return;
    setIsDeveloperAgentLoading(true);
    setDeveloperAgentError(null);
    try {
      const devReport = await runDeveloperAgent(results);
      setDeveloperAgentResults(devReport);
    } catch (err) {
      setDeveloperAgentError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsDeveloperAgentLoading(false);
    }
  }, [results]);


  const renderContent = () => {
    if (isLoading) {
      return <LoadingIndicator mode={currentMode} />;
    }
    if (error) {
      return (
        <div className="text-center p-8 bg-red-900/20 border border-red-500 rounded-lg max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-red-300 mb-4">Произошла ошибка</h2>
            <p className="text-red-200 mb-6">{error}</p>
            <button onClick={handleReset} className="px-6 py-2 bg-blue-600 font-semibold rounded-lg hover:bg-blue-700 transition-colors">
                Начать сначала
            </button>
        </div>
      );
    }
    if (results) {
      return (
        <ResultsDisplay 
            results={results} 
            onReset={handleReset}
            mode={currentMode}
            onUpdateResults={handleUpdateResults}
            onAnalyzeFeedback={handleAnalyzeFeedback}
            isFeedbackLoading={isFeedbackLoading}
            feedbackResults={feedbackResults}
            feedbackError={feedbackError}
            onRunSeoAgent={handleRunSeoAgent}
            isSeoLoading={isSeoLoading}
            seoResults={seoResults}
            seoError={seoError}
            onRunPromoKitAgent={handleRunPromoKitAgent}
            isPromoKitLoading={isPromoKitLoading}
            promoKitResults={promoKitResults}
            promoKitError={promoKitError}
            onRunCommunityPostAgent={handleRunCommunityPostAgent}
            isCommunityPostLoading={isCommunityPostLoading}
            communityPostResults={communityPostResults}
            communityPostError={communityPostError}
            onRunDeveloperAgent={handleRunDeveloperAgent}
            isDeveloperAgentLoading={isDeveloperAgentLoading}
            developerAgentResults={developerAgentResults}
            developerAgentError={developerAgentError}
        />
      );
    }
    // Render form with pyodide error if it exists, but still allow creative mode
    if (pyodideError && !isPyodideLoading) {
        return (
             <div className="text-center p-8 bg-yellow-900/20 border border-yellow-500 rounded-lg max-w-3xl mx-auto space-y-4">
                <h2 className="text-2xl font-bold text-yellow-300">Ошибка аналитического модуля</h2>
                <p className="text-yellow-200">{pyodideError}</p>
                <p className="text-sm text-gray-400">
                  Полный анализ временно недоступен. Вы можете использовать **Креативный режим**, который не требует этого модуля, или перезагрузить страницу.
                </p>
                <InputForm onSubmit={handleSubmit} isFullAnalysisReady={!!pyodide} />
            </div>
        )
    }
    return <InputForm onSubmit={handleSubmit} isFullAnalysisReady={!!pyodide} />;
  };

  return (
    <div className="bg-gray-900 min-h-screen text-gray-200 font-sans">
      <Header 
        onToggleHistory={() => setIsHistoryPanelOpen(true)}
        onToggleLogPanel={() => setIsLogPanelOpen(true)}
        onStartTour={() => setIsTourActive(true)}
      />
      <main className="container mx-auto px-2 sm:px-4 py-6 sm:py-8">
        {renderContent()}
      </main>
      <HistoryPanel 
        isOpen={isHistoryPanelOpen}
        onClose={() => setIsHistoryPanelOpen(false)}
        history={history}
        onLoadHistory={handleLoadHistory}
        onClearHistory={handleClearHistory}
      />
      <LogPanel 
        isOpen={isLogPanelOpen}
        onClose={() => setIsLogPanelOpen(false)}
      />
      {isTourActive && !results && <Tour onFinish={handleTourFinish} />}
    </div>
  );
};

export default App;