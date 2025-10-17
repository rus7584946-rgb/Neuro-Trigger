import React from 'react';

interface TemperatureSliderProps {
    temperature: number;
    onTemperatureChange: (value: number) => void;
    dipSensitivity: number;
    onDipSensitivityChange: (value: number) => void;
    peakSensitivity: number;
    onPeakSensitivityChange: (value: number) => void;
    isFullAnalysis: boolean;
}

const getTemperatureDescription = (temp: number): React.ReactNode => {
    if (temp <= 0.2) {
        return (
            <>
                <span className="font-bold text-white">Максимальная точность:</span> Ответы будут очень предсказуемыми и сфокусированными. Идеально для извлечения фактов.
            </>
        );
    }
    if (temp <= 0.5) {
        return (
            <>
                <span className="font-bold text-white">Сбалансированный подход:</span> Ответы будут точными, но с долей умеренной креативности.
            </>
        );
    }
    if (temp <= 0.8) {
        return (
            <>
                <span className="font-bold text-white">Креативный режим:</span> Ответы станут более разнообразными и оригинальными. <span className="text-blue-300">Рекомендуется.</span>
            </>
        );
    }
    return (
        <>
            <span className="font-bold text-white">Максимальная креативность:</span> Ответы могут быть очень неожиданными и экспериментальными. Возможны неточности.
        </>
    );
};

const getDipSensitivityDescription = (sensitivity: number): React.ReactNode => {
    if (sensitivity <= 9) {
        return (
            <>
                <span className="font-bold text-white">Высокая чувствительность:</span> Будут найдены даже незначительные падения (больше "шума").
            </>
        );
    }
    if (sensitivity <= 14) {
        return (
            <>
                <span className="font-bold text-white">Сбалансированный режим:</span> Фокус на умеренно значимых падениях. <span className="text-blue-300">Рекомендуется.</span>
            </>
        );
    }
    return (
        <>
            <span className="font-bold text-white">Низкая чувствительность:</span> Только самые крупные падения будут считаться событиями (чистый "сигнал").
        </>
    );
};


const getPeakSensitivityDescription = (sensitivity: number): React.ReactNode => {
    if (sensitivity <= 1.4) {
        return (
            <>
                <span className="font-bold text-white">Высокая чувствительность:</span> Будут найдены даже малейшие всплески интереса (больше "шума").
            </>
        );
    }
    if (sensitivity <= 2.0) {
        return (
            <>
                <span className="font-bold text-white">Сбалансированный режим:</span> Фокус на статистически значимых пиках. <span className="text-blue-300">Рекомендуется.</span>
            </>
        );
    }
    return (
        <>
            <span className="font-bold text-white">Низкая чувствительность:</span> Будут найдены только самые мощные и аномальные пики (чистый "сигнал").
        </>
    );
};

export const TemperatureSlider: React.FC<TemperatureSliderProps> = ({
    temperature,
    onTemperatureChange,
    dipSensitivity,
    onDipSensitivityChange,
    peakSensitivity,
    onPeakSensitivityChange,
    isFullAnalysis
}) => {
    return (
        <div className="space-y-8">
            <div>
                <h4 className="text-base font-semibold text-gray-300">Креативность AI</h4>
                <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700 mt-2">
                    <label htmlFor="temperature" className="block mb-2 text-sm font-medium text-gray-300">
                        Температура: <span className="font-bold text-white">{temperature.toFixed(2)}</span>
                    </label>
                    <input
                        id="temperature"
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={temperature}
                        onChange={(e) => onTemperatureChange(parseFloat(e.target.value))}
                        className="custom-slider"
                    />
                    <p className="text-xs text-gray-400 mt-2 text-center h-8">{getTemperatureDescription(temperature)}</p>
                </div>
                <p className="text-xs text-center text-gray-500 mt-2">
                    Этот параметр влияет на все AI-генерации, кроме "Предпубликационного анализа", который всегда использует низкую температуру для стабильности.
                </p>
            </div>

            {isFullAnalysis && (
                <div>
                    <h4 className="text-base font-semibold text-gray-300">Чувствительность анализа данных</h4>
                    <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700 mt-2 space-y-6">
                        <div>
                            <label htmlFor="dipSensitivity" className="block mb-2 text-sm font-medium text-gray-300">
                               Порог значимости падения: <span className="font-bold text-white">{dipSensitivity}%</span>
                            </label>
                             <div className="flex justify-between text-xs text-gray-500 px-1 mb-1">
                                <span>Больше событий (шум)</span>
                                <span>Меньше событий (сигнал)</span>
                            </div>
                            <input
                                id="dipSensitivity"
                                type="range"
                                min="5"
                                max="20"
                                step="1"
                                value={dipSensitivity}
                                onChange={(e) => onDipSensitivityChange(parseInt(e.target.value, 10))}
                                className="custom-slider"
                            />
                            <p className="text-xs text-gray-400 mt-2 text-center h-10">
                                {getDipSensitivityDescription(dipSensitivity)}
                            </p>
                        </div>
                         <div>
                            <label htmlFor="peakSensitivity" className="block mb-2 text-sm font-medium text-gray-300">
                                Порог значимости пика: <span className="font-bold text-white">{peakSensitivity.toFixed(1)}x от среднего (σ)</span>
                            </label>
                             <div className="flex justify-between text-xs text-gray-500 px-1 mb-1">
                                <span>Больше событий (шум)</span>
                                <span>Меньше событий (сигнал)</span>
                            </div>
                            <input
                                id="peakSensitivity"
                                type="range"
                                min="1"
                                max="3"
                                step="0.1"
                                value={peakSensitivity}
                                onChange={(e) => onPeakSensitivityChange(parseFloat(e.target.value))}
                                className="custom-slider"
                            />
                            <p className="text-xs text-gray-400 mt-2 text-center h-10">
                                {getPeakSensitivityDescription(peakSensitivity)}
                            </p>
                        </div>
                    </div>
                     <p className="text-xs text-center text-gray-500 mt-2">
                        Эти настройки влияют на то, как Python-анализатор находит ключевые моменты в файле статистики. Они **не** влияют на креативность AI.
                    </p>
                </div>
            )}
        </div>
    );
};