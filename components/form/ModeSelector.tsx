import React from 'react';

const ModeSelector: React.FC<{
    mode: 'full' | 'creative';
    setMode: (mode: 'full' | 'creative') => void;
    isFullAnalysisReady: boolean;
}> = ({ mode, setMode, isFullAnalysisReady }) => {
    return (
        <div className="mb-6">
            <div className="p-1 bg-gray-900 rounded-lg flex space-x-1">
                <button
                    type="button"
                    onClick={() => setMode('full')}
                    disabled={!isFullAnalysisReady}
                    className={`w-1/2 p-3 text-sm font-semibold rounded-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 ${mode === 'full' ? 'bg-blue-600 text-white' : 'bg-transparent text-gray-300'} ${!isFullAnalysisReady ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-700'}`}
                >
                    Полный анализ (с удержанием)
                </button>
                <button
                    type="button"
                    onClick={() => setMode('creative')}
                    className={`w-1/2 p-3 text-sm font-semibold rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 ${mode === 'creative' ? 'bg-blue-600 text-white' : 'bg-transparent text-gray-300 hover:bg-gray-700'}`}
                >
                    Креативный режим (по тексту)
                </button>
            </div>
             {!isFullAnalysisReady && (
                <p className="text-xs text-blue-300 mt-2 text-center animate-pulse">
                    Инициализация аналитического модуля...
                </p>
            )}
        </div>
    );
};

export { ModeSelector };