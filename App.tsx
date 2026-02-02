import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Activity, Pause, SkipBack, SkipForward, Rewind, Shuffle } from 'lucide-react';
import { AlgorithmType, SimulationResult } from './types';
import { runSimulation } from './utils/algorithms';
import { VisualizerGrid } from './components/VisualizerGrid';
import { StatsSummary } from './components/StatsSummary';
import { SimulationReport } from './components/SimulationReport';

const App: React.FC = () => {
  // Input State - updated default to have more unique pages (0-9) to show variance up to 10 frames
  const [refString, setRefString] = useState<string>("7, 0, 1, 2, 0, 3, 0, 4, 2, 3, 0, 3, 1, 5, 2, 6, 7, 1, 8, 9, 4, 1, 5, 3, 2");
  const [frameCount, setFrameCount] = useState<number>(3);

  // Simulation State
  const [results, setResults] = useState<SimulationResult[]>([]);
  const [activeTab, setActiveTab] = useState<AlgorithmType>(AlgorithmType.FIFO);

  // Playback State
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const timerRef = useRef<number | null>(null);



  const handleSimulate = useCallback(() => {
    if (!refString.trim()) return;

    const parsedFrames = Math.max(1, Math.min(10, Math.floor(frameCount)));

    const fifoRes = runSimulation(refString, parsedFrames, AlgorithmType.FIFO);
    const lruRes = runSimulation(refString, parsedFrames, AlgorithmType.LRU);
    const optRes = runSimulation(refString, parsedFrames, AlgorithmType.OPTIMAL);
    const clockRes = runSimulation(refString, parsedFrames, AlgorithmType.CLOCK);

    setResults([fifoRes, lruRes, optRes, clockRes]);

    // Reset playback only if string changed length significantly or frame count changed? 
    // Safest to just pause.
    setIsPlaying(false);
  }, [refString, frameCount]);

  // Reactive Simulation: Run when inputs change (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      handleSimulate();
    }, 400);
    return () => clearTimeout(timer);
  }, [handleSimulate]);

  // Handle step clamping when results change
  useEffect(() => {
    if (results.length > 0) {
      const max = results[0].steps.length - 1;
      if (currentStep > max) setCurrentStep(max);
    }
  }, [results, currentStep]);

  // Playback Logic
  useEffect(() => {
    if (isPlaying && results.length > 0) {
      const maxSteps = results[0].steps.length - 1;
      timerRef.current = window.setInterval(() => {
        setCurrentStep((prev) => {
          if (prev >= maxSteps) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1200);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, results]);



  const generateRandomString = () => {
    const length = 20 + Math.floor(Math.random() * 10);
    const arr = Array.from({ length }, () => Math.floor(Math.random() * 10)); // 0-9
    setRefString(arr.join(', '));
  };

  const getActiveResult = () => results.find(r => r.algorithm === activeTab);
  const maxSteps = results.length > 0 ? results[0].steps.length - 1 : 0;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 md:p-8 font-sans relative page-transition">
      {/* Animated Background - OS Themed */}
      <div className="animated-bg">
        {/* Memory Blocks */}
        <div className="os-element memory-block memory-block-1">
          <div className="memory-label">Frame 0</div>
        </div>
        <div className="os-element memory-block memory-block-2">
          <div className="memory-label">Frame 1</div>
        </div>
        <div className="os-element memory-block memory-block-3">
          <div className="memory-label">Frame 2</div>
        </div>

        {/* Page Numbers */}
        <div className="os-element page-number page-1">P7</div>
        <div className="os-element page-number page-2">P3</div>
        <div className="os-element page-number page-3">P1</div>
        <div className="os-element page-number page-4">P5</div>

        {/* Process Indicators */}
        <div className="os-element process-indicator process-1">
          <div className="process-bar"></div>
        </div>
        <div className="os-element process-indicator process-2">
          <div className="process-bar"></div>
        </div>

        {/* CPU Cores */}
        <div className="os-element cpu-core cpu-core-1">
          <div className="cpu-label">CPU 0</div>
          <div className="cpu-activity"></div>
        </div>
        <div className="os-element cpu-core cpu-core-2">
          <div className="cpu-label">CPU 1</div>
          <div className="cpu-activity"></div>
        </div>

        {/* Disk I/O Indicators */}
        <div className="os-element disk-io disk-io-1">
          <div className="disk-label">R/W</div>
          <div className="disk-activity"></div>
        </div>

        {/* Thread Schedulers */}
        <div className="os-element thread-scheduler thread-1">
          <div className="thread-dot"></div>
          <div className="thread-dot"></div>
          <div className="thread-dot"></div>
        </div>

        {/* Cache Blocks */}
        <div className="os-element cache-block cache-1">L1</div>
        <div className="os-element cache-block cache-2">L2</div>
      </div>

      <div className="max-w-7xl mx-auto space-y-8 relative z-10">

        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-700/50 pb-6 slide-in">
          <div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black gradient-text flex items-center gap-4 animate-fade-in">
              <Activity className="text-blue-500 animate-pulse flex-shrink-0" size={48} />
              <span className="leading-tight">Page Replacement Algorithm Visualizer</span>
            </h1>
            <p className="text-slate-400 mt-4 text-base md:text-lg tracking-wide animate-slide-up">
              Interactive simulation of FIFO, LRU, Optimal, and CLOCK algorithms.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-3">
            <button
              onClick={() => {
                setRefString("1, 2, 3, 4, 1, 2, 5, 1, 2, 3, 4, 5");
                setFrameCount(3);
              }}
              className="px-5 py-2.5 glass hover-glow text-slate-200 rounded-lg text-sm font-semibold transition-all border border-slate-600/50 btn-ripple hover:scale-110 hover:border-blue-400/70 active:scale-95"
            >
              Preset 1
            </button>
            <button
              onClick={() => {
                setRefString("7, 0, 1, 2, 0, 3, 0, 4, 2, 3, 0, 3, 1, 5, 2, 6, 7, 1, 8, 9, 4, 1, 5, 3, 2");
                setFrameCount(4);
              }}
              className="px-5 py-2.5 glass hover-glow text-slate-200 rounded-lg text-sm font-semibold transition-all border border-slate-600/50 btn-ripple hover:scale-110 hover:border-purple-400/70 active:scale-95"
            >
              Preset 2
            </button>
          </div>
        </header>

        {/* Controls Section */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 glass-strong p-6 rounded-2xl border border-slate-700/50 shadow-2xl scale-in hover:shadow-blue-900/20 hover:border-slate-600/70 transition-all duration-300">
          <div className="lg:col-span-8 space-y-4">
            <div className="flex justify-between items-center">
              <label className="block text-sm font-medium text-slate-300">
                Reference String <span className="text-slate-500">(comma separated integers)</span>
              </label>
              <button
                onClick={generateRandomString}
                className="text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-600/20 to-purple-600/20 hover:from-blue-600/30 hover:to-purple-600/30 text-blue-300 hover:text-blue-200 border border-blue-500/30 hover:border-blue-400/50 transition-all shadow-sm hover:shadow-md hover:shadow-blue-500/20 font-medium"
              >
                <Shuffle size={14} className="animate-pulse" /> Randomize
              </button>
            </div>
            <input
              type="text"
              value={refString}
              onChange={(e) => setRefString(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-mono tracking-wider"
              placeholder="e.g. 7, 0, 1, 2, 0, 3..."
            />
          </div>

          <div className="lg:col-span-2 space-y-4">
            <label className="block text-sm font-medium text-slate-300">
              Frame Count
            </label>
            <input
              type="number"
              min={1}
              max={10}
              value={frameCount}
              onChange={(e) => setFrameCount(parseInt(e.target.value) || 1)}
              className="w-full bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-600 hover:border-blue-500/50 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono text-center text-lg font-bold shadow-inner transition-all"
            />
          </div>

          <div className="lg:col-span-2 flex items-end">
            <button
              onClick={() => { setCurrentStep(0); handleSimulate(); }}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-900/50 hover:shadow-xl hover:shadow-purple-900/50 active:scale-95 btn-ripple hover-glow hover:scale-105 animate-pulse-slow"
            >
              <Play size={18} className="animate-bounce-subtle" /> Start
            </button>
          </div>
        </section>

        {/* Results Area */}
        {results.length > 0 && (
          <div className="space-y-8 fade-in">

            {/* Algorithm Tabs */}
            <div className="flex border-b border-slate-700/50 overflow-x-hidden glass rounded-t-2xl custom-scrollbar">
              {(Object.values(AlgorithmType) as AlgorithmType[]).map((algo) => (
                <button
                  key={algo}
                  onClick={() => setActiveTab(algo)}
                  className={`px-8 py-4 font-bold text-sm md:text-base border-b-3 transition-all duration-300 whitespace-nowrap relative overflow-hidden transform hover:scale-105 ${activeTab === algo
                    ? 'border-blue-500 text-blue-400 glow-text bg-blue-500/10 scale-105'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-700/30'
                    }`}
                >
                  {algo}
                  {activeTab === algo && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 shimmer animate-shimmer"></div>}
                </button>
              ))}
            </div>

            {/* Visualization Grid */}
            <div className="min-h-[300px]">
              {getActiveResult() && (
                <VisualizerGrid
                  result={getActiveResult()!}
                  frameCount={frameCount}
                  currentStep={currentStep}
                />
              )}
            </div>

            {/* Playback Controller */}
            <div className="glass-strong p-5 rounded-2xl border border-slate-600/50 flex flex-col md:flex-row items-center justify-between gap-4 shadow-2xl neon-border">
              <div className="flex items-center gap-4">
                <h3 className="text-white font-semibold whitespace-nowrap">Step Control</h3>
                <div className="h-6 w-px bg-slate-600"></div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentStep(0)}
                    className="p-2 hover:bg-slate-700 rounded text-slate-300"
                    title="Start"
                  >
                    <Rewind size={20} />
                  </button>
                  <button
                    onClick={() => setCurrentStep(p => Math.max(0, p - 1))}
                    className="p-2 hover:bg-slate-700 rounded text-slate-300"
                    title="Previous Step"
                  >
                    <SkipBack size={20} />
                  </button>
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className={`p-2 rounded-lg text-white font-bold px-5 flex items-center gap-2 transition-all btn-ripple hover-glow ${isPlaying ? 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 shadow-lg shadow-amber-900/50' : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 shadow-lg shadow-green-900/50'}`}
                  >
                    {isPlaying ? <><Pause size={20} /> Pause</> : <><Play size={20} /> Play</>}
                  </button>
                  <button
                    onClick={() => setCurrentStep(p => Math.min(maxSteps, p + 1))}
                    className="p-2 hover:bg-slate-700 rounded text-slate-300"
                    title="Next Step"
                  >
                    <SkipForward size={20} />
                  </button>
                </div>
              </div>
              <div className="w-full md:w-auto flex items-center gap-3">
                <input
                  type="range"
                  min="0"
                  max={maxSteps}
                  value={currentStep}
                  onChange={(e) => setCurrentStep(parseInt(e.target.value))}
                  className="w-full md:w-64 h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <span className="font-mono text-sm text-slate-400 w-16 text-right">
                  {currentStep + 1} / {maxSteps + 1}
                </span>
              </div>
            </div>

            {/* Comparative Stats */}
            <StatsSummary results={results} />

            {/* Algorithm Tabs for Report Section */}
            <div className="flex border-b border-slate-700/50 overflow-x-hidden glass rounded-t-2xl custom-scrollbar">
              {(Object.values(AlgorithmType) as AlgorithmType[]).map((algo) => (
                <button
                  key={algo}
                  onClick={() => setActiveTab(algo)}
                  className={`px-8 py-4 font-bold text-sm md:text-base border-b-3 transition-all duration-300 whitespace-nowrap relative overflow-hidden transform hover:scale-105 ${activeTab === algo
                    ? 'border-blue-500 text-blue-400 glow-text bg-blue-500/10 scale-105'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-700/30'
                    }`}
                >
                  {algo}
                  {activeTab === algo && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 shimmer animate-shimmer"></div>}
                </button>
              ))}
            </div>

            {/* Detailed Simulation Report */}
            {getActiveResult() && (
              <SimulationReport result={getActiveResult()!} />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default App;