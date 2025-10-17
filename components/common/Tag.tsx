import React from 'react';

export const Tag: React.FC<{ text: string, color: string }> = ({ text, color }) => (
    <span className={`px-3 py-1 text-xs font-medium rounded-full ${color} whitespace-nowrap`}>
        {text}
    </span>
);