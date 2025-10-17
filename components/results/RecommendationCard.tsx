import React, { useState } from 'react';
import type { StrategicRecommendation, Trigger, TriggerEffectiveness } from '../../types.ts';
import { formatTime } from '../../utils/formatters.ts';
import { SuggestionDisplay } from './triggerCard/SuggestionDisplay.tsx';

const pointTypeConfig = {
    problem: { icon: '🔴', label: 'Решение Проблемы', color: 'border-red-500/50' },
    strength: { icon: '🟢', label: 'Усиление Момента', color: 'border-green-500/50' },
    rewatch: { icon: '🔁', label: 'Использование Пика Интереса', color: 'border-teal-500/50' },
    creative: { icon: '🔵', label: 'Креативное Усиление', color: 'border-blue-500/50' },
    hook: { icon: '⚓', label: 'Анализ Хука', color: 'border-indigo-500/50' }
};

const effectivenessConfig = {
    positive: { icon: '✅', text: 'Эффективно', color: 'text-green-400' },
    negative: { icon: '❌', text: 'Неэффективно', color: 'text-red-400' },
    neutral: { icon: '➖', text: 'Нейтрально', color: 'text-gray-400' },
    unclear: { icon: '❓', text: 'Неясно', color: 'text-yellow-400' }
};

export const RecommendationCard: React.FC<{
  recommendation: StrategicRecommendation;
  index: number;
  effectiveness?: TriggerEffectiveness | null;
  onUpdate: (updatedRecommendation: StrategicRecommendation) => void;
}> = React.memo(({ recommendation, index, effectiveness, onUpdate }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editableRecommendation, setEditableRecommendation] = useState<StrategicRecommendation>(recommendation);

  const config = pointTypeConfig[recommendation.pointType] || pointTypeConfig.creative;
  const effectivenessInfo = effectiveness ? effectivenessConfig[effectiveness.effectiveness] : null;

  const handleSuggestionChange = (suggestionId: number, updatedTrigger: Trigger) => {
    setEditableRecommendation(prev => {
        const newRec = JSON.parse(JSON.stringify(prev));
        if (newRec.primarySuggestion.id === suggestionId) {
            newRec.primarySuggestion = updatedTrigger;
        } else {
            const altIndex = newRec.alternativeSuggestions.findIndex((s: Trigger) => s.id === suggestionId);
            if (altIndex !== -1) {
                newRec.alternativeSuggestions[altIndex] = updatedTrigger;
            }
        }
        return newRec;
    });
  };

  const handleSave = () => {
    onUpdate(editableRecommendation);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditableRecommendation(recommendation);
    setIsEditing(false);
  };
  
  const handleEdit = () => {
    setEditableRecommendation(JSON.parse(JSON.stringify(recommendation))); // Deep copy for editing
    setIsEditing(true);
    setIsExpanded(true);
  };


  return (
      <div className={`bg-gray-800/60 border ${config.color} rounded-lg overflow-hidden transition-all duration-300 shadow-lg hover:shadow-blue-500/20`}>
        {/* Main Header */}
        <div className="p-4 sm:p-6">
          <div className="flex justify-between items-start space-x-2 sm:space-x-4">
              <div className="flex items-center flex-shrink-0 mr-2 sm:mr-4">
                <span className="flex items-center justify-center w-8 h-8 text-lg font-bold bg-blue-500/20 text-blue-300 rounded-full">{index}</span>
              </div>
            <div className="flex-grow min-w-0" onClick={() => !isEditing && setIsExpanded(!isExpanded)} style={{ cursor: isEditing ? 'default' : 'pointer' }}>
                <div className="flex items-center flex-wrap gap-x-2 gap-y-1 mb-2">
                    <span className="text-lg">{config.icon}</span>
                    <h3 className="text-lg sm:text-xl font-bold text-white">{config.label} в {formatTime(recommendation.pointTimestamp)}</h3>
                    {effectivenessInfo && (
                        <div className={`group relative flex items-center px-2 py-0.5 rounded-md text-sm font-semibold ${effectivenessInfo.color} bg-gray-900/50 border border-gray-600`}>
                            {effectivenessInfo.icon}
                            <span className="ml-1">{effectivenessInfo.text}</span>
                             <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-72 p-2 bg-gray-900 text-white text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 border border-gray-600">
                                <strong className="font-bold">Обоснование AI:</strong> {effectiveness.justification}
                            </div>
                        </div>
                    )}
                </div>
              <p className="text-sm text-gray-400">
                <span className="font-semibold text-gray-300">Анализ AI: </span>
                {recommendation.analysisSummary}
              </p>
            </div>
            <div className="flex-shrink-0 flex flex-col items-end space-y-2">
                {isEditing ? (
                    <div className="flex space-x-2">
                         <button onClick={handleSave} className="px-3 py-1 bg-green-600 text-xs font-semibold rounded-md hover:bg-green-700">Сохранить</button>
                         <button onClick={handleCancel} className="px-3 py-1 bg-gray-600 text-xs font-semibold rounded-md hover:bg-gray-500">Отмена</button>
                    </div>
                ) : (
                    <button onClick={handleEdit} className="px-3 py-1 bg-blue-600 text-xs font-semibold rounded-md hover:bg-blue-700">Редактировать</button>
                )}
               <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 text-gray-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>
        </div>

        {/* Expanded Content */}
        {isExpanded && (
            <div className="animate-fade-in-fast gpu-accelerate">
                {/* Primary Suggestion */}
                <div className="px-4 sm:px-6 pb-6">
                    <h4 className="text-lg font-bold text-blue-300 mb-3 border-t border-gray-700 pt-4">🏆 Основное Предложение</h4>
                    <SuggestionDisplay 
                        trigger={isEditing ? editableRecommendation.primarySuggestion : recommendation.primarySuggestion} 
                        isPrimary={true} 
                        isEditing={isEditing}
                        onChange={handleSuggestionChange}
                    />
                </div>

                {/* Alternative Suggestions */}
                {recommendation.alternativeSuggestions && recommendation.alternativeSuggestions.length > 0 && (
                     <div className="px-4 sm:px-6 pb-6">
                        <h4 className="text-lg font-bold text-yellow-300 mb-3 border-t border-gray-700 pt-4">💡 Альтернативные Идеи</h4>
                        <div className="space-y-4">
                            {(isEditing ? editableRecommendation.alternativeSuggestions : recommendation.alternativeSuggestions).map((alt, i) => (
                                <SuggestionDisplay 
                                    key={alt.id} 
                                    trigger={alt} 
                                    isPrimary={false} 
                                    isEditing={isEditing}
                                    onChange={handleSuggestionChange}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        )}
      </div>
  );
});