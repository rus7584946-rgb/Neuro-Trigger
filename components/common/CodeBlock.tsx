import React, { useState, useCallback } from 'react';

interface CodeBlockProps {
  code: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ code }) => {
  const [copyText, setCopyText] = useState('Копировать');

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code).then(() => {
      setCopyText('Скопировано!');
      setTimeout(() => setCopyText('Копировать'), 2000);
    });
  }, [code]);

  return (
    <div className="bg-gray-900 rounded-lg border border-gray-700 relative h-full flex flex-col">
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 px-3 py-1 bg-gray-700 text-xs font-semibold text-gray-300 rounded transition-colors hover:bg-gray-600 z-10"
      >
        {copyText}
      </button>
      <pre className="p-4 text-sm text-gray-300 overflow-auto flex-grow">
        <code>{(code || '').trim()}</code>
      </pre>
    </div>
  );
};