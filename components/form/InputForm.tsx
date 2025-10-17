import React, { useState, useCallback, useEffect } from 'react';
import type { QrCodeFile, GeminiModel, AnalysisFormData } from '../../types.ts';
import { FileInput } from './FileInput.tsx';
import { ModeSelector } from './ModeSelector.tsx';
import { TextInput } from './TextInput.tsx';
import { TemperatureSlider } from './TemperatureSlider.tsx';
import { TimelineSlider } from './TimelineSlider.tsx';
import { analyzeTranscription } from '../../services/transcriptionAnalyzer.ts';
import { extractVideoMetadata } from '../../services/geminiService.ts';
import { readFileAsText } from '../../utils/fileUtils.ts';
import { logger } from '../../services/loggingService.ts';

interface InputFormProps {
  onSubmit: (formData: AnalysisFormData) => void;
  isFullAnalysisReady: boolean;
}

export const InputForm: React.FC<InputFormProps> = ({ onSubmit, isFullAnalysisReady }) => {
  const [transcriptionFile, setTranscriptionFile] = useState<File | null>(null);
  const [transcriptionContent, setTranscriptionContent] = useState<string | null>(null);
  const [transcriptionDuration, setTranscriptionDuration] = useState(0);
  const [timeRange, setTimeRange] = useState<[number, number]>([0, 0]);
  const [isExtractingMetadata, setIsExtractingMetadata] = useState(false);

  const [statsFiles, setStatsFiles] = useState<File[] | null>(null);
  const [videoTitle, setVideoTitle] = useState('');
  const [videoDescription, setVideoDescription] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [qrCodes, setQrCodes] = useState<QrCodeFile[]>([]);
  
  const [language, setLanguage] = useState('ru');
  const [temperature, setTemperature] = useState(0.20);
  const [dipSensitivity, setDipSensitivity] = useState(12);
  const [peakSensitivity, setPeakSensitivity] = useState(1.5);
  const [qrCodeCount, setQrCodeCount] = useState('auto');
  const [triggerCount, setTriggerCount] = useState('auto');
  const [mode, setMode] = useState<'full' | 'creative'>('full');
  const [predictiveAnalysisEnabled, setPredictiveAnalysisEnabled] = useState(false);
  const [prePublicationAnalysisEnabled, setPrePublicationAnalysisEnabled] = useState(true);

  // The 'gemini-2.5-pro' model is not available for this task.
  // The application is now locked to 'gemini-2.5-flash' as per the guidelines.
  const model: GeminiModel = 'gemini-2.5-flash';

  // Effect to clean up QR code preview URLs to prevent memory leaks.
  useEffect(() => {
    // This function will be called when the component unmounts or before the effect runs again.
    return () => {
      qrCodes.forEach(qr => URL.revokeObjectURL(qr.previewUrl));
    };
  }, [qrCodes]); // Rerun the cleanup if the qrCodes array changes.

  const handleTranscriptionChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      logger.info('Загружен файл транскрипции.', { name: file.name, size: file.size });
      setTranscriptionFile(file);
      setIsExtractingMetadata(true);
      logger.info('Начало автоматического извлечения метаданных...');

      try {
        const text = await readFileAsText(file);
        setTranscriptionContent(text);
        
        const analysis = analyzeTranscription(text, file.name);
        const duration = Math.round(analysis.metadata.totalDuration);
        setTranscriptionDuration(duration);
        setTimeRange([0, duration]);

        // Auto-fill metadata using AI
        const metadata = await extractVideoMetadata(text);
        setVideoTitle(metadata.videoTitle);
        setVideoDescription(metadata.videoDescription);
        setTargetAudience(metadata.targetAudience);
        logger.info('Метаданные успешно извлечены и подставлены в форму.');

      } catch (error) {
        logger.error('Ошибка при обработке файла транскрипции', error);
        console.error("Error processing transcription file:", error);
        setTranscriptionContent(null);
        setTranscriptionDuration(0);
      } finally {
        setIsExtractingMetadata(false);
      }
    }
  }, []);

  const handleStatsChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setStatsFiles(files);
      // FIX: Explicitly type the 'f' parameter as 'File' to resolve the TypeScript error.
      // TypeScript was unable to infer the type of elements from e.target.files, leading to 'f' being of type 'any'.
      logger.info('Загружен(ы) файл(ы) статистики.', { count: files.length, names: files.map((f: File) => f.name) });
    }
  }, []);

  const handleQrCodeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
        const newFiles = Array.from(e.target.files).map((file: File) => ({
            id: `${file.name}-${file.lastModified}`,
            file,
            previewUrl: URL.createObjectURL(file),
            description: file.name.split('.').slice(0, -1).join('.') || 'QR-код',
        }));
        setQrCodes(prev => [...prev, ...newFiles]);
        logger.info('Загружен(ы) QR-код(ы).', { count: newFiles.length });
    }
  }, []);

  const handleQrDescriptionChange = (id: string, newDescription: string) => {
    setQrCodes(prev => prev.map(qr => qr.id === id ? { ...qr, description: newDescription } : qr));
  };
  
  const removeQrCode = (id: string) => {
    setQrCodes(prev => prev.filter(qr => qr.id !== id));
    logger.info('QR-код удален.', { id });
  };
  
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!transcriptionFile) {
        alert('Пожалуйста, загрузите файл транскрипции.');
        logger.warn('Попытка отправки формы без файла транскрипции.');
        return;
    }
    const formData: AnalysisFormData = {
        transcriptionFile,
        statsFiles,
        videoTitle,
        videoDescription,
        targetAudience,
        language,
        temperature,
        qrCodeCount,
        triggerCount,
        qrCodes,
        mode,
        model,
        dipSensitivity,
        peakSensitivity,
        predictiveAnalysisEnabled,
        prePublicationAnalysisEnabled
    };
    
    if (transcriptionDuration > 0 && (timeRange[0] !== 0 || timeRange[1] !== transcriptionDuration)) {
        formData.timeRange = timeRange;
    }

    onSubmit(formData);
  }, [transcriptionFile, statsFiles, videoTitle, videoDescription, targetAudience, language, temperature, qrCodeCount, triggerCount, qrCodes, mode, dipSensitivity, peakSensitivity, onSubmit, timeRange, transcriptionDuration, predictiveAnalysisEnabled, prePublicationAnalysisEnabled]);

  const isFullAnalysis = mode === 'full';
  const isSubmitDisabled = !transcriptionFile || (isFullAnalysis && !isFullAnalysisReady) || isExtractingMetadata;

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto bg-gray-800/40 p-4 md:p-8 rounded-xl border border-gray-700">
      
      <div id="tour-step-1">
        <ModeSelector mode={mode} setMode={setMode} isFullAnalysisReady={isFullAnalysisReady} />
      </div>

      <div id="tour-step-2">
        <h3 className="text-xl font-bold text-blue-300 mb-4">Основные данные</h3>
        <div className="space-y-6">
           <div className={`grid grid-cols-1 ${isFullAnalysis ? 'md:grid-cols-2' : ''} gap-6`}>
              <FileInput
                  id="transcription"
                  label="1. Транскрипция видео (.txt, .sbv)"
                  files={transcriptionFile ? [transcriptionFile] : null}
                  onChange={handleTranscriptionChange}
                  accept=".txt,.sbv"
              />
              {isFullAnalysis && (
                  <FileInput
                      id="stats"
                      label="2. Статистика удержания (.csv, .txt)"
                      files={statsFiles}
                      onChange={handleStatsChange}
                      accept=".csv,.txt"
                      multiple={true}
                  />
              )}
          </div>
          {transcriptionContent && (
             <div className="mt-4 p-4 bg-gray-900/50 rounded-lg max-h-32 overflow-y-auto border border-gray-700">
                <p className="text-xs text-gray-400 whitespace-pre-wrap">{transcriptionContent}</p>
             </div>
          )}
          {transcriptionDuration > 0 && (
             <TimelineSlider
                duration={transcriptionDuration}
                value={timeRange}
                onChange={setTimeRange}
              />
          )}
          <TextInput id="videoTitle" label="3. Название видео" value={videoTitle} onChange={(e) => setVideoTitle(e.target.value)} placeholder="Например: 'Лучшая стратегия скальпинга на 2024 год'" isLoading={isExtractingMetadata} />
          <TextInput id="videoDescription" label="4. Описание видео (кратко)" as="textarea" value={videoDescription} onChange={(e) => setVideoDescription(e.target.value)} placeholder="О чем это видео? Какую проблему оно решает?" isLoading={isExtractingMetadata} />
          <TextInput id="targetAudience" label="5. Целевая аудитория" as="textarea" value={targetAudience} onChange={(e) => setTargetAudience(e.target.value)} placeholder="Например: 'Начинающие трейдеры, которые боятся потерять деньги'" isLoading={isExtractingMetadata} />
        </div>
      </div>

       <div id="tour-step-3">
        <h3 className="text-xl font-bold text-blue-300 mb-4 border-t border-gray-700 pt-6">QR-коды для монетизации (опционально)</h3>
        <FileInput id="qrCodes" label="Загрузите QR-коды" files={qrCodes.map(qr => qr.file)} onChange={handleQrCodeChange} accept="image/png, image/jpeg" multiple={true} />
        {qrCodes.length > 0 && (
          <div className="mt-4 space-y-3 max-h-60 overflow-y-auto pr-2">
            {qrCodes.map((qr) => (
              <div key={qr.id} className="flex items-center space-x-3 bg-gray-800 p-2 rounded-lg border border-gray-700">
                <img src={qr.previewUrl} alt="QR preview" className="w-12 h-12 rounded" />
                <input 
                  type="text" 
                  value={qr.description} 
                  onChange={(e) => handleQrDescriptionChange(qr.id, e.target.value)}
                  placeholder="Описание (напр., 'Мой Telegram')"
                  className="flex-grow bg-gray-700 border border-gray-600 rounded p-2 text-sm text-gray-200 focus:ring-blue-500 focus:border-blue-500"
                />
                <button type="button" onClick={() => removeQrCode(qr.id)} className="text-red-400 hover:text-red-300 p-1 rounded-full bg-gray-700 hover:bg-gray-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div id="tour-step-4">
        <h3 className="text-xl font-bold text-blue-300 mb-4 border-t border-gray-700 pt-6">Настройки AI</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <div>
            <label htmlFor="model" className="block mb-2 text-sm font-medium text-gray-300">Модель Gemini</label>
            <div
              id="model"
              className="w-full bg-gray-800 border border-gray-600 rounded-lg p-2.5 text-gray-400"
            >
              Gemini 2.5 Flash
            </div>
          </div>
          <div>
            <label htmlFor="language" className="block mb-2 text-sm font-medium text-gray-300">Язык вывода</label>
            <select id="language" value={language} onChange={(e) => setLanguage(e.target.value)} className="w-full bg-gray-800 border border-gray-600 rounded-lg p-2.5 text-gray-200 focus:ring-blue-500 focus:border-blue-500">
                <option value="ru">Русский</option>
                <option value="en">English</option>
            </select>
          </div>
            <div>
                <label htmlFor="triggerCount" className="block mb-2 text-sm font-medium text-gray-300">Количество триггеров</label>
                <select id="triggerCount" value={triggerCount} onChange={(e) => setTriggerCount(e.target.value)} className="w-full bg-gray-800 border border-gray-600 rounded-lg p-2.5 text-gray-200 focus:ring-blue-500 focus:border-blue-500">
                    <option value="auto">Автоматически</option>
                    <option value="0">Не генерировать</option>
                    {Array.from({ length: 10 }, (_, i) => i + 1).map(num => (
                      <option key={num} value={num}>{num}</option>
                    ))}
                </select>
            </div>
          <div>
              <label htmlFor="qrCodeCount" className="block mb-2 text-sm font-medium text-gray-300">Желаемое количество QR-кодов</label>
              <select id="qrCodeCount" value={qrCodeCount} onChange={(e) => setQrCodeCount(e.target.value)} className="w-full bg-gray-800 border border-gray-600 rounded-lg p-2.5 text-gray-200 focus:ring-blue-500 focus:border-blue-500">
                  <option value="auto">Автоматически</option>
                  <option value="0">Не добавлять</option>
                  {Array.from({ length: 10 }, (_, i) => i + 1).map(num => (
                    <option key={num} value={num}>{num}</option>
                  ))}
              </select>
          </div>
          <div className="md:col-span-2 space-y-4 pt-4 border-t border-gray-700/50">
            <h4 className="text-base font-semibold text-gray-300 -mb-2">Бета-функции AI (для обоих режимов)</h4>
            <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                <label className="flex items-center justify-between cursor-pointer">
                    <span className="flex flex-col pr-4">
                        <span className="font-medium text-gray-200">Прогнозирование Удержания</span>
                        <span className="text-xs text-gray-400">AI предскажет кривую по тексту. Полезно для сравнения с реальными данными или для прогноза до публикации.</span>
                    </span>
                    <div className="relative flex-shrink-0">
                        <input type="checkbox" checked={predictiveAnalysisEnabled} onChange={(e) => setPredictiveAnalysisEnabled(e.target.checked)} className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </div>
                </label>
            </div>
            <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                <label className="flex items-center justify-between cursor-pointer">
                    <span className="flex flex-col pr-4">
                        <span className="font-medium text-gray-200">Предпубликационный Анализ</span>
                        <span className="text-xs text-gray-400">AI найдет "слепые зоны" и предскажет проблемы по тексту, независимо от режима.</span>
                    </span>
                    <div className="relative flex-shrink-0">
                        <input type="checkbox" checked={prePublicationAnalysisEnabled} onChange={(e) => setPrePublicationAnalysisEnabled(e.target.checked)} className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </div>
                </label>
            </div>
          </div>

          <div className="md:col-span-2">
            <TemperatureSlider
                temperature={temperature}
                onTemperatureChange={setTemperature}
                dipSensitivity={dipSensitivity}
                onDipSensitivityChange={setDipSensitivity}
                peakSensitivity={peakSensitivity}
                onPeakSensitivityChange={setPeakSensitivity}
                isFullAnalysis={isFullAnalysis}
            />
          </div>
        </div>
      </div>
      
      <div id="tour-step-5" className="flex flex-col items-center mt-10">
          <button type="submit" disabled={isSubmitDisabled} className="w-full md:w-auto px-12 py-4 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-all transform hover:scale-105 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center space-x-2">
              {isExtractingMetadata ? (
                <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Анализ текста...</span>
                </>
              ) : (
                <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span>Сгенерировать Триггеры</span>
                </>
              )}
          </button>
      </div>
    </form>
  );
};