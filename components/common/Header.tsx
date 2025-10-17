import React from 'react';

export const Header: React.FC<{ 
  onToggleHistory: () => void; 
  onToggleLogPanel: () => void;
  onStartTour: () => void;
}> = ({ onToggleHistory, onToggleLogPanel, onStartTour }) => {
  return (
    <header className="bg-gray-900/70 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-20">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <h1 className="text-xl sm:text-2xl font-bold text-white">Генератор Нейро-Триггеров</h1>
        </div>
        <nav aria-label="Основные действия и навигация">
            <div className="flex items-center space-x-4">
               <button
                onClick={onStartTour}
                className="flex items-center space-x-2 text-sm text-gray-300 hover:text-blue-400 transition-colors"
                aria-label="Начать обучение"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Обучение</span>
              </button>
              <button
                onClick={onToggleLogPanel}
                className="flex items-center space-x-2 text-sm text-gray-300 hover:text-blue-400 transition-colors"
                aria-label="Открыть журнал событий приложения"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                <span>Журнал</span>
              </button>
              <button
                onClick={onToggleHistory}
                className="flex items-center space-x-2 text-sm text-gray-300 hover:text-blue-400 transition-colors"
                aria-label="Открыть историю предыдущих анализов"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>История</span>
              </button>
             <a 
              href="https://github.com/google/genai-js" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-sm text-gray-400 hover:text-blue-400 transition-colors hidden sm:block">
              Работает на Gemini
            </a>
            </div>
        </nav>
      </div>
    </header>
  );
};