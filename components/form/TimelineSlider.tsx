import React, { useCallback, useMemo } from 'react';
import { formatTime } from '../../utils/formatters.ts';

interface TimelineSliderProps {
  duration: number;
  value: [number, number];
  onChange: (newValue: [number, number]) => void;
}

export const TimelineSlider: React.FC<TimelineSliderProps> = ({ duration, value, onChange }) => {
  const [min, max] = value;
  const minPos = (min / duration) * 100;
  const maxPos = (max / duration) * 100;

  const handleMinChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newMin = Math.min(Number(e.target.value), max - 1);
    onChange([newMin, max]);
  }, [max, onChange]);
  
  const handleMaxChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newMax = Math.max(Number(e.target.value), min + 1);
    onChange([min, newMax]);
  }, [min, onChange]);

  const sliderBackground = useMemo(() => {
    return `linear-gradient(to right, #374151 ${minPos}%, #3b82f6 ${minPos}%, #3b82f6 ${maxPos}%, #374151 ${maxPos}%)`;
  }, [minPos, maxPos]);

  return (
    <div className="mt-6 pt-6 border-t border-gray-700">
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-sm font-medium text-gray-300">Временной диапазон анализа</h4>
        <div className="text-sm font-mono px-3 py-1 bg-gray-900 rounded-md text-blue-300">
          {formatTime(min)} - {formatTime(max)}
        </div>
      </div>
      <div className="relative h-8 flex items-center">
        {/* Track and range highlight */}
        <div
          className="absolute h-2 w-full rounded-full"
          style={{ background: sliderBackground }}
        />
        {/* Min slider */}
        <input
          type="range"
          min="0"
          max={duration}
          value={min}
          onChange={handleMinChange}
          className="timeline-slider"
          style={{ zIndex: 3 }}
        />
        {/* Max slider */}
        <input
          type="range"
          min="0"
          max={duration}
          value={max}
          onChange={handleMaxChange}
          className="timeline-slider"
          style={{ zIndex: 4 }}
        />
      </div>
      <div className="flex justify-between text-xs text-gray-400 mt-1">
        <span>{formatTime(0)}</span>
        <span>{formatTime(duration)}</span>
      </div>
    </div>
  );
};