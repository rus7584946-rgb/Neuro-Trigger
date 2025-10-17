import React from 'react';
import type { HistoryEntry } from '../../types.ts';

interface HistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryEntry[];
  onLoadHistory: (entry: HistoryEntry) => void;
  onClearHistory: () => void;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({
  isOpen,
  onClose,
  history,
  onLoadHistory,
  onClearHistory,
}) => {
  const handleClear = () => {
    if (window.confirm('Вы уверены, что хотите очистить всю историю анализов? Это действие необратимо.')) {
      onClearHistory();
    }
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/60 z-30 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Panel */}
      <aside
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-gray-900 border-l border-gray-700 shadow-2xl z-40 transform transition-transform duration-300 ease-in-out gpu-accelerate ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="history-panel-title"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-700 flex-shrink-0">
            <h2 id="history-panel-title" className="text-xl font-bold text-white flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              История Анализов
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 rounded-full hover:bg-gray-700 hover:text-white transition-colors"
              aria-label="Закрыть историю"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="flex-grow p-4 overflow-y-auto">
            {history.length > 0 ? (
              <ul className="space-y-3">
                {history.map((entry) => (
                  <li key={entry.id}>
                    <button
                      onClick={() => onLoadHistory(entry)}
                      className="w-full text-left p-4 bg-gray-800/50 border border-gray-700 rounded-lg hover:bg-gray-700 hover:border-blue-500 transition-all"
                    >
                      <p className="font-semibold text-blue-300 truncate" title={entry.videoTitle}>
                        {entry.videoTitle || 'Анализ без названия'}
                      </p>
                      <div className="flex justify-between items-center mt-2 text-xs text-gray-400">
                        <span>{new Date(entry.timestamp).toLocaleString('ru-RU')}</span>
                        <span className={`px-2 py-0.5 rounded-full ${entry.mode === 'full' ? 'bg-green-500/20 text-green-300' : 'bg-purple-500/20 text-purple-300'}`}>
                          {entry.mode === 'full' ? 'Полный' : 'Креатив'}
                        </span>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center text-gray-500 pt-16">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
                <p className="font-semibold">История пуста</p>
                <p className="text-sm">Результаты ваших будущих анализов появятся здесь.</p>
              </div>
            )}
          </div>
          
          {/* Footer */}
          {history.length > 0 && (
            <div className="p-4 border-t border-gray-700 flex-shrink-0">
              <button
                onClick={handleClear}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-red-800/50 text-red-300 text-sm font-semibold rounded-lg hover:bg-red-700/50 hover:text-red-200 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span>Очистить историю</span>
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};