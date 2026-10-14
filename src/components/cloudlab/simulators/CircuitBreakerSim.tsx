import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  ShieldX, 
  Play, 
  Flame, 
  RotateCcw, 
  Clock, 
  Activity, 
  Server, 
  Cpu
} from 'lucide-react';

type BreakerState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

interface Packet {
  id: string;
  type: 'success' | 'failure' | 'probe';
  progress: number; // 0 to 100
  rejectedByBreaker?: boolean;
}

interface LogEntry {
  id: string;
  timestamp: string;
  text: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

export const CircuitBreakerSim: React.FC = () => {
  const [state, setState] = useState<BreakerState>('CLOSED');
  const [failureThreshold, setFailureThreshold] = useState<number>(50); // 50%
  const [windowSize] = useState<number>(6);
  const [cooldownSeconds, setCooldownSeconds] = useState<number>(5);
  const [cooldownRemaining, setCooldownRemaining] = useState<number>(0);
  
  // History of recent outcomes in current window
  const [recentOutcomes, setRecentOutcomes] = useState<('success' | 'failure')[]>([]);
  
  // Metrics
  const [stats, setStats] = useState({
    total: 0,
    successful: 0,
    failed: 0,
    rejected: 0,
  });

  const [packets, setPackets] = useState<Packet[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([
    { id: '1', timestamp: '00:00', text: 'Circuit Breaker initialized in CLOSED state. All traffic flows directly to backend service.', type: 'info' }
  ]);

  const addLog = (text: string, type: 'success' | 'error' | 'warning' | 'info') => {
    const time = new Date().toLocaleTimeString().split(' ')[0];
    setLogs((prev) => [{ id: Math.random().toString(), timestamp: time, text, type }, ...prev.slice(0, 19)]);
  };

  // Cooldown timer when OPEN
  useEffect(() => {
    let timer: any;
    if (state === 'OPEN' && cooldownRemaining > 0) {
      timer = setInterval(() => {
        setCooldownRemaining((prev) => {
          if (prev <= 1) {
            setState('HALF_OPEN');
            addLog('Breaker cooldown elapsed! Transitioning to HALF-OPEN state. Testing single canary probe request.', 'warning');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [state, cooldownRemaining]);

  // Animation frame loop for in-flight packets
  useEffect(() => {
    let animationFrame: number;
    const step = () => {
      setPackets((prevPackets) => 
        prevPackets
          .map((p) => ({ ...p, progress: p.progress + 3.5 }))
          .filter((p) => p.progress <= 100)
      );
      animationFrame = requestAnimationFrame(step);
    };
    animationFrame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrame);
  }, []);

  const sendRequest = (shouldFail: boolean) => {
    const packetId = Math.random().toString(36).substring(2, 7);

    // If OPEN: breaker rejects immediately! Fail-fast in 1ms!
    if (state === 'OPEN') {
      setStats((s) => ({ ...s, total: s.total + 1, rejected: s.rejected + 1 }));
      setPackets((prev) => [...prev, { id: packetId, type: 'failure', progress: 0, rejectedByBreaker: true }]);
      addLog('⚡ [FAIL FAST]: Breaker is OPEN. Request rejected immediately with HTTP 503 Fallback. 0ms wait, backend spared!', 'error');
      return;
    }

    // If HALF_OPEN: only one probe allowed
    if (state === 'HALF_OPEN') {
      const probeSuccess = !shouldFail;
      setPackets((prev) => [...prev, { id: packetId, type: probeSuccess ? 'success' : 'failure', progress: 0 }]);
      setStats((s) => ({ 
        ...s, 
        total: s.total + 1, 
        successful: s.successful + (probeSuccess ? 1 : 0), 
        failed: s.failed + (probeSuccess ? 0 : 1) 
      }));

      setTimeout(() => {
        if (probeSuccess) {
          setState('CLOSED');
          setRecentOutcomes(['success']);
          addLog('✅ Canary probe SUCCEEDED! Backend has recovered. Breaker returned to CLOSED state.', 'success');
        } else {
          setState('OPEN');
          setCooldownRemaining(cooldownSeconds);
          addLog('❌ Canary probe FAILED! Backend is still broken. Breaker tripped back to OPEN state.', 'error');
        }
      }, 700);
      return;
    }

    // CLOSED STATE
    setPackets((prev) => [...prev, { id: packetId, type: shouldFail ? 'failure' : 'success', progress: 0 }]);
    const outcome: 'success' | 'failure' = shouldFail ? 'failure' : 'success';
    const newOutcomes: ('success' | 'failure')[] = [...recentOutcomes, outcome].slice(-windowSize);
    setRecentOutcomes(newOutcomes);

    setStats((s) => ({
      ...s,
      total: s.total + 1,
      successful: s.successful + (shouldFail ? 0 : 1),
      failed: s.failed + (shouldFail ? 1 : 0),
    }));

    if (shouldFail) {
      addLog('Downstream returned 500 Internal Error / Timeout.', 'warning');
    } else {
      addLog('Downstream returned 200 OK successfully.', 'success');
    }

    // Evaluate trip condition
    if (newOutcomes.length >= windowSize) {
      const failures = newOutcomes.filter((o) => o === 'failure').length;
      const failureRate = (failures / newOutcomes.length) * 100;
      if (failureRate >= failureThreshold) {
        setState('OPEN');
        setCooldownRemaining(cooldownSeconds);
        addLog(`🚨 TRIP TRIGGERED! Failure rate reached ${failureRate.toFixed(0)}% (>= ${failureThreshold}% threshold). Breaker is now OPEN!`, 'error');
      }
    }
  };

  const handleSimulateBurst = () => {
    // Fire a burst of 6 requests with 4 failures
    const pattern = [false, true, true, false, true, true];
    pattern.forEach((willFail, idx) => {
      setTimeout(() => {
        sendRequest(willFail);
      }, idx * 250);
    });
  };

  const handleReset = () => {
    setState('CLOSED');
    setRecentOutcomes([]);
    setCooldownRemaining(0);
    setPackets([]);
    setStats({ total: 0, successful: 0, failed: 0, rejected: 0 });
    addLog('Breaker manually reset to CLOSED state with clean telemetry.', 'info');
  };

  const currentFailures = recentOutcomes.filter((o) => o === 'failure').length;
  const currentFailureRate = recentOutcomes.length > 0 ? (currentFailures / recentOutcomes.length) * 100 : 0;

  return (
    <div className="bg-[#0b101d] border border-slate-800 rounded-2xl p-5 shadow-2xl flex flex-col gap-6">
      {/* Top Header & State Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h3 className="text-lg font-bold text-white tracking-tight">Circuit Breaker Fail-Safe Simulator</h3>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
              state === 'CLOSED'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                : state === 'OPEN'
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse'
                : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
            }`}>
              {state === 'CLOSED' && <ShieldCheck className="w-3.5 h-3.5" />}
              {state === 'OPEN' && <ShieldX className="w-3.5 h-3.5" />}
              {state === 'HALF_OPEN' && <ShieldAlert className="w-3.5 h-3.5" />}
              State: {state.replace('_', ' ')}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Observe how the breaker trips when error rates cross the threshold, sparing downstream thread pools.
          </p>
        </div>

        {/* Cooldown Timer when OPEN */}
        {state === 'OPEN' && (
          <div className="flex items-center gap-2 bg-rose-950/40 border border-rose-500/30 px-3 py-1.5 rounded-xl text-rose-300 text-xs">
            <Clock className="w-4 h-4 animate-spin text-rose-400" />
            <span>Cooldown remaining: <strong>{cooldownRemaining}s</strong></span>
          </div>
        )}
      </div>

      {/* Main Visual Animation Canvas */}
      <div className="relative bg-[#070b14] border border-slate-800/80 rounded-xl p-6 overflow-hidden min-h-[220px] flex items-center justify-between">
        {/* Background Grid Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />

        {/* Node 1: Client */}
        <div className="relative z-10 flex flex-col items-center gap-2">
          <div className="w-16 h-16 rounded-2xl bg-indigo-950/60 border-2 border-indigo-500/50 flex flex-col items-center justify-center text-indigo-300 shadow-lg shadow-indigo-950/40">
            <Cpu className="w-7 h-7" />
            <span className="text-[10px] font-bold mt-0.5">CLIENT</span>
          </div>
          <span className="text-xs text-slate-400 font-mono">App / Mobile</span>
        </div>

        {/* Connecting Line 1 (Client to Breaker) */}
        <div className="flex-1 h-0.5 bg-gradient-to-r from-indigo-500/30 to-violet-500/30 relative mx-4">
          {/* Animated Packets Moving Forward */}
          {packets.map((packet) => {
            if (packet.progress > 50 && packet.rejectedByBreaker) return null;
            const leftPercent = Math.min(packet.progress * 2, 100);
            return (
              <div
                key={packet.id}
                className={`absolute -top-2 w-4 h-4 rounded-full border shadow-md flex items-center justify-center text-[8px] font-bold transition-all duration-75 ${
                  packet.type === 'success'
                    ? 'bg-emerald-500 border-white text-emerald-950 shadow-emerald-500/50'
                    : 'bg-rose-500 border-white text-rose-950 shadow-rose-500/50'
                }`}
                style={{ left: `${leftPercent}%` }}
              >
                {packet.type === 'success' ? '✓' : '✕'}
              </div>
            );
          })}
        </div>

        {/* Node 2: Circuit Breaker Proxy */}
        <div className="relative z-10 flex flex-col items-center gap-2">
          <div className={`w-24 h-24 rounded-2xl border-2 flex flex-col items-center justify-center p-2 text-center transition-all duration-300 shadow-xl ${
            state === 'CLOSED'
              ? 'bg-emerald-950/40 border-emerald-500 text-emerald-300 shadow-emerald-900/30'
              : state === 'OPEN'
              ? 'bg-rose-950/60 border-rose-500 text-rose-300 shadow-rose-900/50 ring-4 ring-rose-500/20'
              : 'bg-amber-950/50 border-amber-500 text-amber-300 shadow-amber-900/40'
          }`}>
            {state === 'CLOSED' && <ShieldCheck className="w-7 h-7 text-emerald-400" />}
            {state === 'OPEN' && <ShieldX className="w-7 h-7 text-rose-400 animate-bounce" />}
            {state === 'HALF_OPEN' && <ShieldAlert className="w-7 h-7 text-amber-400" />}
            <span className="text-[10px] font-extrabold uppercase mt-1">CIRCUIT BREAKER</span>
            <span className="text-[9px] font-mono text-slate-400">{state}</span>
          </div>

          {/* Instant Fallback Indicator when rejected */}
          {state === 'OPEN' && (
            <div className="absolute -bottom-7 bg-rose-500/20 border border-rose-500/40 text-rose-300 text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
              ⚡ Instant 503 Fallback (0ms)
            </div>
          )}
        </div>

        {/* Connecting Line 2 (Breaker to Backend Service) */}
        <div className="flex-1 h-0.5 relative mx-4">
          <div className={`w-full h-full ${
            state === 'CLOSED'
              ? 'bg-gradient-to-r from-emerald-500/40 to-cyan-500/40'
              : state === 'HALF_OPEN'
              ? 'bg-gradient-to-r from-amber-500/40 to-cyan-500/40 border-b border-dashed border-amber-400'
              : 'bg-slate-800 opacity-20'
          }`} />

          {/* Animated Packets Moving to Backend only if NOT rejected */}
          {packets.map((packet) => {
            if (packet.rejectedByBreaker || packet.progress < 50) return null;
            const progressSecondHalf = (packet.progress - 50) * 2;
            return (
              <div
                key={packet.id}
                className={`absolute -top-2 w-4 h-4 rounded-full border shadow-md flex items-center justify-center text-[8px] font-bold ${
                  packet.type === 'success'
                    ? 'bg-emerald-500 border-white text-emerald-950 shadow-emerald-500/50'
                    : 'bg-rose-500 border-white text-rose-950 shadow-rose-500/50'
                }`}
                style={{ left: `${progressSecondHalf}%` }}
              >
                {packet.type === 'success' ? '✓' : '✕'}
              </div>
            );
          })}
        </div>

        {/* Node 3: Backend Service */}
        <div className="relative z-10 flex flex-col items-center gap-2">
          <div className="w-16 h-16 rounded-2xl bg-slate-900 border-2 border-cyan-500/50 flex flex-col items-center justify-center text-cyan-300 shadow-lg shadow-cyan-950/40">
            <Server className="w-7 h-7" />
            <span className="text-[10px] font-bold mt-0.5">BACKEND</span>
          </div>
          <span className="text-xs text-slate-400 font-mono">Microservice</span>
        </div>
      </div>

      {/* Control Actions & Simulation Triggers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <button
          onClick={() => sendRequest(false)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600/90 hover:bg-emerald-500 text-white font-medium text-xs shadow-md shadow-emerald-900/30 transition cursor-pointer active:scale-95"
        >
          <Play className="w-4 h-4" />
          <span>Send Normal Request (200 OK)</span>
        </button>

        <button
          onClick={() => sendRequest(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600/90 hover:bg-rose-500 text-white font-medium text-xs shadow-md shadow-rose-900/30 transition cursor-pointer active:scale-95"
        >
          <Flame className="w-4 h-4" />
          <span>Trigger Failure (500 Error)</span>
        </button>

        <button
          onClick={handleSimulateBurst}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600/90 hover:bg-amber-500 text-white font-medium text-xs shadow-md shadow-amber-900/30 transition cursor-pointer active:scale-95"
        >
          <Activity className="w-4 h-4" />
          <span>Simulate Burst (Fail-Spike)</span>
        </button>

        <button
          onClick={handleReset}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs transition cursor-pointer active:scale-95 border border-slate-700"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reset Simulation</span>
        </button>
      </div>

      {/* Telemetry & Configuration Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-900/60 border border-slate-800/80 rounded-xl p-4">
        {/* Metric 1: Failure Rate vs Threshold */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium">Evaluation Window:</span>
            <span className="font-mono text-slate-200">{recentOutcomes.length} / {windowSize} reqs</span>
          </div>
          
          {/* Visual dots of recent requests */}
          <div className="flex items-center gap-1.5 h-6">
            {Array.from({ length: windowSize }).map((_, i) => {
              const outcome = recentOutcomes[i];
              return (
                <div
                  key={i}
                  className={`w-4 h-4 rounded-full border flex items-center justify-center text-[9px] font-bold ${
                    outcome === 'success'
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                      : outcome === 'failure'
                      ? 'bg-rose-500/20 border-rose-500 text-rose-400'
                      : 'bg-slate-800 border-slate-700 text-slate-600'
                  }`}
                >
                  {outcome === 'success' ? '✓' : outcome === 'failure' ? '✕' : ''}
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-xs mt-1">
            <span className="text-slate-400">Failure Rate:</span>
            <span className={`font-mono font-bold ${currentFailureRate >= failureThreshold ? 'text-rose-400' : 'text-emerald-400'}`}>
              {currentFailureRate.toFixed(0)}% (Trip at {failureThreshold}%)
            </span>
          </div>
        </div>

        {/* Metric 2: Server Protection Telemetry */}
        <div className="flex flex-col gap-1.5 border-t md:border-t-0 md:border-l border-slate-800 md:pl-4 pt-2 md:pt-0">
          <span className="text-xs text-slate-400 font-medium">Protection Telemetry</span>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800/60">
              <span className="text-[10px] text-slate-400">Total Requests:</span>
              <p className="font-mono text-base font-bold text-white">{stats.total}</p>
            </div>
            <div className="bg-rose-950/30 p-2 rounded-lg border border-rose-500/20">
              <span className="text-[10px] text-rose-400 font-semibold">Rejected (Saved):</span>
              <p className="font-mono text-base font-bold text-rose-300">{stats.rejected}</p>
            </div>
          </div>
        </div>

        {/* Sliders: Parameters */}
        <div className="flex flex-col gap-2 border-t md:border-t-0 md:border-l border-slate-800 md:pl-4 pt-2 md:pt-0 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Threshold:</span>
            <span className="font-mono text-white font-bold">{failureThreshold}%</span>
          </div>
          <input
            type="range"
            min={20}
            max={80}
            step={10}
            value={failureThreshold}
            onChange={(e) => setFailureThreshold(Number(e.target.value))}
            className="w-full accent-indigo-500 cursor-pointer"
          />

          <div className="flex items-center justify-between mt-1">
            <span className="text-slate-400">Cooldown Timeout:</span>
            <span className="font-mono text-white font-bold">{cooldownSeconds}s</span>
          </div>
          <input
            type="range"
            min={2}
            max={10}
            step={1}
            value={cooldownSeconds}
            onChange={(e) => setCooldownSeconds(Number(e.target.value))}
            className="w-full accent-indigo-500 cursor-pointer"
          />
        </div>
      </div>

      {/* Live State Machine Log */}
      <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-3 flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs border-b border-slate-800/80 pb-1.5">
          <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
            <Activity className="w-3.5 h-3.5 text-indigo-400" />
            <span>State Machine Event Log</span>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">Last 20 events</span>
        </div>

        <div className="flex flex-col gap-1 max-h-36 overflow-y-auto pr-1 text-[11px] font-mono scrollbar-thin">
          {logs.map((log) => (
            <div key={log.id} className="flex items-start gap-2 py-0.5">
              <span className="text-slate-500 shrink-0">[{log.timestamp}]</span>
              <span className={`leading-relaxed ${
                log.type === 'error' ? 'text-rose-400 font-semibold' :
                log.type === 'warning' ? 'text-amber-400' :
                log.type === 'success' ? 'text-emerald-400' : 'text-slate-300'
              }`}>
                {log.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
