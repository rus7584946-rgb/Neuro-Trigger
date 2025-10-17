import React, { useState, useEffect } from 'react';

export const AgentLoader: React.FC = () => (
    <div className="flex items-center justify-center p-8 text-gray-400">
        <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span>Загрузка модуля...</span>
    </div>
);


export const AgentSection: React.FC<{
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
    isLoading: boolean;
    error: string | null;
    onRun: () => void;
    results: any | null;
    buttonText: string;
}> = React.memo(({ title, icon, children, isLoading, error, onRun, results, buttonText }) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleToggle = () => {
        // Запускаем агент только если секция закрыта и для нее еще нет результатов
        if (!isOpen && !results && !isLoading) {
            onRun();
        }
        setIsOpen(prev => !prev);
    };

    // Автоматически открываем секцию, если начинается загрузка и она была закрыта
    useEffect(() => {
        if (isLoading && !isOpen) {
            setIsOpen(true);
        }
    }, [isLoading, isOpen]);

    return (
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg">
            <button onClick={handleToggle} className="w-full p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 text-left" aria-expanded={isOpen}>
                <div className="flex items-center space-x-3">
                    {icon}
                    <h3 className="text-lg sm:text-xl font-bold text-white">{title}</h3>
                </div>
                <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
                    {isLoading && <div role="status" className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"><span className="sr-only">Загрузка...</span></div>}
                    {!results && !isLoading && <span className="px-3 py-1 bg-blue-600 text-xs font-semibold rounded-md hover:bg-blue-700">{buttonText}</span>}
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 text-gray-400 transition-transform duration-300 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
            </button>
            {isOpen && (
                <div className="p-4 sm:p-6 border-t border-gray-700/50 animate-fade-in-fast">
                    {isLoading && <AgentLoader />}
                    {error && <div className="bg-red-900/30 border border-red-500 text-red-300 p-3 rounded-lg mb-4">{error}</div>}
                    {results && !isLoading && children}
                </div>
            )}
        </div>
    );
});