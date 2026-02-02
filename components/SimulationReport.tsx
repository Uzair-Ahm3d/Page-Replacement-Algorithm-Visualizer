import React from 'react';
import { SimulationResult } from '../types';
import { Check, X } from 'lucide-react';

interface SimulationReportProps {
    result: SimulationResult;
}

export const SimulationReport: React.FC<SimulationReportProps> = ({ result }) => {
    return (
        <div className="glass-strong p-6 rounded-2xl border border-slate-600/50 shadow-2xl overflow-hidden">
            <h3 className="text-2xl font-bold text-slate-200 mb-6 flex items-center gap-3">
                <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
                Detailed Simulation Report - {result.algorithm}
            </h3>

            <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b-2 border-slate-600">
                            <th className="px-4 py-3 text-left text-slate-300 font-bold">Step</th>
                            <th className="px-4 py-3 text-left text-slate-300 font-bold">Page</th>
                            <th className="px-4 py-3 text-left text-slate-300 font-bold">Frames Before</th>
                            <th className="px-4 py-3 text-center text-slate-300 font-bold">Fault</th>
                            <th className="px-4 py-3 text-center text-slate-300 font-bold">Evicted</th>
                            <th className="px-4 py-3 text-left text-slate-300 font-bold">Frames After</th>
                            <th className="px-4 py-3 text-left text-slate-300 font-bold">Reason</th>
                        </tr>
                    </thead>
                    <tbody>
                        {result.steps.map((step, idx) => {
                            const framesBefore = idx > 0 ? result.steps[idx - 1].frames : Array(step.frames.length).fill(null);
                            const isFault = step.status === 'FAULT';
                            const evictedPage = idx > 0 ? framesBefore.find((page, i) => page !== null && page !== step.requestedPage && !step.frames.includes(page)) : null;

                            return (
                                <tr
                                    key={idx}
                                    className={`border-b border-slate-700/50 transition-all duration-300 hover:bg-slate-700/30 report-row ${isFault ? 'fault-row' : 'hit-row'}`}
                                    style={{ animationDelay: `${idx * 0.05}s` }}
                                >
                                    <td className="px-4 py-3 text-slate-200 font-mono font-semibold">{idx + 1}</td>
                                    <td className="px-4 py-3">
                                        <span className="inline-block px-3 py-1 rounded-lg bg-blue-500/20 text-blue-300 font-bold border border-blue-500/30">
                                            {step.requestedPage}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-slate-300 font-mono">
                                        {framesBefore.filter(f => f !== null).join(', ') || '-'}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        {isFault ? (
                                            <div className="flex justify-center">
                                                <X size={18} className="text-rose-400" />
                                            </div>
                                        ) : (
                                            <div className="flex justify-center">
                                                <Check size={18} className="text-green-400" />
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        {evictedPage !== null && evictedPage !== undefined ? (
                                            <span className="inline-block px-2 py-1 rounded bg-rose-500/20 text-rose-300 font-mono text-xs border border-rose-500/30">
                                                {evictedPage}
                                            </span>
                                        ) : (
                                            <span className="text-slate-500">-</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-slate-300 font-mono font-semibold">
                                        {step.frames.filter(f => f !== null).join(', ')}
                                    </td>
                                    <td className="px-4 py-3 text-slate-400 text-xs">
                                        {step.explanation}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Summary Footer */}
            <div className="mt-6 pt-4 border-t border-slate-600/50 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                    <div className="text-2xl font-bold text-white">{result.steps.length}</div>
                    <div className="text-xs text-slate-400 uppercase tracking-wide">Total Steps</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold text-rose-400">{result.totalFaults}</div>
                    <div className="text-xs text-slate-400 uppercase tracking-wide">Page Faults</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">{result.totalHits}</div>
                    <div className="text-xs text-slate-400 uppercase tracking-wide">Page Hits</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">{(result.faultRatio * 100).toFixed(1)}%</div>
                    <div className="text-xs text-slate-400 uppercase tracking-wide">Fault Ratio</div>
                </div>
            </div>
        </div>
    );
};
