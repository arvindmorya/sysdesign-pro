import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  Building2, 
  Server, 
  Cpu, 
  Flame, 
  RotateCcw, 
  Layers, 
  Zap, 
  AlertOctagon
} from 'lucide-react';

export const FaultDomainSim: React.FC = () => {
  const [azAFailed, setAzAFailed] = useState<boolean>(false);
  const [rackB1Failed, setRackB1Failed] = useState<boolean>(false);
  const [vmAFailed, setVmAFailed] = useState<boolean>(false);
  const [multiAzEnabled, setMultiAzEnabled] = useState<boolean>(true);
  
  // Real-time animated traffic ticker
  const [qpsTicker] = useState<number>(10000);
  const [healthyQps, setHealthyQps] = useState<number>(10000);

  useEffect(() => {
    let activeCapacity = 100;

    if (!multiAzEnabled) {
      // Single AZ only (hosted entirely on AZ-A)
      if (azAFailed) {
        activeCapacity = 0;
      } else if (vmAFailed) {
        activeCapacity = 50;
      }
    } else {
      // Multi-AZ (50% in AZ-A, 50% in AZ-B)
      let azACap = azAFailed ? 0 : (vmAFailed ? 25 : 50);
      let azBCap = rackB1Failed ? 25 : 50;
      activeCapacity = azACap + azBCap;
    }

    setHealthyQps(Math.round((qpsTicker * activeCapacity) / 100));
  }, [azAFailed, rackB1Failed, vmAFailed, multiAzEnabled, qpsTicker]);

  const handleResetDisasters = () => {
    setAzAFailed(false);
    setRackB1Failed(false);
    setVmAFailed(false);
  };

  const availabilityPct = ((healthyQps / qpsTicker) * 100).toFixed(1);

  return (
    <div className="bg-[#0b101d] border border-slate-800 rounded-2xl p-5 shadow-2xl flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h3 className="text-lg font-bold text-white tracking-tight">Fault Domains & Physical Topology Simulator</h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
              Videos 2-3 & Hierarchy
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Hierarchy: <code className="text-cyan-300">Region ➔ AZ ➔ Rack ➔ Host PC ➔ VM ➔ Container</code>. Trigger physical disasters to see how cross-domain replication guarantees survivability.
          </p>
        </div>

        {/* Multi-AZ Toggle */}
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-1.5 rounded-xl text-xs">
          <span className="text-slate-400 font-medium">Topology:</span>
          <button
            onClick={() => setMultiAzEnabled(false)}
            className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
              !multiAzEnabled ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Single-AZ (High Risk)
          </button>
          <button
            onClick={() => setMultiAzEnabled(true)}
            className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
              multiAzEnabled ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Multi-AZ Active-Active
          </button>
        </div>
      </div>

      {/* Real-time Health Telemetry Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#070b14] border border-slate-800 rounded-xl p-3 text-xs">
        <div className="flex items-center justify-between p-2 bg-slate-900/60 rounded-lg">
          <span className="text-slate-400">Incoming User QPS:</span>
          <span className="font-mono font-bold text-white text-sm">{qpsTicker.toLocaleString()} req/s</span>
        </div>
        <div className="flex items-center justify-between p-2 bg-slate-900/60 rounded-lg">
          <span className="text-slate-400">Healthy Processed QPS:</span>
          <span className="font-mono font-bold text-emerald-400 text-sm">{healthyQps.toLocaleString()} req/s</span>
        </div>
        <div className="flex items-center justify-between p-2 bg-slate-900/60 rounded-lg">
          <span className="text-slate-400">Live Cluster Availability:</span>
          <span className={`font-mono font-bold text-sm ${Number(availabilityPct) > 90 ? 'text-emerald-400' : Number(availabilityPct) > 40 ? 'text-amber-400' : 'text-rose-400 animate-pulse'}`}>
            {availabilityPct}%
          </span>
        </div>
      </div>

      {/* Visual Region & Multi-AZ Topology Canvas */}
      <div className="bg-[#070b14] border border-slate-800 rounded-xl p-5 flex flex-col gap-4 relative overflow-hidden">
        {/* Region Top Label */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wider">
            <Globe className="w-4 h-4" />
            <span>Region: us-east-1 (N. Virginia)</span>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">Private Optical Fiber Latency &lt; 1.5ms</span>
        </div>

        {/* Global L7 Anycast Load Balancer */}
        <div className="bg-gradient-to-r from-indigo-900/40 via-violet-900/40 to-cyan-900/40 border border-indigo-500/30 p-2.5 rounded-xl flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span className="font-bold text-white">Cross-AZ Health-Checking Load Balancer</span>
          </div>
          <span className="text-[11px] text-slate-400">
            {azAFailed ? '⚠️ AZ-A unhealthy! Rerouting 100% traffic to AZ-B' : 'Dynamic round-robin load distribution'}
          </span>
        </div>

        {/* Availability Zones Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Availability Zone A */}
          <div className={`p-4 rounded-xl border flex flex-col gap-3 transition-all duration-300 relative ${
            azAFailed ? 'bg-rose-950/40 border-rose-500/50 opacity-90' : 'bg-slate-900/40 border-slate-800'
          }`}>
            <div className="flex items-center justify-between border-b border-slate-800/60 pb-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                <Building2 className={`w-4 h-4 ${azAFailed ? 'text-rose-400' : 'text-emerald-400'}`} />
                <span>Availability Zone A (us-east-1a)</span>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                azAFailed ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-400'
              }`}>
                {azAFailed ? 'POWER LOSS / OFFLINE' : 'ONLINE (HEALTHY)'}
              </span>
            </div>

            {/* Racks inside AZ-A */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              {/* Rack 1 */}
              <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800 flex flex-col gap-1.5">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Rack A-1 (TOR Switch)</span>
                <div className={`p-1.5 rounded flex items-center justify-between text-[11px] ${
                  azAFailed ? 'text-rose-400 line-through' : vmAFailed ? 'bg-rose-950/40 text-rose-400 border border-rose-500/30' : 'bg-slate-900 text-slate-200'
                }`}>
                  <span className="flex items-center gap-1">
                    <Server className="w-3 h-3 text-cyan-400" /> VM Node 1
                  </span>
                  <span className="text-[9px] font-mono">{azAFailed ? 'DEAD' : vmAFailed ? 'CRASHED' : '2 Pods'}</span>
                </div>
              </div>

              {/* Rack 2 */}
              <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800 flex flex-col gap-1.5">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Rack A-2 (TOR Switch)</span>
                <div className={`p-1.5 rounded flex items-center justify-between text-[11px] ${
                  azAFailed ? 'text-rose-400 line-through' : 'bg-slate-900 text-slate-200'
                }`}>
                  <span className="flex items-center gap-1">
                    <Server className="w-3 h-3 text-cyan-400" /> VM Node 2
                  </span>
                  <span className="text-[9px] font-mono">{azAFailed ? 'DEAD' : '2 Pods'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Availability Zone B */}
          <div className={`p-4 rounded-xl border flex flex-col gap-3 transition-all duration-300 relative ${
            !multiAzEnabled ? 'opacity-30 border-dashed border-slate-800 bg-[#070b14]' :
            'bg-slate-900/40 border-slate-800'
          }`}>
            <div className="flex items-center justify-between border-b border-slate-800/60 pb-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                <Building2 className="w-4 h-4 text-emerald-400" />
                <span>Availability Zone B (us-east-1b)</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded font-bold uppercase bg-emerald-500/20 text-emerald-400">
                {!multiAzEnabled ? 'NOT PROVISIONED' : 'ONLINE (HEALTHY)'}
              </span>
            </div>

            {/* Racks inside AZ-B */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              {/* Rack B-1 */}
              <div className={`p-2.5 rounded-lg border flex flex-col gap-1.5 ${
                rackB1Failed ? 'bg-rose-950/30 border-rose-500/40' : 'bg-slate-950/70 border-slate-800'
              }`}>
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-slate-400 font-bold uppercase">Rack B-1</span>
                  {rackB1Failed && <span className="text-rose-400 font-bold">SWITCH DOWN</span>}
                </div>
                <div className={`p-1.5 rounded flex items-center justify-between text-[11px] ${
                  rackB1Failed ? 'text-rose-400 line-through' : 'bg-slate-900 text-slate-200'
                }`}>
                  <span className="flex items-center gap-1">
                    <Server className="w-3 h-3 text-cyan-400" /> VM Node 3
                  </span>
                  <span className="text-[9px] font-mono">{rackB1Failed ? 'SEVERED' : '2 Pods'}</span>
                </div>
              </div>

              {/* Rack B-2 */}
              <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800 flex flex-col gap-1.5">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Rack B-2</span>
                <div className="p-1.5 rounded flex items-center justify-between text-[11px] bg-slate-900 text-slate-200">
                  <span className="flex items-center gap-1">
                    <Server className="w-3 h-3 text-cyan-400" /> VM Node 4
                  </span>
                  <span className="text-[9px] font-mono">2 Pods</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Disaster Injection Controls */}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <AlertOctagon className="w-4 h-4 text-rose-400" />
          Chaos Engineering: Inject Physical Fault Domain Failures
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <button
            onClick={() => setAzAFailed((prev) => !prev)}
            className={`flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl font-medium text-xs transition cursor-pointer active:scale-95 border ${
              azAFailed ? 'bg-rose-600 text-white border-rose-500' : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-800'
            }`}
          >
            <Flame className="w-4 h-4 text-rose-400" />
            <span>{azAFailed ? 'Restore AZ-A Power' : 'Cut Power to AZ-A'}</span>
          </button>

          <button
            onClick={() => setRackB1Failed((prev) => !prev)}
            className={`flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl font-medium text-xs transition cursor-pointer active:scale-95 border ${
              rackB1Failed ? 'bg-rose-600 text-white border-rose-500' : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-800'
            }`}
          >
            <Zap className="w-4 h-4 text-amber-400" />
            <span>{rackB1Failed ? 'Fix Rack B-1 Switch' : 'Blow Rack B-1 Switch'}</span>
          </button>

          <button
            onClick={() => setVmAFailed((prev) => !prev)}
            className={`flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl font-medium text-xs transition cursor-pointer active:scale-95 border ${
              vmAFailed ? 'bg-rose-600 text-white border-rose-500' : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-800'
            }`}
          >
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span>{vmAFailed ? 'Reboot VM Node 1' : 'Crash VM Node 1'}</span>
          </button>

          <button
            onClick={handleResetDisasters}
            className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs border border-slate-700 transition cursor-pointer active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Restore All Infrastructure</span>
          </button>
        </div>
      </div>
    </div>
  );
};
