import React from 'react';
import type { Persona } from '../../types.ts';

export const PersonaCard: React.FC<{ persona: Persona }> = ({ persona }) => {
    return (
        <div className="bg-gray-800/50 border border-gray-700 p-4 rounded-lg flex flex-col h-full space-y-3">
            <h4 className="text-xl font-bold text-blue-300 text-center">{persona.name}</h4>
            <p className="text-sm text-gray-400 text-center flex-grow">"{persona.description}"</p>
            <div className="border-t border-gray-700 pt-3 space-y-2">
                <div className="flex items-start">
                    <span className="text-red-400 mr-2 mt-0.5">🔥</span>
                    <div>
                        <p className="text-xs text-gray-500 uppercase font-semibold">Страх</p>
                        <p className="text-sm text-red-300/90">{persona.dominantFear}</p>
                    </div>
                </div>
                 <div className="flex items-start">
                    <span className="text-green-400 mr-2 mt-0.5">🚀</span>
                     <div>
                        <p className="text-xs text-gray-500 uppercase font-semibold">Мотивация</p>
                        <p className="text-sm text-green-300/90">{persona.primaryMotivation}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};