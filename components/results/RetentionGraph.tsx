import React from 'react';
import type { ProblemPoint, StrengthPoint, StrategicRecommendation, TrajectoryPoint, RepeatedSegment } from '../../types.ts';
import { formatTime } from '../../utils/formatters.ts';

interface RetentionGraphProps {
  retentionCurve: { time: number; value: number }[];
  predictedRetentionCurve?: { time: number; value: number }[];
  afterCurve?: { time: number; value: number }[];
  emotionalTrajectory?: TrajectoryPoint[];
  cognitiveLoad?: TrajectoryPoint[];
  repeatedSegmentsCurve?: { time: number; value: number }[];
  rawDataPoints?: { time: number; value: number }[];
  strategicRecommendations: StrategicRecommendation[];
  problemPoints: ProblemPoint[];
  strengthPoints: StrengthPoint[];
  repeatedSegments: RepeatedSegment[];
  totalDuration: number;
  averageRetention: number;
}

export const RetentionGraph: React.FC<RetentionGraphProps> = React.memo(({ 
    retentionCurve, 
    predictedRetentionCurve, 
    afterCurve,
    emotionalTrajectory,
    cognitiveLoad,
    repeatedSegmentsCurve,
    rawDataPoints, 
    strategicRecommendations, 
    problemPoints, 
    strengthPoints, 
    repeatedSegments,
    totalDuration, 
    averageRetention 
}) => {
    const width = 800;
    const height = 300;
    const padding = { top: 40, right: 20, bottom: 40, left: 50 };

    const xScale = (time: number) => {
        if (totalDuration <= 0) return padding.left;
        const scaledTime = Math.sqrt(Math.max(0, time));
        const maxScaledTime = Math.sqrt(totalDuration);
        if (maxScaledTime === 0) return padding.left;
        return padding.left + (scaledTime / maxScaledTime) * (width - padding.left - padding.right);
    };
        
    const yScale = (value: number) => height - padding.bottom - (Math.max(0, Math.min(100, value)) / 100) * (height - padding.top - padding.bottom);
    
    const yTrajectoryScale = (value: number, type: 'emotion' | 'load') => {
        const normalizedValue = type === 'emotion' 
            ? (value + 1) / 2
            : value / 10;
        return height - padding.bottom - normalizedValue * (height - padding.top - padding.bottom);
    };

    const dataForLine = (rawDataPoints && rawDataPoints.length > 2) ? rawDataPoints : retentionCurve;
    
    const createPath = (data: {time: number, value: number}[]) => 
        data.length > 0 ? data.map((p, i) => `${i === 0 ? 'M' : 'L'} ${xScale(p.time)} ${yScale(p.value)}`).join(' ') : '';
    
    const createAreaPath = (baseCurve: {time: number, value: number}[], bumpCurve: {time: number, value: number}[]) => {
        if (!bumpCurve || bumpCurve.length === 0) return '';
        const combined = bumpCurve.map(p => ({ time: p.time, value: p.value }));
        const path = combined.map((p, i) => `${i === 0 ? 'M' : 'L'} ${xScale(p.time)} ${yScale(p.value)}`).join(' ');
        const reversedBase = [...baseCurve].reverse();
        const closingPath = reversedBase.map(p => `L ${xScale(p.time)} ${yScale(p.value)}`).join(' ');
        return `${path} ${closingPath} Z`;
    };

    const createTrajectoryPath = (data: TrajectoryPoint[], type: 'emotion' | 'load') =>
        data.length > 0 ? data.map((p, i) => `${i === 0 ? 'M' : 'L'} ${xScale(p.time)} ${yTrajectoryScale(p.value, type)}`).join(' ') : '';

    const linePathData = createPath(dataForLine);
    const predictedLinePathData = createPath(predictedRetentionCurve || []);
    const afterLinePathData = createPath(afterCurve || []);
    const repeatedSegmentsAreaPath = createAreaPath(dataForLine, repeatedSegmentsCurve || []);
    const emotionalPathData = createTrajectoryPath(emotionalTrajectory || [], 'emotion');
    const cognitiveLoadPathData = createTrajectoryPath(cognitiveLoad || [], 'load');
      
    const timeLabels = totalDuration > 0 ? Array.from({ length: 5 }, (_, i) => ({ time: formatTime((totalDuration / 4) * i), x: xScale((totalDuration / 4) * i) })) : [{ time: '00:00', x: xScale(0) }];

    const tooltipWidth = 160;
    const tooltipMargin = 10;
    
    const getTooltipX = (time: number): number => {
        const startX = xScale(time);
        return (startX + tooltipMargin + tooltipWidth > width - padding.right) ? startX - tooltipWidth - tooltipMargin : startX + tooltipMargin;
    };
    
    const getYForTime = (time: number) => {
        const sourceData = (rawDataPoints && rawDataPoints.length > 0) ? rawDataPoints : retentionCurve;
        if (sourceData.length === 0) return yScale(0);
        let closestPoint = sourceData.reduce((prev, curr) => Math.abs(curr.time - time) < Math.abs(prev.time - time) ? curr : prev);
        return yScale(closestPoint.value);
    };
    
    const hasRetentionData = (retentionCurve && retentionCurve.length > 0) || (predictedRetentionCurve && predictedRetentionCurve.length > 0);
    const hasTrajectoryData = emotionalPathData || cognitiveLoadPathData;

    return (
      <div className="w-full bg-gray-900/50 p-6 rounded-2xl border border-gray-700 shadow-2xl shadow-blue-500/10">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" aria-labelledby="graph-title" role="img">
          <title id="graph-title">График удержания аудитории</title>

          {/* Legend */}
           <foreignObject x={padding.left} y="0" width={width - padding.left} height={padding.top}>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-medium">
                  {linePathData && <div className="flex items-center"><rect x="0" y="0" width="12" height="12" fill="#f472b6" rx="2" /><span className="ml-2 text-gray-300">Удержание (данные)</span></div>}
                  {repeatedSegmentsAreaPath && <div className="flex items-center"><rect x="0" y="0" width="12" height="12" fill="#2dd4bf" rx="2" opacity="0.5" /><span className="ml-2 text-gray-300">Пересмотры</span></div>}
                  {predictedLinePathData && <div className="flex items-center"><div className="w-3 h-0 border-t-2 border-dashed border-[#60a5fa]"></div><span className="ml-2 text-gray-300">Прогноз (текст)</span></div>}
                  {afterLinePathData && <div className="flex items-center"><rect x="0" y="0" width="12" height="12" fill="#34d399" rx="2" /><span className="ml-2 text-gray-300">Удержание (после)</span></div>}
                  {emotionalPathData && <div className="flex items-center"><div className="w-3 h-0 border-t-2 border-dotted border-[#facc15]"></div><span className="ml-2 text-gray-300">Эмоции</span></div>}
                  {cognitiveLoadPathData && <div className="flex items-center"><div className="w-3 h-0 border-t-2 border-dotted border-[#c084fc]"></div><span className="ml-2 text-gray-300">Сложность</span></div>}
              </div>
          </foreignObject>

          {/* Grid lines and Axes */}
          <g className="text-gray-500 text-xs font-sans">
            {hasRetentionData && Array.from({ length: 11 }, (_, i) => i * 10).map(val => (
                <g key={`grid-${val}`}>
                    <line x1={padding.left} y1={yScale(val)} x2={width - padding.right} y2={yScale(val)} stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" strokeOpacity="0.5"/>
                    <text x={padding.left - 10} y={yScale(val) + 4} textAnchor="end" fill="currentColor" className="font-medium">{val}%</text>
                </g>
            ))}
            <line x1={padding.left} y1={padding.top} x2={padding.left} y2={height - padding.bottom} stroke="currentColor" strokeWidth="1" strokeOpacity="0.3" />
            {timeLabels.map(label => (<text key={label.time} x={label.x} y={height - padding.bottom + 20} textAnchor="middle" fill="currentColor" className="font-medium">{label.time}</text>))}
            {hasTrajectoryData && <text x={width - padding.right} y={yScale(100) + 10} textAnchor="end" fill="#cbd5e1">Эмоции/Сложность</text>}
            {hasTrajectoryData && <text x={width - padding.right} y={yScale(0) - 5} textAnchor="end" fill="#cbd5e1">(норм. шкала)</text>}
          </g>
          
          {/* Repeated Segments Area */}
          {repeatedSegmentsAreaPath && <path d={repeatedSegmentsAreaPath} fill="#2dd4bf" opacity="0.25" />}
          
          {/* Trajectory Curves */}
          {emotionalPathData && <path d={emotionalPathData} fill="none" stroke="#facc15" strokeWidth="2" strokeDasharray="2 3" opacity="0.8" />}
          {cognitiveLoadPathData && <path d={cognitiveLoadPathData} fill="none" stroke="#c084fc" strokeWidth="2" strokeDasharray="2 3" opacity="0.8" />}

          {/* Retention Curves */}
          {predictedLinePathData && <path d={predictedLinePathData} fill="none" stroke="#60a5fa" strokeWidth="2" strokeDasharray="5 5" />}
          {linePathData && <path d={linePathData} fill="none" stroke="#f472b6" strokeWidth="2.5" />}
          {afterLinePathData && <path d={afterLinePathData} fill="none" stroke="#34d399" strokeWidth="2.5" />}
          
          {hasRetentionData && averageRetention > 0 && (
            <g>
                <line x1={padding.left} y1={yScale(averageRetention)} x2={width - padding.right} y2={yScale(averageRetention)} stroke="#9ca3af" strokeWidth="1.5" strokeDasharray="3 6"/>
                <text x={width - padding.right} y={yScale(averageRetention) - 8} textAnchor="end" fill="#9ca3af" className="text-xs font-semibold uppercase tracking-wider">Среднее удержание</text>
            </g>
          )}

          {/* Markers */}
           {repeatedSegments.map(point => (
            <g key={`rewatch-${point.timestamp}`} className="group cursor-pointer">
               <circle cx={xScale(point.timestamp)} cy={getYForTime(point.timestamp)} r="6" fill="#2dd4bf" stroke="rgba(17, 24, 39, 0.7)" strokeWidth="1.5"/>
               <foreignObject x={getTooltipX(point.timestamp)} y={yScale(90)} width={tooltipWidth} height="100" className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none gpu-accelerate">
                    <div className="bg-gray-900 border border-teal-500 text-white p-2 rounded-md shadow-lg text-xs">
                        <strong className="text-teal-400">Пересматриваемый момент в {formatTime(point.timestamp)}</strong>
                        <p className="mt-1 whitespace-normal">{point.reasonForRewatch}</p>
                    </div>
                </foreignObject>
            </g>
          ))}
          {strengthPoints.map(point => (
            <g key={`strength-${point.timestamp}`} className="group cursor-pointer">
               <circle cx={xScale(point.timestamp)} cy={getYForTime(point.timestamp)} r="6" fill="#4ade80" stroke="rgba(17, 24, 39, 0.7)" strokeWidth="1.5"/>
               <foreignObject x={getTooltipX(point.timestamp)} y={yScale(90)} width={tooltipWidth} height="100" className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none gpu-accelerate">
                    <div className="bg-gray-900 border border-green-500 text-white p-2 rounded-md shadow-lg text-xs">
                        <strong className="text-green-400">Сильный момент в {formatTime(point.timestamp)}</strong>
                        <p className="mt-1 whitespace-normal">{point.reasonForPeak}</p>
                    </div>
                </foreignObject>
            </g>
          ))}
          {problemPoints.map(point => (
            <g key={`problem-${point.timestamp}`} className="group cursor-pointer">
              <circle cx={xScale(point.timestamp)} cy={getYForTime(point.timestamp)} r="6" fill="#f87171" stroke="rgba(17, 24, 39, 0.7)" strokeWidth="1.5"/>
               <foreignObject x={getTooltipX(point.timestamp)} y={yScale(90)} width={tooltipWidth} height="100" className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none gpu-accelerate">
                    <div className="bg-gray-900 border border-red-500 text-white p-2 rounded-md shadow-lg text-xs">
                        <strong className="text-red-400">Проблема в {formatTime(point.timestamp)}</strong>
                        <p className="mt-1 whitespace-normal">{point.problemAnalysis}</p>
                    </div>
                </foreignObject>
            </g>
          ))}
          {strategicRecommendations.map(rec => {
            const trigger = rec.primarySuggestion;
            const fullTriggerText = (trigger.neuroEffect?.overlayParts?.map(p => p.text).join('')) || trigger.triggerText;
            return (
             <g key={`trigger-${trigger.id}`} className="group cursor-pointer">
                <line x1={xScale(trigger.timestamp)} y1={padding.top} x2={xScale(trigger.timestamp)} y2={height - padding.bottom} stroke="#818cf8" strokeWidth="1.5" strokeDasharray="4 4"/>
                <foreignObject x={getTooltipX(trigger.timestamp)} y={padding.top + 5} width={tooltipWidth} height="100" className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none gpu-accelerate">
                     <div className="bg-gray-900 border border-blue-500 text-white p-2 rounded-md shadow-lg text-xs">
                        <strong className="text-blue-400">Рекомендация: {trigger.name}</strong>
                        <p className="mt-1 whitespace-normal">"{fullTriggerText}"</p>
                    </div>
                </foreignObject>
             </g>
          )})}
        </svg>
        <p className="text-xs text-gray-500 text-center mt-2 px-4">
            Горизонтальная ось времени использует нелинейный масштаб (квадратный корень), чтобы детализировать события в начале видео.
        </p>
      </div>
    );
});