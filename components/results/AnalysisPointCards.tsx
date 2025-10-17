import React from 'react';
import type { StrengthPoint, ProblemPoint, RepeatedSegment } from '../../types.ts';
import { formatTime } from '../../utils/formatters.ts';

export const StrengthPointCard: React.FC<{ point: StrengthPoint }> = ({ point }) => (
    <div className="bg-gray-800/30 border border-green-500/30 p-4 rounded-lg">
        <div className="flex items-center mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <h4 className="font-bold text-lg text-green-300">Сильный момент в {formatTime(point.timestamp)} ({point.type === 'plateau' ? 'Плато' : `+${(point.retentionPeak || 0).toFixed(1)}%`})</h4>
        </div>
        <p className="text-sm text-gray-300 mb-2"><span className="font-semibold text-gray-400">Причина (по мнению AI):</span> {point.reasonForPeak}</p>
        <p className="text-sm text-green-200 bg-green-500/10 p-2 rounded-md"><span className="font-semibold text-green-300">Стратегия усиления:</span> {point.strategyToAmplify}</p>
    </div>
);

export const ProblemPointCard: React.FC<{ point: ProblemPoint }> = ({ point }) => (
    <div className="bg-gray-800/30 border border-red-500/30 p-4 rounded-lg">
        <div className="flex items-center mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.636-1.22 2.852-1.22 3.488 0l6.066 11.693c.63 1.213-.473 2.708-1.744 2.708H3.935c-1.27 0-2.375-1.495-1.744-2.708l6.066-11.693zM10 14a1 1 0 100-2 1 1 0 000 2zm-1-3a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
            <h4 className="font-bold text-lg text-red-300">Проблема в {formatTime(point.timestamp)} (-{(point.retentionDip || 0).toFixed(1)}%)</h4>
        </div>
        <p className="text-sm text-gray-300 mb-2"><span className="font-semibold text-gray-400">Анализ AI:</span> {point.problemAnalysis}</p>
        <p className="text-sm text-red-200 bg-red-500/10 p-2 rounded-md"><span className="font-semibold text-red-300">Стратегия решения:</span> {point.strategyJustification}</p>
    </div>
);

export const RepeatedSegmentCard: React.FC<{ point: RepeatedSegment }> = ({ point }) => (
    <div className="bg-gray-800/30 border border-teal-500/30 p-4 rounded-lg">
        <div className="flex items-center mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-teal-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                 <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M7 7l8.293-8.293a1 1 0 011.414 0l2.586 2.586a1 1 0 010 1.414L11 17H6v-5l-2-2z" />
                 <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <h4 className="font-bold text-lg text-teal-300">Пик интереса в {formatTime(point.timestamp)}</h4>
        </div>
        <p className="text-sm text-gray-300 mb-2"><span className="font-semibold text-gray-400">Причина пересмотров (AI):</span> {point.reasonForRewatch}</p>
        <p className="text-sm text-teal-200 bg-teal-500/10 p-2 rounded-md"><span className="font-semibold text-teal-300">Стратегия использования:</span> {point.strategyToLeverage}</p>
    </div>
);