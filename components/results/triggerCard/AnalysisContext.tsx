import React from 'react';
import type { ProblemPoint, StrengthPoint } from '../../../types.ts';
import { formatTime } from '../../../utils/formatters.ts';
import { InfoLabel } from './InfoLabel.tsx';

export const AnalysisContext: React.FC<{
    problem?: ProblemPoint | null;
    strength?: StrengthPoint | null;
}> = ({ problem, strength }) => {
    if (!problem && !strength) {
        return null;
    }

    if (problem) {
        return (
            <div className="mt-6">
                <InfoLabel type="analysis" title="Основа для триггера: Решение проблемы">
                    <div className="bg-red-900/20 border border-red-500/50 p-3 rounded-lg text-sm space-y-2">
                        <p><strong className="text-red-300">Проблема ({formatTime(problem.timestamp)}):</strong> {problem.problemAnalysis}</p>
                    </div>
                </InfoLabel>
            </div>
        );
    }

    if (strength) {
        return (
            <div className="mt-6">
                <InfoLabel type="analysis" title="Основа для триггера: Усиление момента">
                     <div className="bg-green-900/20 border border-green-500/50 p-3 rounded-lg text-sm space-y-2">
                        <p><strong className="text-green-300">Сильный момент ({formatTime(strength.timestamp)}):</strong> {strength.reasonForPeak}</p>
                    </div>
                </InfoLabel>
            </div>
        );
    }
    return null;
};