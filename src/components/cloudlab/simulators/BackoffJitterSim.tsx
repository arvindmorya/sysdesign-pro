import React, { useState, useEffect } from 'react';
import { 
  RotateCcw, 
  Play, 
  AlertTriangle, 
  Cpu
} from 'lucide-react';

interface RetryPoint {
  clientId: number;
  attempt: number;
  scheduledTimeMs: number;
  processed: boolean;
}

export const BackoffJitterSim: React.FC = () => {
  const [useJitter, setUseJitter] = useState<boolean>(true);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [simTimeMs, setSimTimeMs] = useState<number>(0);
  const [retryPoints, setRetryPoints] = useState<RetryPoint[]>([]);
  const [serverCpuLoad, setServerCpuLoad] = useState<number>(20);
  const [serverCrashed, setServerCrashed] = useState<boolean>(false);

  // Client count
  const CLIENT_COUNT = 20;
  const BASE_DELAY_MS = 1000;
  const MAX_CAP_MS = 8000;

  const handleStartSim = () => {
    setIsRunning(true);
    setSimTimeMs(0);
    setServerCrashed(false);
    setServerCpuLoad(20);

    // Generate schedule for 20 clients across 3 attempts
    const points: RetryPoint[] = [];

    for (let c = 1; c <= CLIENT_COUNT; c++) {
      let cumulativeTime = 0;
      for (let attempt = 1; attempt <= 3; attempt++) {
        const exponentialWait = Math.min(MAX_CAP_MS, BASE_DELAY_MS * Math.pow(2, attempt - 1));
        
        let actualWait = exponentialWait;
        if (useJitter) {
          // Full Jitter formula: random between 0 and min(cap, base * 2^attempt)
          actualWait = Math.floor(Math.random() * exponentialWait);
        }

        cumulativeTime += actualWait;
        points.push({
          clientId: c,
          attempt,
          scheduledTimeMs: cumulativeTime,
          processed: false,
        });
      }
    }

    setRetryPoints(points.sort((a, b) => a.scheduledTimeMs - b.scheduledTimeMs));
  };

  // Timer loop
  useEffect(() => {
    let interval: any;
    if (isRunning) {
      interval = setInterval(() => {
        setSimTimeMs((prevTime) => {
          const nextTime = prevTime + 100;
          if (nextTime > 9000) {
            setIsRunning(false);
            return 9000;
          }

          // Count requests hitting server in this 100ms slice
          const hitsInWindow = retryPoints.filter(
            (p) => p.scheduledTimeMs >= prevTime && p.scheduledTimeMs < nextTime
          ).length;

          if (hitsInWindow > 0) {
            setServerCpuLoad((cpu) => {
              // High concurrency spike
              const newCpu = Math.min(100, cpu + hitsInWindow * 18);
              if (newCpu >= 95) {
                setServerCrashed(true);
              }
              return newCpu;
            });
          } else {
            // Gradual CPU cool down
            setServerCpuLoad((cpu) => Math.max(15, cpu - 4));
          }

          return nextTime;
        });
      }, 50);
    }
    return () => clearInterval(interval);
  }, [isRunning, retryPoints]);

  const handleReset = () => {
    setIsRunning(false);
    setSimTimeMs(0);
    setRetryPoints([]);
    setServerCpuLoad(20);
    setServerCrashed(false);
  };

  return (
    <div className="bg-[#0b101d] border border-slate-800 rounded-2xl p-5 shadow-2xl flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h3 className="text-lg font-bold text-white tracking-tight">Thundering Herd vs. Full Jitter Simulator</h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-500/20 text-rose-400 border border-rose-500/40">
              Video 11 & AWS Math
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Watch 20 clients retry after a network blip. Synchronized retries crash the recovering server; Full Jitter spreads load gracefully.
          </p>
        </div>

        {/* Algorithm Toggle */}
        <div className="flex items-center p-1 bg-slate-900 border border-slate-800 rounded-xl text-xs">
          <button
            onClick={() => { setUseJitter(false); handleReset(); }}
            className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
              !useJitter ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            ❌ No Jitter (Synchronized Spike)
          </button>
          <button
            onClick={() => { setUseJitter(true); handleReset(); }}
            className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
              useJitter ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            ✅ Full Jitter (Dispersed Load)
          </button>
        </div>
      </div>

      {/* Real-time Server Load Gauge */}
      <div className="bg-[#070b14] border border-slate-800 rounded-xl p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span className="font-bold text-white">Recovering Server CPU Utilization</span>
          </div>
          <span className={`font-mono font-bold ${serverCrashed ? 'text-rose-400 animate-pulse' : 'text-emerald-400'}`}>
            {serverCrashed ? '🔥 CRASHED: 100% CPU OVERLOAD' : `${serverCpuLoad}% Capacity`}
          </span>
        </div>

        {/* Meter Bar */}
        <div className="w-full h-4 bg-slate-900 rounded-full overflow-hidden border border-slate-800 p-0.5">
          <div
            className={`h-full rounded-full transition-all duration-150 ${
              serverCrashed
                ? 'bg-rose-600 animate-pulse'
                : serverCpuLoad > 70
                ? 'bg-amber-500'
                : 'bg-emerald-500'
            }`}
            style={{ width: `${serverCpuLoad}%` }}
          />
        </div>

        {serverCrashed && (
          <div className="bg-rose-950/40 border border-rose-500/40 text-rose-300 p-2.5 rounded-lg text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>
              <strong>Thundering Herd Outage:</strong> All 20 clients hit the server at the exact same millisecond mark! The synchronized spike knocked the server back offline!
            </span>
          </div>
        )}
      </div>

      {/* Visual Timeline Wave Distribution */}
      <div className="bg-[#070b14] border border-slate-800 rounded-xl p-4 flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-2">
          <span>Client Request Arrival Timeline (0s to 8s):</span>
          <span className="font-mono text-cyan-400">Elapsed: {(simTimeMs / 1000).toFixed(1)}s</span>
        </div>

        {/* Timeline Track */}
        <div className="relative h-28 bg-slate-950/80 rounded-lg border border-slate-800/80 overflow-hidden flex items-center">
          {/* Vertical Time Indicator */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-cyan-400 shadow-[0_0_8px_#38bdf8] z-20 transition-all duration-75"
            style={{ left: `${(simTimeMs / 8000) * 100}%` }}
          />

          {/* Time tick labels */}
          <div className="absolute bottom-1 left-2 text-[9px] text-slate-600 font-mono">0s</div>
          <div className="absolute bottom-1 left-1/4 text-[9px] text-slate-600 font-mono">2s</div>
          <div className="absolute bottom-1 left-2/4 text-[9px] text-slate-600 font-mono">4s</div>
          <div className="absolute bottom-1 left-3/4 text-[9px] text-slate-600 font-mono">6s</div>
          <div className="absolute bottom-1 right-2 text-[9px] text-slate-600 font-mono">8s</div>

          {/* Render individual retry points */}
          {retryPoints.map((pt, idx) => {
            const leftPct = (pt.scheduledTimeMs / 8000) * 100;
            const isFired = simTimeMs >= pt.scheduledTimeMs;
            if (leftPct > 100) return null;

            return (
              <div
                key={idx}
                className={`absolute w-2.5 h-2.5 rounded-full border transition-all ${
                  isFired
                    ? 'bg-rose-500 border-white scale-110 shadow-sm'
                    : 'bg-indigo-500/40 border-indigo-400/60'
                }`}
                style={{
                  left: `${leftPct}%`,
                  top: `${15 + ((pt.clientId * 17) % 65)}%`,
                }}
                title={`Client #${pt.clientId} (Attempt ${pt.attempt}) at ${pt.scheduledTimeMs}ms`}
              />
            );
          })}
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
          <span>
            {useJitter ? (
              <span className="text-emerald-400 font-semibold">
                ✓ Full Jitter: Requests are distributed randomly between 0 and 2^attempt.
              </span>
            ) : (
              <span className="text-rose-400 font-semibold">
                ✕ Synchronized Herd: All 20 clients line up at 1.0s, 2.0s, 4.0s!
              </span>
            )}
          </span>
          <span className="text-slate-500 font-mono">Formula: {useJitter ? 'rand(0, min(cap, base * 2^i))' : 'base * 2^i'}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleStartSim}
          disabled={isRunning}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-medium text-xs shadow-md transition cursor-pointer active:scale-95"
        >
          <Play className="w-4 h-4" />
          <span>Simulate 20-Client Retry Wave</span>
        </button>

        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700 transition cursor-pointer active:scale-95"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>
    </div>
  );
};
