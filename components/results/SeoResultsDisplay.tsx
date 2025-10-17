import React from 'react';
import type { SeoResult } from '../../types.ts';
import { Tag } from '../common/Tag.tsx';
import { CopyButton } from '../common/CopyButton.tsx';

const SeoResultsDisplay: React.FC<{ results: SeoResult }> = React.memo(({ results }) => {
    const { titles = [], descriptions = [], tags = '' } = results;

    return (
        <div className="space-y-8 animate-fade-in-fast">
            <div>
                <h4 className="text-lg font-bold text-blue-300 mb-3">Варианты названий</h4>
                <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                    {titles.map((title) => (
                        <div key={title.title} className="bg-gray-900/50 p-3 rounded-lg border border-gray-700">
                            <div className="flex justify-between items-start gap-3">
                                <p className="text-base text-white font-semibold">{title.title}</p>
                                <CopyButton textToCopy={title.title} />
                            </div>
                            <p className="text-xs text-gray-400 mt-2 italic">
                                <span className="font-semibold text-blue-400">Обоснование AI:</span> {title.justification}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            <div>
                <h4 className="text-lg font-bold text-blue-300 mb-3">Варианты описаний</h4>
                <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                     {descriptions.map((desc, index) => (
                        <div key={index} className="bg-gray-900/50 p-3 rounded-lg border border-gray-700">
                             <div className="flex justify-between items-start gap-3 mb-2">
                                <h5 className="font-semibold text-gray-300">Вариант {index + 1}</h5>
                                <CopyButton textToCopy={desc} />
                            </div>
                            <p className="text-sm text-gray-300 whitespace-pre-wrap">{desc}</p>
                        </div>
                    ))}
                </div>
            </div>
            
            <div>
                 <div className="flex justify-between items-center mb-3">
                    <h4 className="text-lg font-bold text-blue-300">Рекомендованные теги</h4>
                     <CopyButton textToCopy={tags}>Копировать все</CopyButton>
                </div>
                <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-700 mb-4">
                    <p className="text-xs text-gray-400">
                        <span className="font-semibold text-blue-400">💡 Рекомендация по SEO:</span> YouTube позволяет использовать до 500 символов в тегах. Наибольший вес имеют первые теги. Поэтому AI расположил их от самых конкретных (длинный хвост) до самых общих.
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    {tags.split(',').map((tag) => {
                        const trimmedTag = tag.trim();
                        if (trimmedTag) {
                            return <Tag key={trimmedTag} text={trimmedTag} color="bg-gray-700 text-gray-300" />;
                        }
                        return null;
                    })}
                </div>
            </div>
        </div>
    );
});

export default SeoResultsDisplay;