import React, { useEffect, useRef } from 'react';
import { SimulationResult, AlgorithmType } from '../types';
import { Check, X, ArrowUp, Clock } from 'lucide-react';

interface VisualizerGridProps {
  result: SimulationResult;
  frameCount: number;
  currentStep: number;
}

export const VisualizerGrid: React.FC<VisualizerGridProps> = ({ result, frameCount, currentStep }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const activeStepRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to current step
  useEffect(() => {
    if (activeStepRef.current && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const element = activeStepRef.current;

      const containerRect = container.getBoundingClientRect();
      const elementRect = element.getBoundingClientRect();

      // Check if element is out of view
      if (elementRect.left < containerRect.left || elementRect.right > containerRect.right) {
        const scrollLeft = element.offsetLeft - (container.clientWidth / 2) + (element.clientWidth / 2);
        container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
      }
    }
  }, [currentStep, result.algorithm]);

  const activeStepData = result.steps[currentStep];

  return (
    <div className="w-full glass-strong rounded-2xl shadow-2xl border border-slate-600/50 flex flex-col overflow-hidden scale-in">
      {/* Header */}
      <div className="p-5 border-b border-slate-700/50 flex justify-between items-center bg-gradient-to-r from-slate-900/80 to-slate-800/80 rounded-t-2xl">
        <h3 className="text-xl font-bold text-white flex items-center gap-3">
          <span className="gradient-text text-2xl">{result.algorithm}</span> Simulation
        </h3>
        <div className="flex gap-4 text-xs md:text-sm">
          <div className="flex items-center gap-2 glass px-3 py-1.5 rounded-lg border border-slate-600/50">
            <span className="w-3 h-3 rounded-full bg-green-500 shadow-lg shadow-green-500/50 pulse"></span>
            <span className="font-semibold">Hit</span>
          </div>
          <div className="flex items-center gap-2 glass px-3 py-1.5 rounded-lg border border-slate-600/50">
            <span className="w-3 h-3 rounded-full bg-rose-500 shadow-lg shadow-rose-500/50 pulse"></span>
            <span className="font-semibold">Fault</span>
          </div>
          {result.algorithm === AlgorithmType.CLOCK && (
            <div className="flex items-center gap-2 glass px-3 py-1.5 rounded-lg border border-slate-600/50">
              <Clock size={16} className="text-amber-400 animate-pulse" />
              <span className="font-semibold">Ref Bit</span>
            </div>
          )}
        </div>
      </div>

      {/* Explanation Box */}
      <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 border-b border-blue-900/50 p-5 min-h-[90px] flex items-center justify-center text-center transition-all slide-in">
        {activeStepData ? (
          <div className="space-y-1">
            <span className="font-bold text-blue-300 text-lg mr-2">Step {currentStep + 1}:</span>
            <span className="text-blue-100 text-base">{activeStepData.explanation}</span>
          </div>
        ) : (
          <span className="text-slate-500 text-lg">Simulation Start</span>
        )}
      </div>

      {/* Grid Container */}
      <div className="relative">
        <div
          ref={scrollContainerRef}
          className="overflow-x-auto custom-scrollbar p-6"
        >
          <div className="inline-block min-w-full">
            {/* Header Row: Requested Pages */}
            <div className="flex mb-4">
              <div className="w-24 shrink-0 flex items-center justify-end pr-4 text-slate-400 text-sm font-medium">
                Request
              </div>
              {result.steps.map((step, idx) => {
                const isActive = idx === currentStep;
                return (
                  <div
                    key={idx}
                    ref={isActive ? activeStepRef : null}
                    className={`w-14 shrink-0 flex flex-col items-center gap-1 transition-all duration-500 ${isActive ? 'scale-125 z-10' : 'opacity-60 scale-90'}`}
                  >
                    <span className={`font-bold text-xl transition-all ${isActive ? 'text-white glow-text' : 'text-slate-500'}`}>
                      {step.requestedPage}
                    </span>
                    {isActive && <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 mb-1 pulse shadow-lg shadow-blue-500/50"></div>}
                  </div>
                );
              })}
            </div>

            {/* Frames Rows */}
            {Array.from({ length: frameCount }).map((_, frameIdx) => (
              <div key={frameIdx} className="flex mb-3 relative">
                <div className="w-24 shrink-0 flex items-center justify-end pr-4 text-slate-400 text-sm font-medium">
                  Frame {frameIdx + 1}
                </div>
                {result.steps.map((step, stepIdx) => {
                  const val = step.frames[frameIdx];
                  const isActive = stepIdx === currentStep;
                  const isHit = step.status === 'HIT';
                  const isFault = step.status === 'FAULT';

                  // Highlight logic
                  const isChanged = isFault && step.frames[frameIdx] === step.requestedPage &&
                    (stepIdx === 0 || result.steps[stepIdx - 1].frames[frameIdx] !== step.requestedPage);
                  const isHitFrame = isHit && step.frames[frameIdx] === step.requestedPage;

                  // Clock specifics
                  const refBit = step.metadata?.referenceBits?.[frameIdx];
                  const isPointer = step.metadata?.clockPointer === frameIdx;

                  return (
                    <div key={stepIdx} className={`w-14 shrink-0 flex flex-col items-center justify-center relative ${isActive ? 'z-10' : ''}`}>
                      {/* Clock Pointer Indicator */}
                      {isActive && isPointer && result.algorithm === AlgorithmType.CLOCK && (
                        <div className="absolute -left-1 text-amber-500 animate-pulse">
                          <span className="text-[10px]">➤</span>
                        </div>
                      )}

                      <div className={`
                         w-12 h-12 flex items-center justify-center rounded-lg border-2 relative
                         ${val === null ? 'border-slate-800 bg-slate-800/50' :
                          isActive && isChanged ? 'border-rose-500 bg-rose-500/20 text-rose-100 shadow-[0_0_15px_rgba(244,63,94,0.3)]' :
                            isActive && isHitFrame ? 'border-green-500 bg-green-500/20 text-green-100 shadow-[0_0_15px_rgba(34,197,94,0.3)]' :
                              isActive ? 'border-slate-500 bg-slate-700 text-white' :
                                'border-slate-700 bg-slate-800 text-slate-400'}
                         transition-all duration-300
                       `}>
                        <span className="font-mono font-semibold text-lg">{val !== null ? val : ''}</span>

                        {/* Reference Bit Badge */}
                        {val !== null && result.algorithm === AlgorithmType.CLOCK && refBit !== undefined && (
                          <div className={`absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border ${refBit === 1 ? 'bg-amber-500 border-amber-400 text-black' : 'bg-slate-700 border-slate-600 text-slate-400'
                            }`}>
                            {refBit}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}

            {/* Status Row */}
            <div className="flex mt-6 pt-2 border-t border-slate-700/50">
              <div className="w-24 shrink-0 flex items-center justify-end pr-4 text-slate-400 text-sm font-medium">
                Result
              </div>
              {result.steps.map((step, idx) => {
                const isActive = idx === currentStep;
                return (
                  <div key={idx} className={`w-14 shrink-0 flex justify-center transition-opacity ${isActive ? 'opacity-100' : 'opacity-40'}`}>
                    {step.status === 'HIT' ? (
                      <div className="flex flex-col items-center">
                        <Check size={20} className="text-green-500" />
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <X size={20} className="text-rose-500" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Overlay Gradients for scroll indication */}
        <div className="absolute top-0 bottom-0 left-24 w-8 bg-gradient-to-r from-slate-900/10 to-transparent pointer-events-none"></div>
        <div className="absolute top-0 bottom-0 right-0 w-8 bg-gradient-to-l from-slate-900/10 to-transparent pointer-events-none"></div>
      </div>
    </div>
  );
};