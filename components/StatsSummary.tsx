import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';
import { SimulationResult, AlgorithmType } from '../types';

interface StatsSummaryProps {
  results: SimulationResult[];
}

export const StatsSummary: React.FC<StatsSummaryProps> = ({ results }) => {
  if (results.length === 0) return null;

  const data = results.map(r => ({
    name: r.algorithm,
    Faults: r.totalFaults,
    Hits: r.totalHits,
    MissRatio: (r.faultRatio * 100).toFixed(1)
  }));

  const getColor = (algo: AlgorithmType) => {
    switch (algo) {
      case AlgorithmType.FIFO: return '#3b82f6'; // blue
      case AlgorithmType.LRU: return '#8b5cf6'; // violet
      case AlgorithmType.OPTIMAL: return '#10b981'; // emerald
      case AlgorithmType.CLOCK: return '#f59e0b'; // amber
      default: return '#cbd5e1';
    }
  };

  return (
    <div className="space-y-6 mt-8">
      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {results.map((r, idx) => (
          <div key={r.algorithm} className={`glass-strong p-5 rounded-2xl border border-slate-600/50 relative overflow-hidden card-hover shadow-xl stagger-item`} style={{ animationDelay: `${idx * 0.1}s` }}>
            <div
              className="absolute left-0 top-0 bottom-0 w-2 transition-all group-hover:w-2"
              style={{ background: `linear-gradient(180deg, ${getColor(r.algorithm)}, transparent)` }}
            />
            <div className="ml-2">
              <span className="text-slate-300 text-sm font-bold tracking-wider uppercase">{r.algorithm}</span>
              <div className="text-3xl font-black text-white mt-2 flex items-baseline gap-2">
                {r.totalFaults} <span className="text-base font-normal text-slate-400">Faults</span>
              </div>
            </div>
            <div className="text-right mt-2">
              <div className="text-emerald-400 font-bold text-lg">{r.totalHits} Hits</div>
              <div className="text-xs text-slate-400 mt-1 font-semibold">
                {(r.faultRatio * 100).toFixed(0)}% Miss Ratio
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Chart - Full Width Centered */}
      <div className="glass-strong p-8 rounded-2xl border border-slate-600/50 shadow-xl scale-in overflow-hidden">
        <h3 className="text-2xl font-bold text-slate-200 mb-8 flex items-center justify-center gap-3">
          <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
          Faults Comparison (Lower is Better)
        </h3>
        <div className="w-full flex justify-center items-center">
          <div className="w-full max-w-4xl">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={data} layout="vertical" margin={{ top: 20, right: 60, left: 100, bottom: 20 }}>
                <XAxis
                  type="number"
                  stroke="#94a3b8"
                  style={{ fontSize: '15px', fontWeight: '500' }}
                  tick={{ fill: '#cbd5e1' }}
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  stroke="#e2e8f0"
                  width={90}
                  style={{ fontSize: '15px', fontWeight: 'bold' }}
                  tick={{ fill: '#f1f5f9' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderColor: '#475569',
                    color: '#f1f5f9',
                    borderRadius: '12px',
                    padding: '16px',
                    fontSize: '15px',
                    fontWeight: '600',
                    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)'
                  }}
                  cursor={{ fill: '#475569', opacity: 0.2 }}
                />
                <Legend
                  wrapperStyle={{
                    paddingTop: '30px',
                    fontSize: '15px',
                    fontWeight: '600'
                  }}
                />
                <Bar
                  dataKey="Faults"
                  fill="#f43f5e"
                  radius={[0, 12, 12, 0]}
                  barSize={50}
                >
                  {results.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={getColor(entry.algorithm)}
                      style={{
                        filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3))'
                      }}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};