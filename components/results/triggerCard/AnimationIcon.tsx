import React from 'react';
import type { Trigger } from '../../../types.ts';

// Helper component to render an icon based on the animation type
export const AnimationIcon: React.FC<{ animation: Trigger['neuroEffect']['animation'], className?: string }> = ({ animation, className }) => {
    const props = {
        className: className || "w-6 h-6",
        fill: "none",
        viewBox: "0 0 24 24",
        stroke: "currentColor",
        strokeWidth: "1.5",
        "aria-hidden": true,
    };

    switch (animation) {
        case 'pulse':
            return <svg {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M15.53 15.53a6 6 0 01-7.06 0M17.65 17.65a9 9 0 01-11.3 0M6.35 6.35a9 9 0 0111.3 0M8.47 8.47a6 6 0 017.06 0" /></svg>;
        case 'glow':
            return <svg {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707" /><circle cx="12" cy="12" r="4" /></svg>;
        case 'shake':
            return <svg {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M4 12h2l2-8 2 16 2-12 2 12 2-8h2" /></svg>;
        case 'flash':
             return <svg {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg>;
        case 'burst':
            return <svg {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M12 2l2.25 6.88L21 12l-6.75 3.12L12 22l-2.25-6.88L3 12l6.75-3.12L12 2z" /></svg>;
        case 'slide-in':
            return <svg {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M7 16l-4-4m0 0l4-4m-4 4h18" /></svg>;
        case 'zoom-in':
            return <svg {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" /></svg>;
        case 'glitch':
            return <svg {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M4 8h16M6 12h14M4 16h16" /></svg>;
        case 'flicker':
            return <svg {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h.01M3 14h.01M7 6h.01M7 18h.01M12 4h.01M12 20h.01M17 6h.01M17 18h.01M21 10h.01M21 14h.01" /></svg>;
        case 'typewriter':
            return <svg {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M8 10h8M8 14h4m-4 4h1.5M4 4h16v16H4V4zm4 4v8" /><path d="M16 12h-1v6h1v-6z" strokeWidth="2.5" /></svg>;
        case 'gradient-shift':
            return <svg {...props}><defs><linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style={{stopColor: 'currentColor', stopOpacity: 1}} /><stop offset="100%" style={{stopColor: 'currentColor', stopOpacity: 0.2}} /></linearGradient></defs><path d="M4 4h16v16H4z" fill="url(#grad1)" /></svg>;
        case 'bounce':
            return <svg {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m0-16c-4 0-6 2-6 6s2 6 6 6 6-2 6-6-2-6-6-6zm0 8a2 2 0 100-4 2 2 0 000 4z" /><path d="M6 14s2-2 6-2 6 2 6 2" /></svg>;
        case 'chart-draw':
            return <svg {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-3.75-.625m3.75.625V3.375" /></svg>;
        case 'scanner':
            return <svg {...props}><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 12h18" strokeWidth="2.5"/></svg>;
        case 'particle-reveal':
            return <svg {...props}><path d="M9.5 6.5a1.5 1.5 0 10-3 0 1.5 1.5 0 003 0zm5 0a1.5 1.5 0 10-3 0 1.5 1.5 0 003 0zm-5 8a1.5 1.5 0 10-3 0 1.5 1.5 0 003 0zm5 0a1.5 1.5 0 10-3 0 1.5 1.5 0 003 0zm-2.5-4a1.5 1.5 0 10-3 0 1.5 1.5 0 003 0z"/></svg>;
        case 'shatter':
            return <svg {...props}><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" strokeDasharray="4 2" /></svg>;
        case 'energy-flow':
            return <svg {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>;
        case 'liquid-morph':
             return <svg {...props}><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10c0-2.072-.628-4.003-1.707-5.657C19.19 4.88 17.5 4 15.5 4c-1.933 0-3.5 1.567-3.5 3.5S13.567 11 15.5 11c1.206 0 2.29-.61 2.93-1.55" /></svg>;
        default:
            return null;
    }
};