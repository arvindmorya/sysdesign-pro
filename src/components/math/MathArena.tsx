import React, { useState } from 'react';
import { MATH_DRILLS } from '../../data/mathDrills';
import { LATENCY_METRICS, POWERS_OF_TWO } from '../../data/latencyData';
import { 
  Calculator, 
  Clock, 
  HelpCircle, 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  Zap 
} from 'lucide-react';
import { fireSuccessConfetti } from '../../utils/confetti';

export const MathArena: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'estimator' | 'drills' | 'latency' | 'powers'>('estimator');

  // Interactive Live Estimator State
  const [dauMillions, setDauMillions] = useState<number>(100);
  const [readsPerDay, setReadsPerDay] = useState<number>(10);
  const [writesPerDay, setWritesPerDay] = useState<number>(1);
  const [payloadBytes, setPayloadBytes] = useState<number>(1000); // 1KB

  // Calculations
  const totalDau = dauMillions * 1_000_000;
  const totalReadsDay = totalDau * readsPerDay;
  const totalWritesDay = totalDau * writesPerDay;
  
  const readQpsAvg = Math.round(totalReadsDay / 86400);
  const readQpsPeak = Math.round(readQpsAvg * 2.5);

  const writeQpsAvg = Math.round(totalWritesDay / 86400);
  const writeQpsPeak = Math.round(writeQpsAvg * 2.5);

  const dailyStorageBytes = totalWritesDay * payloadBytes;
  const dailyStorageGB = (dailyStorageBytes / (1024 * 1024 * 1024)).toFixed(1);
  const yearlyStorageTB = ((dailyStorageBytes * 365) / (1024 * 1024 * 1024 * 1024)).toFixed(1);
  const fiveYearStorageTB = ((dailyStorageBytes * 365 * 5) / (1024 * 1024 * 1024 * 1024)).toFixed(1);

  // 80/20 Cache RAM: 20% of daily read volume cached
  const cacheRamGB = ((totalReadsDay * 0.2 * payloadBytes) / (1024 * 1024 * 1024)).toFixed(1);

  // Drill State
  const [currentDrillIdx, setCurrentDrillIdx] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);
  const currentDrill = MATH_DRILLS[currentDrillIdx];

  const handleSelectDrillOption = (value: string) => {
    if (hasSubmitted) return;
    setSelectedOption(value);
  };

  const handleSubmitDrill = () => {
    if (!selectedOption) return;
    setHasSubmitted(true);
    const chosen = currentDrill.options.find((o) => o.value === selectedOption);
    if (chosen?.isCorrect) {
      fireSuccessConfetti();
    }
  };

  const handleNextDrill = () => {
    setSelectedOption(null);
    setHasSubmitted(false);
    setCurrentDrillIdx((prev) => (prev + 1) % MATH_DRILLS.length);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Navigation Subtabs */}
      <div className="bg-slate-900/80 border border-slate-800 p-2 rounded-2xl flex items-center gap-2 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('estimator')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
            activeTab === 'estimator'
              ? 'bg-indigo-600 text-white shadow'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Calculator className="w-3.5 h-3.5" />
          <span>Interactive Capacity Estimator</span>
        </button>
        <button
          onClick={() => setActiveTab('drills')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
            activeTab === 'drills'
              ? 'bg-indigo-600 text-white shadow'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Interview Math Drills</span>
        </button>
        <button
          onClick={() => setActiveTab('latency')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
            activeTab === 'latency'
              ? 'bg-indigo-600 text-white shadow'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Latency Visualizer (Human Scaled)</span>
        </button>
        <button
          onClick={() => setActiveTab('powers')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
            activeTab === 'powers'
              ? 'bg-indigo-600 text-white shadow'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Powers of Two</span>
        </button>
      </div>

      {/* Tab 1: Live Interactive Capacity Estimator */}
      {activeTab === 'estimator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Sliders */}
          <div className="lg:col-span-5 bg-slate-900/80 border border-slate-800 p-5 rounded-2xl space-y-5">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Calculator className="w-4 h-4 text-cyan-400" />
                <span>Adjust System Parameters</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Drag the sliders to see how scale alters cluster size and caching.
              </p>
            </div>

            {/* Slider 1: DAU */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">Daily Active Users (DAU)</span>
                <span className="font-mono text-cyan-400 font-bold">{dauMillions} Million</span>
              </div>
              <input
                type="range"
                min="1"
                max="500"
                step="1"
                value={dauMillions}
                onChange={(e) => setDauMillions(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>1M</span>
                <span>100M</span>
                <span>500M</span>
              </div>
            </div>

            {/* Slider 2: Reads / User / Day */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">Reads per User per Day</span>
                <span className="font-mono text-emerald-400 font-bold">{readsPerDay} reads</span>
              </div>
              <input
                type="range"
                min="1"
                max="100"
                step="1"
                value={readsPerDay}
                onChange={(e) => setReadsPerDay(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>

            {/* Slider 3: Writes / User / Day */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">Writes per User per Day</span>
                <span className="font-mono text-indigo-400 font-bold">{writesPerDay} writes</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="20"
                step="0.1"
                value={writesPerDay}
                onChange={(e) => setWritesPerDay(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>

            {/* Slider 4: Record Payload Size */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">Average Record Payload Size</span>
                <span className="font-mono text-amber-400 font-bold">{payloadBytes} Bytes</span>
              </div>
              <input
                type="range"
                min="100"
                max="10000"
                step="100"
                value={payloadBytes}
                onChange={(e) => setPayloadBytes(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>100 B</span>
                <span>1 KB</span>
                <span>10 KB</span>
              </div>
            </div>
          </div>

          {/* Right Column: Live Computed Output Cards */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Read Throughput */}
            <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl flex flex-col justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Read Throughput
                </span>
                <div className="text-2xl font-bold text-cyan-400 font-mono">
                  {readQpsAvg.toLocaleString()} <span className="text-xs text-slate-400">QPS</span>
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Peak (2.5x): <strong className="text-white">{readQpsPeak.toLocaleString()} QPS</strong>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 mt-3 pt-2 border-t border-slate-800">
                Formula: ({dauMillions}M × {readsPerDay}) ÷ 86,400s
              </p>
            </div>

            {/* Write Throughput */}
            <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl flex flex-col justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Write Throughput
                </span>
                <div className="text-2xl font-bold text-indigo-400 font-mono">
                  {writeQpsAvg.toLocaleString()} <span className="text-xs text-slate-400">QPS</span>
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Peak (2.5x): <strong className="text-white">{writeQpsPeak.toLocaleString()} QPS</strong>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 mt-3 pt-2 border-t border-slate-800">
                Formula: ({dauMillions}M × {writesPerDay}) ÷ 86,400s
              </p>
            </div>

            {/* Storage Growth */}
            <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl flex flex-col justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Storage Growth (5 Years)
                </span>
                <div className="text-2xl font-bold text-emerald-400 font-mono">
                  {fiveYearStorageTB} <span className="text-xs text-slate-400">TB</span>
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Daily: <strong className="text-white">{dailyStorageGB} GB/day</strong> | 1 Yr: <strong className="text-white">{yearlyStorageTB} TB</strong>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 mt-3 pt-2 border-t border-slate-800">
                Formula: Writes/day × {payloadBytes}B × 365 × 5
              </p>
            </div>

            {/* Cache RAM (80/20 Rule) */}
            <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl flex flex-col justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Cache RAM (80/20 Rule)
                </span>
                <div className="text-2xl font-bold text-amber-400 font-mono">
                  {cacheRamGB} <span className="text-xs text-slate-400">GB RAM</span>
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Caches 20% of daily read queries in Redis cluster
                </div>
              </div>
              <p className="text-[11px] text-slate-500 mt-3 pt-2 border-t border-slate-800">
                Formula: Total Reads/day × 20% × {payloadBytes}B
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Interview Math Drills */}
      {activeTab === 'drills' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 max-w-3xl mx-auto space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 bg-indigo-950/60 px-2.5 py-1 rounded border border-indigo-800/40">
              Drill {currentDrillIdx + 1} of {MATH_DRILLS.length}
            </span>
            <span className="text-xs text-slate-400">Real Interview Estimation Drill</span>
          </div>

          <div>
            <h3 className="text-lg font-bold text-white">{currentDrill.title}</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-800">
              {currentDrill.scenario}
            </p>
            <p className="text-sm font-semibold text-slate-200 mt-4 leading-snug">
              {currentDrill.question}
            </p>
          </div>

          {/* Options */}
          <div className="space-y-2.5">
            {currentDrill.options.map((opt, oIdx) => {
              const isSelected = selectedOption === opt.value;
              let borderClass = 'border-slate-800 bg-slate-950/60 hover:border-slate-700';

              if (hasSubmitted) {
                if (opt.isCorrect) borderClass = 'border-emerald-500 bg-emerald-950/30 text-emerald-200';
                else if (isSelected && !opt.isCorrect) borderClass = 'border-rose-500 bg-rose-950/30 text-rose-200';
              } else if (isSelected) {
                borderClass = 'border-indigo-500 bg-indigo-950/40 text-white ring-1 ring-indigo-500/50';
              }

              return (
                <div
                  key={oIdx}
                  onClick={() => handleSelectDrillOption(opt.value)}
                  className={`p-3.5 rounded-xl border transition cursor-pointer ${borderClass}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium">{opt.label}</span>
                    {hasSubmitted && opt.isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                    {hasSubmitted && isSelected && !opt.isCorrect && <XCircle className="w-4 h-4 text-rose-400" />}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Actions & Explanation */}
          {!hasSubmitted ? (
            <button
              onClick={handleSubmitDrill}
              disabled={!selectedOption}
              className={`w-full py-3 rounded-xl text-xs font-bold transition shadow-lg cursor-pointer active:scale-95 ${
                selectedOption
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-indigo-500/25'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              Verify Answer
            </button>
          ) : (
            <div className="space-y-4 pt-2">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300">
                <span className="font-bold text-white block mb-2">Step-by-Step Whiteboard Derivation:</span>
                <ul className="space-y-1.5 font-mono text-[11px] text-slate-300">
                  {currentDrill.stepsFormula.map((step, sIdx) => (
                    <li key={sIdx} className="flex items-start gap-2">
                      <span className="text-indigo-400 font-bold">{sIdx + 1}.</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={handleNextDrill}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition cursor-pointer active:scale-95"
              >
                Next Drill →
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Latency Visualizer */}
      {activeTab === 'latency' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-400" />
              <span>Latency Numbers Every System Designer Must Know</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Engineered by Jeff Dean. Notice the order of magnitude jumps between CPU Cache → RAM → SSD → Datacenter → Submarine Cable.
            </p>
          </div>

          {/* Human Analogy Callout Box */}
          <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-800/40 text-xs text-slate-300 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-indigo-300">The Human-Time Scale Analogy: </span>
              If an L1 CPU cache hit (0.5 ns) took <strong className="text-white">1 second</strong>:
              Reading from Main RAM would take <strong className="text-cyan-300">3.3 minutes</strong>;
              Reading from an NVMe SSD would take <strong className="text-amber-300">~9 hours</strong>;
              A cross-datacenter roundtrip would take <strong className="text-purple-300">~11.5 days</strong>;
              And a Trans-Atlantic network call (US to Europe) would take <strong className="text-rose-400 font-bold">~9.5 YEARS!</strong>
            </div>
          </div>

          {/* Latency Table */}
          <div className="space-y-2">
            {LATENCY_METRICS.map((metric, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2.5">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                    metric.category === 'cpu'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      : metric.category === 'memory'
                      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                      : metric.category === 'storage'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  }`}>
                    {metric.category}
                  </span>
                  <span className="text-xs font-semibold text-slate-200">{metric.operation}</span>
                </div>

                <div className="flex items-center gap-4 sm:ml-auto">
                  <span className="text-[11px] text-slate-400 hidden md:block">{metric.description}</span>
                  <span className="font-mono text-xs font-bold text-cyan-400 bg-slate-900 px-2.5 py-1 rounded border border-slate-800 min-w-[70px] text-right">
                    {metric.displayTime}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Powers of Two */}
      {activeTab === 'powers' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4 max-w-2xl mx-auto">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Powers of Two Conversion Table</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Memorize these powers for instant mental math during back-of-the-envelope calculations.
            </p>
          </div>

          <div className="border border-slate-800 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
                <tr>
                  <th className="p-3">Power</th>
                  <th className="p-3">Exact Value</th>
                  <th className="p-3">Approximate Scale</th>
                  <th className="p-3">Storage Unit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 font-mono">
                {POWERS_OF_TWO.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40 text-slate-300">
                    <td className="p-3 font-bold text-indigo-400">{item.power}</td>
                    <td className="p-3">{item.exact}</td>
                    <td className="p-3 text-cyan-300 font-semibold">{item.approx}</td>
                    <td className="p-3 text-emerald-400 font-bold">{item.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
