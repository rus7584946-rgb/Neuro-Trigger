import React from 'react';

type HeadingLevel = 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

interface SectionProps {
  title: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  tooltip?: string;
  as?: HeadingLevel; // Prop to define the heading tag
}

export const Section: React.FC<SectionProps> = ({ title, children, icon, tooltip, as: Component = 'h2' }) => (
    <section>
        <div className="flex items-center space-x-3 mb-6 border-b-2 border-blue-500/30 pb-2">
            {icon}
            <Component className="text-3xl font-bold text-blue-300">{title}</Component>
            {tooltip && (
                 <div className="group relative flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                     <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 p-2 bg-gray-900 text-white text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 border border-gray-600" role="tooltip">
                        {tooltip}
                    </div>
                </div>
            )}
        </div>
        {children}
    </section>
);