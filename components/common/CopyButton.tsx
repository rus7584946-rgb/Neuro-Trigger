import React, { useState, useCallback } from 'react';

interface CopyButtonProps {
  textToCopy: string;
  className?: string;
  children?: React.ReactNode;
}

export const CopyButton: React.FC<CopyButtonProps> = ({ textToCopy, className, children }) => {
    const [copyText, setCopyText] = useState(children || 'Копировать');

    const handleCopy = useCallback((e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent triggering parent onClick events
        navigator.clipboard.writeText(textToCopy).then(() => {
            setCopyText('Скопировано!');
            setTimeout(() => setCopyText(children || 'Копировать'), 2000);
        }, () => {
            setCopyText('Ошибка!');
            setTimeout(() => setCopyText(children || 'Копировать'), 2000);
        });
    }, [textToCopy, children]);

    const defaultClassName = "px-3 py-1 bg-gray-700 text-xs font-semibold text-gray-300 rounded-md transition-colors hover:bg-gray-600 flex-shrink-0";

    return (
        <button
            onClick={handleCopy}
            className={className || defaultClassName}
        >
            {copyText}
        </button>
    );
};