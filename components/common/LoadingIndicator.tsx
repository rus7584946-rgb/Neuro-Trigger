import React, { useState, useEffect } from 'react';
import { creativeMessages, fullAnalysisMessages } from '../../constants/ui.ts';

interface LoadingIndicatorProps {
    mode: 'full' | 'creative';
}

export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ mode }) => {
    const messages = mode === 'creative' ? creativeMessages : fullAnalysisMessages;
    const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

    useEffect(() => {
        // Сбросить индекс при смене режима
        setCurrentMessageIndex(0);
        
        const intervalId = setInterval(() => {
            setCurrentMessageIndex(prevIndex => (prevIndex + 1) % messages.length);
        }, 2500);

        return () => clearInterval(intervalId);
    }, [mode, messages]);

    return (
        <div className="text-center p-8 flex flex-col items-center justify-center space-y-6">
            <div className="relative w-24 h-24 gpu-accelerate">
                <div className="absolute inset-0 rounded-full border-4 border-blue-500/30"></div>
                <div className="absolute inset-0 rounded-full border-t-4 border-blue-500 animate-spin"></div>
            </div>
            <h2 className="text-2xl font-semibold text-blue-300">{mode === 'full' ? 'Нейро-анализ...' : 'Креативная генерация...'}</h2>
            <div className="text-center h-12">
                <p className="text-gray-400 transition-opacity duration-500">{messages[currentMessageIndex]}</p>
                <p className="text-xs text-gray-500 mt-2">(Шаг {currentMessageIndex + 1} из {messages.length})</p>
            </div>
        </div>
    );
};
