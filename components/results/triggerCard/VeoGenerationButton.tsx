// components/results/triggerCard/VeoGenerationButton.tsx

import React, { useState, useEffect } from 'react';
import { generateVideoWithVEO, generateVeoPrompt } from '../../../services/veoService.ts';
import type { Trigger } from '../../../types.ts';
import { veoGenerationMessages } from '../../../constants/ui.ts';

export const VeoGenerationButton: React.FC<{ trigger: Trigger }> = ({ trigger }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [loadingMessage, setLoadingMessage] = useState(veoGenerationMessages[0]);

    useEffect(() => {
        let intervalId: number;
        if (isLoading) {
            setLoadingMessage(veoGenerationMessages[0]); // Reset to first message on new generation
            intervalId = window.setInterval(() => {
                setLoadingMessage(prev => {
                    const currentIndex = veoGenerationMessages.indexOf(prev);
                    return veoGenerationMessages[(currentIndex + 1) % veoGenerationMessages.length];
                });
            }, 3000);
        }
        return () => clearInterval(intervalId);
    }, [isLoading]);

    const handleGenerate = async () => {
        setIsLoading(true);
        setError(null);
        setVideoUrl(null);
        try {
            const prompt = generateVeoPrompt(trigger);
            const url = await generateVideoWithVEO(prompt);
            setVideoUrl(url);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center text-center p-4 bg-gray-700/50 rounded-lg">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-400 mx-auto mb-2"></div>
                <p className="text-sm text-gray-300 transition-opacity duration-500">{loadingMessage}</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center text-left p-4 bg-red-900/30 border border-red-500 rounded-lg">
                <p className="text-sm font-semibold text-red-300 text-center">Ошибка: {error}</p>
                <button onClick={handleGenerate} className="mt-2 text-xs text-blue-300 hover:underline">Попробовать снова</button>
            </div>
        );
    }
    
    if (videoUrl) {
        return (
            <div className="w-full h-full flex flex-col space-y-2">
                <video src={videoUrl} controls className="w-full rounded-lg flex-grow object-cover" />
                <a href={videoUrl} download={`${trigger.name.replace(/\s/g, '_')}.mp4`} className="block w-full text-center px-4 py-2 bg-green-600 text-sm font-semibold rounded-lg hover:bg-green-700 transition-colors">
                    Скачать видео
                </a>
            </div>
        );
    }

    return (
        <button
            onClick={handleGenerate}
            className="w-full h-full px-4 py-2 bg-indigo-600 text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center space-x-2"
        >
             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2-2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" /></svg>
             <span>Сгенерировать Видео-превью</span>
        </button>
    );
};