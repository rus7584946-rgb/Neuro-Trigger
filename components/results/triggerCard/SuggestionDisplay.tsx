import React, { useState, useCallback } from 'react';
import type { Trigger } from '../../../types.ts';
import { CodeBlock } from '../../common/CodeBlock.tsx';
import { Tag } from '../../common/Tag.tsx';
import { animationDescriptions, colorPsychologyMap, animationNames } from '../../../constants/neuroEffect.ts';
import { AnimationIcon } from './AnimationIcon.tsx';
import { EffectDetail } from './EffectDetail.tsx';
import { InfoLabel } from './InfoLabel.tsx';
//- Fix: Moved VeoGenerationButton to its own file and updated imports.
import { generateVeoPrompt } from '../../../services/veoService.ts';
import { VeoGenerationButton } from './VeoGenerationButton.tsx';

interface SuggestionDisplayProps {
  trigger: Trigger;
  isPrimary: boolean;
  isEditing: boolean;
  onChange: (triggerId: number, updatedTrigger: Trigger) => void;
}

const categoryColors: { [key: string]: string } = {
    'Когнитивные': 'bg-blue-500/20 text-blue-300', 'Эмоциональные': 'bg-red-500/20 text-red-300', 'Социальные': 'bg-green-500/20 text-green-300', 'Мотивационные': 'bg-yellow-500/20 text-yellow-300',
    'Визуальные и сенсорные': 'bg-indigo-500/20 text-indigo-300', 'Контекстуальные': 'bg-pink-500/20 text-pink-300', 'Специфические для YouTube': 'bg-teal-500/20 text-teal-300', 'Специфические для Трейдинга': 'bg-orange-500/20 text-orange-300', 'Digital': 'bg-cyan-500/20 text-cyan-300',
};
const emotionColors: { [key: string]: string } = {
    'Страх': 'bg-red-500/30 text-red-300', 'Тревога': 'bg-red-500/30 text-red-300', 'Срочность': 'bg-orange-500/30 text-orange-300', 'Потеря': 'bg-red-600/30 text-red-200', 'FOMO': 'bg-yellow-500/30 text-yellow-300',
    'Доверие': 'bg-blue-500/30 text-blue-300', 'Уверенность': 'bg-green-500/30 text-green-300', 'Безопасность': 'bg-green-600/30 text-green-200', 'Любопытство': 'bg-purple-500/30 text-purple-300',
    'Интрига': 'bg-indigo-500/30 text-indigo-300', 'Радость': 'bg-yellow-400/30 text-yellow-200', 'Предвкушение': 'bg-teal-500/30 text-teal-300', 'Энтузиазм': 'bg-lime-500/30 text-lime-300', 'Нейтральная': 'bg-gray-500/20 text-gray-300',
};

const getTagColor = (tag: string) => {
    const colors = ['bg-purple-500/20 text-purple-300', 'bg-teal-500/20 text-teal-300', 'bg-cyan-500/20 text-cyan-300', 'bg-orange-500/20 text-orange-300'];
    let hash = 0;
    for (let i = 0; i < tag.length; i++) { hash = tag.charCodeAt(i) + ((hash << 5) - hash); }
    return colors[Math.abs(hash % colors.length)];
};

