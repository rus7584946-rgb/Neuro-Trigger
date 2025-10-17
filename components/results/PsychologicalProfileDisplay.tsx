import React from 'react';
import type { PsychologicalProfile } from '../../types.ts';
import { Section } from '../common/Section.tsx';
import { PersonaCard } from './PersonaCard.tsx';

export const PsychologicalProfileDisplay: React.FC<{ psychologicalProfile: PsychologicalProfile | null }> = React.memo(({ psychologicalProfile }) => {
    const sectionIcon = <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
    const sectionTooltip = "Профиль создан методом 'обратной инженерии' на основе анализа транскрипции для определения ключевых психологических рычагов воздействия.";

    if (!psychologicalProfile) {
        return (
            <Section 
                title="Психологический профиль аудитории"
                icon={sectionIcon}
                tooltip={sectionTooltip}
            >
                <div className="text-center text-gray-400 p-8 bg-gray-800/50 border border-gray-700 rounded-lg">
                    Не удалось сгенерировать психологический профиль.
                </div>
            </Section>
        );
    }
    
    const { psychotype, personas = [], cognitiveBiases = [] } = psychologicalProfile;
    
    return (
        <Section 
            title="Психологический профиль аудитории"
            icon={sectionIcon}
            tooltip={sectionTooltip}
        >
            <div className="mb-6 bg-gray-800/50 border border-gray-700 p-4 rounded-lg text-center">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-1">Общий Архетип Зрителя</h3>
                <p className="text-2xl font-bold text-blue-300">{psychotype || 'Не определен'}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                 {personas.map(persona => (
                    <PersonaCard key={persona.name} persona={persona} />
                ))}
            </div>

            <div className="bg-gray-800/50 border border-gray-700 p-4 rounded-lg">
                <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Общие когнитивные искажения для воздействия</h4>
                <div className="flex flex-wrap gap-2">
                    {cognitiveBiases.length > 0 ? cognitiveBiases.map(bias => (
                        <span key={bias} className="px-3 py-1 text-sm font-medium rounded-full bg-indigo-500/20 text-indigo-300">
                            {bias}
                        </span>
                    )) : (
                        <p className="text-gray-400">Значимых искажений не выявлено.</p>
                    )}
                </div>
            </div>
        </Section>
    );
});