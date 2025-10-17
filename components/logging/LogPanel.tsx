// components/logging/LogPanel.tsx
import React, { useState, useEffect } from 'react';
import { logger } from '../../services/loggingService.ts';
import type { LogEntry } from '../../types.ts';

interface LogPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const LogLevelIndicator: React.FC<{ level: LogEntry['level'] }> = ({ level }) => {
    const config = {
        INFO: { color: 'bg-blue-500', text: 'INFO' },
        WARN: { color: 'bg-yellow-500', text: 'WARN' },
        ERROR: { color: 'bg-red-500', text: 'ERR' },
    };
    const { color, text } = config[level];
    return <span className={`px-2 py-0.5 text-xs font-bold text-white rounded-full ${color}`}>{text}</span>;
};

export const LogPanel: React.FC<LogPanelProps> = ({ isOpen, onClose }) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [copyText, setCopyText] = useState('Копировать');

  useEffect(() => {
    const unsubscribe = logger.subscribe(setLogs);
    return () => unsubscribe();
  }, []);

  const handleClear = () => {
    if (window.confirm('Вы уверены, что хотите очистить журнал?')) {
      logger.clearLogs();
    }
  };
  
  const handleCopy = () => {
      const logText = logs.map(log => 
        `[${log.timestamp.toISOString()}] [${log.level}] ${log.message}` + 
        (log.details ? `\n${JSON.stringify(log.details, null, 2)}` : '')
      ).join('\n\n');

      navigator.clipboard.writeText(logText).then(() => {
          setCopyText('Скопировано!');
          setTimeout(() => setCopyText('Копировать'), 2000);
      });
  };

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/60 z-30 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className={`fixed top-0 right-0 h-full w-full max-w-2xl bg-gray-900 border-l border-gray-700 shadow-2xl z-40 transform transition-transform duration-300 ease-in-out gpu-accelerate ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="log-panel-title"
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b border-gray-700 flex-shrink-0">
            <h2 id="log-panel-title" className="text-xl font-bold text-white flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                 <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              Журнал событий
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 rounded-full hover:bg-gray-700 hover:text-white transition-colors"
              aria-label="Закрыть журнал"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex-grow p-4 overflow-y-auto font-mono text-sm">
            {logs.length > 0 ? (
              <ul className="space-y-3">
                {logs.map((log) => (
                  <li key={log.timestamp.getTime() + Math.random()} className="flex items-start gap-3">
                     <span className="text-gray-500 whitespace-nowrap">{log.timestamp.toLocaleTimeString('ru-RU', { hour12: false })}</span>
                     <LogLevelIndicator level={log.level} />
                     <div className="flex-grow">
                        <p className="text-gray-200">{log.message}</p>
                        {log.details && (
                             <details className="mt-1">
                                <summary className="text-xs text-gray-500 cursor-pointer">Детали</summary>
                                <pre className="mt-1 text-xs text-gray-400 bg-gray-800 p-2 rounded overflow-auto">
                                    {JSON.stringify(log.details, null, 2)}
                                </pre>
                             </details>
                        )}
                     </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center text-gray-500 pt-16">
                <p>Журнал событий пуст.</p>
              </div>
            )}
          </div>
          
          <div className="p-4 border-t border-gray-700 flex-shrink-0 flex items-center gap-4">
            <button onClick={handleCopy} className="w-full px-4 py-2 bg-blue-600 text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors">
              {copyText}
            </button>
            <button
              onClick={handleClear}
              className="w-full px-4 py-2 bg-red-800/50 text-red-300 text-sm font-semibold rounded-lg hover:bg-red-700/50 hover:text-red-200 transition-colors"
              disabled={logs.length === 0}
            >
              Очистить
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};