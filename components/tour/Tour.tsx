// components/tour/Tour.tsx
import React, { useState, useEffect, useLayoutEffect } from 'react';
import { tourSteps, TourStep } from './tourSteps.ts';

interface TourProps {
  onFinish: () => void;
}

export const Tour: React.FC<TourProps> = ({ onFinish }) => {
  const [stepIndex, setStepIndex] = useState(0);
  const [tooltipStyle, setTooltipStyle] = useState({});
  const [currentElement, setCurrentElement] = useState<HTMLElement | null>(null);

  const currentStep = tourSteps[stepIndex];

  useLayoutEffect(() => {
    if (!currentStep) return;

    const element = document.getElementById(currentStep.elementId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      // Add highlight class after a short delay to allow scrolling
      const timeoutId = setTimeout(() => {
        element.classList.add('tour-highlight');
        const rect = element.getBoundingClientRect();
        
        const position = currentStep.position || 'bottom';
        let top, left;
        const tooltipHeight = 150; // Approximate height
        const tooltipMargin = 16;
        
        if (position === 'bottom') {
          top = rect.bottom + tooltipMargin;
        } else {
          top = rect.top - tooltipHeight - tooltipMargin;
        }

        left = rect.left + rect.width / 2;
        
        setTooltipStyle({
          position: 'fixed',
          top: `${top}px`,
          left: `${left}px`,
          transform: 'translateX(-50%)',
        });
        setCurrentElement(element);
      }, 300);

      return () => {
        clearTimeout(timeoutId);
        element.classList.remove('tour-highlight');
      };
    }
  }, [stepIndex, currentStep]);

  const handleNext = () => {
    if (stepIndex < tourSteps.length - 1) {
      setStepIndex(stepIndex + 1);
    } else {
      onFinish();
    }
  };
  
  const handlePrev = () => {
    if (stepIndex > 0) {
      setStepIndex(stepIndex - 1);
    }
  };

  if (!currentStep || !currentElement) {
    return null;
  }

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/70 z-[10000]" onClick={onFinish} />

      {/* Tooltip */}
      <div
        className={`tour-tooltip ${currentStep.position || 'bottom'} fixed w-80 max-w-[90vw] bg-gray-800 p-4 rounded-lg border-2 border-blue-500 shadow-2xl z-[10002] transition-all duration-300 animate-fade-in`}
        style={tooltipStyle}
        role="dialog"
        aria-labelledby="tour-title"
      >
        <h3 id="tour-title" className="text-lg font-bold text-blue-300 mb-2">{currentStep.title}</h3>
        <p className="text-sm text-gray-300 mb-4">{currentStep.content}</p>
        
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-400">Шаг {stepIndex + 1} из {tourSteps.length}</span>
          <div className="flex space-x-2">
            {stepIndex > 0 && (
              <button onClick={handlePrev} className="px-3 py-1 bg-gray-600 text-xs font-semibold rounded-md hover:bg-gray-500">
                Назад
              </button>
            )}
            <button onClick={handleNext} className="px-3 py-1 bg-blue-600 text-xs font-semibold rounded-md hover:bg-blue-700">
              {stepIndex === tourSteps.length - 1 ? 'Завершить' : 'Далее'}
            </button>
          </div>
        </div>
        <button onClick={onFinish} className="absolute top-2 right-2 text-gray-500 hover:text-white">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>
    </>
  );
};