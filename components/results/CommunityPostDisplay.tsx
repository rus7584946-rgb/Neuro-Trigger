import React from 'react';
import type { CommunityPost, CommunityPostResult } from '../../types.ts';
import { CopyButton } from '../common/CopyButton.tsx';

const PostTypeIcon: React.FC<{ type: CommunityPost['type'] }> = ({ type }) => {
    const commonClasses = "w-6 h-6";
    switch (type) {
        case 'image':
            return <svg xmlns="http://www.w3.org/2000/svg" className={`${commonClasses} text-green-400`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
        case 'textPoll':
            return <svg xmlns="http://www.w3.org/2000/svg" className={`${commonClasses} text-blue-400`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" /></svg>;
        case 'imagePoll':
            return <svg xmlns="http://www.w3.org/2000/svg" className={`${commonClasses} text-indigo-400`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>;
        case 'quiz':
            return <svg xmlns="http://www.w3.org/2000/svg" className={`${commonClasses} text-yellow-400`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
        case 'video':
             return <svg xmlns="http://www.w3.org/2000/svg" className={`${commonClasses} text-red-400`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
        default: return null;
    }
};

const PostCard: React.FC<{ post: CommunityPost }> = ({ post }) => {
    const typeNameMap = {
        image: 'Пост с изображением',
        textPoll: 'Текстовый опрос',
        imagePoll: 'Опрос с картинками',
        quiz: 'Викторина',
        video: 'Пост с видео'
    };

    return (
        <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700 space-y-4">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <PostTypeIcon type={post.type} />
                    <h4 className="font-bold text-lg text-white">{typeNameMap[post.type]}</h4>
                </div>
                <CopyButton textToCopy={post.postText} />
            </div>
            <p className="text-sm text-gray-300 whitespace-pre-wrap">{post.postText}</p>

            {post.type === 'image' && (
                <div className="border-t border-gray-700 pt-3">
                    <label className="text-xs text-gray-400 font-semibold uppercase">Промпт для изображения:</label>
                    <p className="mt-1 text-sm text-green-300 bg-gray-800 p-2 rounded-md font-mono">{post.imagePrompt}</p>
                </div>
            )}
            {post.type === 'textPoll' && (
                <div className="border-t border-gray-700 pt-3 space-y-2">
                    {post.pollOptions.map((option, i) => (
                        <div key={i} className="bg-gray-800 p-2 rounded-md text-sm text-gray-200">{option.text}</div>
                    ))}
                </div>
            )}
            {post.type === 'imagePoll' && (
                 <div className="border-t border-gray-700 pt-3 space-y-3">
                    {post.imagePollOptions.map((option, i) => (
                        <div key={i} className="bg-gray-800 p-3 rounded-md">
                            <p className="text-sm text-gray-200 mb-2">{option.text}</p>
                            <p className="text-xs text-green-300 font-mono bg-gray-900 p-1 rounded">{option.imagePrompt}</p>
                        </div>
                    ))}
                </div>
            )}
            {post.type === 'quiz' && (
                 <div className="border-t border-gray-700 pt-3 space-y-2">
                    {post.quizOptions.map((option, i) => (
                         <div key={i} className={`flex items-center p-2 rounded-md text-sm ${option.isCorrect ? 'bg-green-800/50 text-green-200' : 'bg-gray-800 text-gray-200'}`}>
                            {option.text}
                            {option.isCorrect && <span className="ml-auto text-lg">✅</span>}
                        </div>
                    ))}
                    <div className="pt-2">
                        <label className="text-xs text-gray-400 font-semibold uppercase">Объяснение:</label>
                        <p className="mt-1 text-sm text-yellow-200">{post.explanation}</p>
                    </div>
                </div>
            )}
            {post.type === 'video' && (
                <div className="border-t border-gray-700 pt-3 bg-gray-800 p-3 rounded-md">
                    <p className="text-sm text-gray-400">Видео: <span className="font-semibold text-gray-200">{post.videoTitle}</span></p>
                    <p className="mt-2 text-sm text-gray-300 whitespace-pre-wrap">{post.commentary}</p>
                </div>
            )}
        </div>
    );
};

const CommunityPostDisplay: React.FC<{ results: CommunityPostResult }> = React.memo(({ results }) => {
    if (!results || !results.communityPosts || results.communityPosts.length === 0) {
        return <p className="text-gray-400 text-center p-4">Не удалось сгенерировать посты для сообщества.</p>;
    }
    return (
        <div className="space-y-6 animate-fade-in-fast max-h-[500px] overflow-y-auto pr-2">
            {results.communityPosts.map((post, index) => (
                <PostCard key={index} post={post} />
            ))}
        </div>
    );
});

export default CommunityPostDisplay;