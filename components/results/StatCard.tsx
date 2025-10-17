import React from 'react';

export const StatCard: React.FC<{ icon: React.ReactNode; value: string | number; label: string }> = React.memo(({ icon, value, label }) => (
    <article className="flex flex-col sm:flex-row items-center p-4 bg-gray-800/50 border border-gray-700 rounded-lg text-center sm:text-left" aria-label={`${label}: ${value}`}>
        <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-gray-700/50 rounded-lg mb-2 sm:mb-0 sm:mr-4 text-blue-400" aria-hidden="true">
            {icon}
        </div>
        <div>
            <p className="text-2xl font-bold text-white">{value}</p>
            <h3 className="text-sm text-gray-400 uppercase tracking-wider">{label}</h3>
        </div>
    </article>
));