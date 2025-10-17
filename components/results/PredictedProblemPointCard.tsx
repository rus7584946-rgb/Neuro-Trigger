import React from 'react';
import type { PredictedProblemPoint } from '../../types.ts';
import { formatTime } from '../../utils/formatters.ts';

const reasonConfig = {
    'Сложность': { icon: '🧠', color: 'border-yellow-500/30 text-yellow-300' },
    'Затянутость': { icon: '⏳', color: 'border-blue-500/30 text-blue-300' },
    'Потеря Контекста': { icon: '🔗', color: 'border-purple-500/30 text-purple-300' },
    'Низкая Энергия': { icon: '⚡️', color: 'border-gray-500/30 text-gray-300' },
    'Другое': { icon: '❓', color: 'border-pink-500/30 text-pink-300' },
};

export const PredictedProblemPointCard: React.FC<{ point: PredictedProblemPoint }> = ({ point }) => {
    const config = reasonConfig[point.reason] || reasonConfig['Другое'];

    return (
        <div className={`bg-gray-800/30 border p-4 rounded-lg ${config.color}`}>
            <div className="flex items-center mb-2">
                <span className="text-xl mr-2">{config.icon}</span>
                <h4 className={`font-bold text-lg ${config.color.split(' ')[1]}`}>
                    Прогноз проблемы в {formatTime(point.timestamp)}: {point.reason} (-{point.predictedDrop}%)
                </h4>
            </div>
            <p className="text-sm text-gray-300 mb-3">{point.explanation}</p>
            <blockquote className="border-l-4 border-gray-600 pl-4 italic text-sm text-gray-400">
                "{point.quote}"
            </blockquote>
        </div>
    );
};