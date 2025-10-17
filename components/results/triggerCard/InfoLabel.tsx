import React from 'react';

export const InfoLabel: React.FC<{
    type: 'analysis' | 'creative';
    title: string;
    children: React.ReactNode;
}> = ({ type, title, children }) => {
    const icon = type === 'analysis' ? '🔬' : '💡';
    const tooltipText = type === 'analysis'
        ? 'Основано на данных: Этот раздел сгенерирован путем прямого анализа предоставленных вами файлов (транскрипции, статистики).'
        : 'Творчество AI: Этот раздел является креативным предложением от AI, разработанным для усиления воздействия на зрителя.';

    return (
        <div>
            <div className="group relative flex items-center mb-3">
                <span className="text-lg mr-2">{icon}</span>
                <h4 className="font-bold text-blue-300">{title}</h4>
                <div className="absolute left-0 bottom-full mb-2 w-72 p-2 bg-gray-900 text-white text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 border border-gray-600">
                    {tooltipText}
                </div>
            </div>
            {children}
        </div>
    );
};