const EditField: React.FC<{label: string, children: React.ReactNode, className?: string}> = ({ label, children, className }) => (
    <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 ${className}`}>
        <label className="text-sm font-medium text-gray-300 flex-shrink-0">{label}</label>
        <div className="w-full sm:w-2/3">{children}</div>
    </div>
);

const TextInput: React.FC<{value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void}> = ({ value, onChange }) => (
    <input type="text" value={value} onChange={onChange} className="w-full bg-gray-700 border border-gray-600 rounded p-1.5 text-sm text-gray-200 focus:ring-blue-500 focus:border-blue-500" />
);

const TextareaInput: React.FC<{value: string, onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void}> = ({ value, onChange }) => (
    <textarea value={value} onChange={onChange} rows={3} className="w-full bg-gray-700 border border-gray-600 rounded p-1.5 text-sm text-gray-200 focus:ring-blue-500 focus:border-blue-500" />
);

const SelectInput: React.FC<{value: string, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void, children: React.ReactNode}> = ({ value, onChange, children }) => (
    <select value={value} onChange={onChange} className="w-full bg-gray-700 border border-gray-600 rounded p-1.5 text-sm text-gray-200 focus:ring-blue-500 focus:border-blue-500">
        {children}
    </select>
);

export const SuggestionDisplay: React.FC<SuggestionDisplayProps> = ({ trigger, isPrimary, isEditing, onChange }) => {
    const handleFieldChange = useCallback((field: keyof Trigger, value: any) => {
        onChange(trigger.id, { ...trigger, [field]: value });
    }, [trigger, onChange]);

    const handleNeuroEffectChange = useCallback((field: keyof Trigger['neuroEffect'], value: any) => {
        onChange(trigger.id, { ...trigger, neuroEffect: { ...trigger.neuroEffect, [field]: value } });
    }, [trigger, onChange]);

    const { name, categories, tags, emotion, goal, psychologicalJustification, triggerText, contextQuote, neuroEffect, suggestionType } = trigger;
    const { animation, color, accentColor, typography, overlayParts = [], backgroundVisual, placement } = neuroEffect;
    
    const fullTriggerText = overlayParts.map(p => p.text).join('') || triggerText;
    const veoPrompt = generateVeoPrompt(trigger);

    if (isEditing) {
        return (
            <div className={`p-4 rounded-lg bg-gray-900/50 border border-gray-600 space-y-4`}>
                <EditField label="Название триггера"><TextInput value={name} onChange={e => handleFieldChange('name', e.target.value)} /></EditField>
                <EditField label="Основной текст"><TextareaInput value={fullTriggerText} onChange={e => handleFieldChange('triggerText', e.target.value)} /></EditField>
                <EditField label="Эмоция"><TextInput value={emotion} onChange={e => handleFieldChange('emotion', e.target.value)} /></EditField>
                <EditField label="Цель"><TextInput value={goal} onChange={e => handleFieldChange('goal', e.target.value)} /></EditField>
                <EditField label="Обоснование"><TextareaInput value={psychologicalJustification} onChange={e => handleFieldChange('psychologicalJustification', e.target.value)} /></EditField>
                <EditField label="Анимация">
                    <SelectInput value={animation} onChange={e => handleNeuroEffectChange('animation', e.target.value as Trigger['neuroEffect']['animation'])}>
                        {animationNames.map(name => <option key={name} value={name}>{name}</option>)}
                    </SelectInput>
                </EditField>
                <EditField label="Основной цвет"><TextInput value={color} onChange={e => handleNeuroEffectChange('color', e.target.value)} /></EditField>
                <EditField label="Акцентный цвет"><TextInput value={accentColor} onChange={e => handleNeuroEffectChange('accentColor', e.target.value)} /></EditField>
            </div>
        );
    }

    return (
        <div className={`p-4 rounded-lg ${isPrimary ? 'bg-gray-900/50 border border-gray-600' : 'bg-gray-800/40 border border-transparent'}`}>
            <h5 className="font-bold text-base sm:text-lg text-white mb-2">{name}</h5>
            <div className="flex flex-wrap gap-2 mb-4">
                <Tag text={emotion} color={emotionColors[emotion] || 'bg-gray-500/20 text-gray-300'} />
                {categories.map(cat => <Tag key={cat} text={cat} color={categoryColors[cat.split(' ')[0]] || 'bg-gray-600 text-gray-200'} />)}
                {tags.map(tag => <Tag key={tag} text={tag} color={getTagColor(tag)} />)}
            </div>

            <div className="mb-6 bg-black/30 p-4 rounded-lg border border-gray-700/50 text-center shadow-inner">
                <p className="text-lg sm:text-xl font-bold" style={{
                    fontFamily: typeof typography === 'string' ? typography : 'sans-serif',
                }}>
                    {overlayParts.map((part, i) => (
                        <span key={i} style={{ color: part.accent ? accentColor : color }}>{part.text}</span>
                    ))}
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <InfoLabel type="creative" title="Психологическое воздействие">
                    <p className="text-sm text-gray-300">{psychologicalJustification}</p>
                </InfoLabel>
                <InfoLabel type="analysis" title="Контекст из видео">
                    <p className="text-sm text-gray-300 italic">"{contextQuote}"</p>
                </InfoLabel>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <EffectDetail icon={<AnimationIcon animation={animation} />} title={<span>Анимация: <span className="text-orange-300 font-mono">{animation}</span></span>}>
                    {animationDescriptions[animation]}
                </EffectDetail>
                <EffectDetail icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h8a2 2 0 002-2v-4a2 2 0 00-2-2h-8a2 2 0 00-2 2v4a2 2 0 002 2z" /></svg>} title="Типографика">
                   <span className="font-mono">{typeof typography === 'string' ? typography.split(',')[0] : 'Default'}</span>
                </EffectDetail>
                <EffectDetail icon={<div className="w-5 h-5 rounded-full" style={{ background: `linear-gradient(45deg, ${color}, ${accentColor})` }} />} title="Цветовая схема">
                   {colorPsychologyMap[color.toLowerCase()] || 'Основной цвет для привлечения внимания.'}
                </EffectDetail>
                <EffectDetail icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>} title="Визуальный фон">
                    {backgroundVisual}
                </EffectDetail>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="h-48 md:h-auto"><CodeBlock code={trigger.aiStudioPrompt} /></div>
                {suggestionType === 'videoReplacement' ? (
                    <VeoGenerationButton trigger={trigger} />
                ) : (
                    <div className="h-48 md:h-auto"><CodeBlock code={veoPrompt} /></div>
                )}
            </div>
        </div>
    );
};