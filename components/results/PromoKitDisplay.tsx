import React, { useState } from 'react';
import type { PromoKitResult } from '../../types.ts';
import { CopyButton } from '../common/CopyButton.tsx';

type Tab = 'social' | 'email' | 'hooks';

const PlatformIcon: React.FC<{ platform: string }> = ({ platform }) => {
    switch (platform) {
        case 'Telegram':
            return <svg className="w-6 h-6 text-cyan-400" viewBox="0 0 24 24" fill="currentColor"><path d="M9.78 18.65l.28-4.23l7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3L3.64 11.9c-.88-.25-.89-1.02.2-1.3l15.97-6.16c.73-.28 1.45.17 1.2.98L18.06 19.3c-.26.91-1.01 1.14-1.68.7L9.78 18.65z" /></svg>;
        case 'Instagram':
            return <svg className="w-6 h-6 text-pink-400" viewBox="0 0 24 24" fill="currentColor"><path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8 1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5 5 5 0 0 1-5 5 5 5 0 0 1-5-5 5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3z"/></svg>;
        case 'Shorts/Reels':
            return <svg className="w-6 h-6 text-red-400" viewBox="0 0 24 24" fill="currentColor"><path d="M10 15l5.19-3L10 9v6m11.56-7.83c.13.47.22 1.1.28 1.9.07.8.1 1.49.1 2.09L22 12c0 2.19-.16 3.8-.44 5.83c-.25 1.83-.9 3.29-2.28 4.08c-1.37.8-3.24.9-5.94.9c-2.7 0-4.57-.1-5.94-.9c-1.38-.79-2.03-2.25-2.28-4.08C2.16 15.8 2 14.19 2 12c0-2.19.16-3.8.44-5.83c.25-1.83.9-3.29 2.28-4.08C6.09 1.3 7.96 1.2 10.66 1.2c2.7 0 4.57.1 5.94.9c1.38.79 2.03 2.25 2.28 4.08z" /></svg>;
        default:
            return null;
    }
};

const PromoKitDisplay: React.FC<{ results: PromoKitResult }> = React.memo(({ results }) => {
    const [activeTab, setActiveTab] = useState<Tab>('social');
    const { socialPosts = [], emailNewsletter, keyHooks = [] } = results;

    const renderContent = () => {
        switch (activeTab) {
            case 'social':
                return (
                    <div className="space-y-4">
                        {socialPosts.map((post, index) => (
                            <div key={index} className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                                <div className="flex justify-between items-center mb-3">
                                    <div className="flex items-center gap-2">
                                        <PlatformIcon platform={post.platform} />
                                        <h4 className="font-bold text-lg text-white">{post.platform}</h4>
                                    </div>
                                    <CopyButton textToCopy={post.content} />
                                </div>
                                <p className="text-sm text-gray-300 whitespace-pre-wrap">{post.content}</p>
                            </div>
                        ))}
                    </div>
                );
            case 'email':
                return (
                    <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700 space-y-4">
                        <div>
                           <div className="flex justify-between items-center mb-1">
                             <h4 className="font-semibold text-gray-400 uppercase text-xs tracking-wider">Тема письма</h4>
                             <CopyButton textToCopy={emailNewsletter.subject} />
                           </div>
                            <p className="text-base text-gray-200">{emailNewsletter.subject}</p>
                        </div>
                        <div className="border-t border-gray-700 pt-4">
                           <div className="flex justify-between items-center mb-1">
                             <h4 className="font-semibold text-gray-400 uppercase text-xs tracking-wider">Тело письма</h4>
                              <CopyButton textToCopy={emailNewsletter.body} />
                           </div>
                            <p className="text-sm text-gray-300 whitespace-pre-wrap">{emailNewsletter.body}</p>
                        </div>
                    </div>
                );
            case 'hooks':
                return (
                     <div className="space-y-3">
                        {keyHooks.map((hook, index) => (
                           <div key={index} className="bg-gray-900/50 p-3 rounded-lg border border-gray-700 flex justify-between items-center gap-4">
                               <p className="text-base text-gray-200 italic">"{hook}"</p>
                               <CopyButton textToCopy={hook} />
                           </div>
                        ))}
                    </div>
                );
        }
    };
    
    const TabButton: React.FC<{ tab: Tab; label: string }> = ({ tab, label }) => (
         <button
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors duration-200 ${activeTab === tab ? 'bg-blue-600 text-white' : 'bg-transparent text-gray-300 hover:bg-gray-700'}`}
        >
            {label}
        </button>
    );

    return (
        <div className="animate-fade-in-fast">
            <div className="p-1 mb-4 bg-gray-900 rounded-lg flex space-x-1">
                <TabButton tab="social" label="Посты для соцсетей" />
                <TabButton tab="email" label="Email-рассылка" />
                <TabButton tab="hooks" label="Хуки для тизеров" />
            </div>
            <div>
                {renderContent()}
            </div>
        </div>
    );
});

export default PromoKitDisplay;