import React from 'react';

export const EffectDetail: React.FC<{ icon: React.ReactNode; title: React.ReactNode; children: React.ReactNode }> = ({ icon, title, children }) => (
    <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-gray-700/50 rounded-lg text-orange-300">{icon}</div>
        <div>
            <h5 className="font-semibold text-white flex items-center">{title}</h5>
            <div className="text-sm text-gray-400">{children}</div>
        </div>
    </div>
);
