import React from 'react';
import type { DeveloperAgentResult } from '../../types.ts';
import { CodeBlock } from '../common/CodeBlock.tsx';
import { CopyButton } from '../common/CopyButton.tsx';

const AgentSuggestion: React.FC<{ agentName: string, justification: string }> = ({ agentName, justification }) => {
    let icon = '💡';
    let color = 'border-blue-500/50';
    if (agentName === 'SEO') {
        icon = '🔍';
        color = 'border-green-500/50';
    } else if (agentName === 'Промо-кит') {
        icon = '🚀';
        color = 'border-purple-500/50';
    } else if (agentName === 'Посты для Сообщества') {
        icon = '💬';
        color = 'border-indigo-500/50';
    }

    return (
        <div className={`bg-gray-800/50 border ${color} p-4 rounded-lg`}>
            <div className="flex items-center mb-2">
                <span className="text-2xl mr-3">{icon}</span>
                <h5 className="font-bold text-lg text-white">Запустить: {agentName}</h5>
            </div>
            <p className="text-sm text-gray-300">{justification}</p>
        </div>
    );
};

const DeveloperAgentDisplay: React.FC<{ results: DeveloperAgentResult }> = React.memo(({ results }) => {
    const {
        overallCodeQualitySummary,
        promptImprovements = [],
        logicalConsistencyChecks = [],
        suggestedNextAgents = [],
    } = results;

    return (
        <div className="space-y-8 animate-fade-in-fast">
            <div>
                <h4 className="text-lg font-bold text-blue-300 mb-2">Общая оценка качества</h4>
                <p className="text-sm text-gray-300 bg-gray-900/50 p-3 rounded-lg border border-gray-700">{overallCodeQualitySummary}</p>
            </div>

            {promptImprovements.length > 0 && (
                <div>
                    <h4 className="text-lg font-bold text-blue-300 mb-3">Улучшения Промптов</h4>
                    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                        {promptImprovements.map((item, index) => (
                            <div key={index} className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                                <h5 className="font-semibold text-white mb-2">Улучшение для триггера #{item.triggerId}</h5>
                                <p className="text-xs text-yellow-300 bg-yellow-900/20 p-2 rounded-md mb-3">{item.justification}</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[450px] md:h-64">
                                    <div>
                                        <label className="text-xs font-semibold text-gray-400">ОРИГИНАЛ:</label>
                                        <CodeBlock code={item.originalPrompt} />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-green-300">УЛУЧШЕННАЯ ВЕРСИЯ:</label>
                                        <div className="relative h-full">
                                            <CodeBlock code={item.improvedPrompt} />
                                            <div className="absolute bottom-2 right-2">
                                               <CopyButton textToCopy={item.improvedPrompt} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            
            {logicalConsistencyChecks.length > 0 && (
                 <div>
                    <h4 className="text-lg font-bold text-blue-300 mb-3">Проверка Логики</h4>
                     <div className="space-y-3">
                         {logicalConsistencyChecks.map((item, index) => (
                             <div key={index} className="bg-red-900/20 border border-red-500/50 p-4 rounded-lg">
                                <h5 className="font-semibold text-red-200 mb-2">Найдено несоответствие в триггере #{item.triggerId}</h5>
                                <p className="text-sm text-gray-300 mb-2">{item.mismatchDescription}</p>
                                <p className="text-sm text-green-300 bg-green-900/20 p-2 rounded-md">
                                    <span className="font-bold">Рекомендация:</span> {item.suggestedFix}
                                </p>
                            </div>
                         ))}
                    </div>
                </div>
            )}

            {suggestedNextAgents.length > 0 && (
                <div>
                    <h4 className="text-lg font-bold text-blue-300 mb-3">Рекомендованные следующие шаги</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {suggestedNextAgents.map((agent, index) => (
                           <AgentSuggestion key={index} agentName={agent.agentName} justification={agent.justification} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
});

export default DeveloperAgentDisplay;