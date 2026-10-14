import React from 'react';
import { 
  BookOpen, 
  ShieldCheck, 
  Layers, 
  Network, 
  Clock 
} from 'lucide-react';

export const CheatSheetView: React.FC = () => {
  const availabilityTable = [
    { nines: '99% (Two 9s)', downtimeYear: '3.65 days', downtimeMonth: '7.2 hours', typicalTarget: 'Internal batch tools' },
    { nines: '99.9% (Three 9s)', downtimeYear: '8.76 hours', downtimeMonth: '43.2 minutes', typicalTarget: 'Standard SaaS APIs' },
    { nines: '99.99% (Four 9s)', downtimeYear: '52.6 minutes', downtimeMonth: '4.32 minutes', typicalTarget: 'Tier-1 Production Services' },
    { nines: '99.999% (Five 9s)', downtimeYear: '5.26 minutes', downtimeMonth: '25.9 seconds', typicalTarget: 'Financial/Core Telecom Infrastructure' },
  ];

  const httpCodes = [
    { code: '301 Moved Permanently', use: 'Redirect permanently cached by browser. Bypasses your servers on repeat visits (saves compute, loses analytics).' },
    { code: '302 Found (Temporary)', use: 'Redirect not cached. Forces every client click to hit your server (accurate click analytics, higher server load).' },
    { code: '400 Bad Request', use: 'Client sent invalid payload or schema validation failed.' },
    { code: '401 vs 403', use: '401 Unauthorized (Not logged in / Invalid token) vs 403 Forbidden (Logged in, but lacks permission to resource).' },
    { code: '429 Too Many Requests', use: 'Rate limit exceeded. Always include `Retry-After: <seconds>` header.' },
    { code: '502 Bad Gateway', use: 'Reverse proxy / Load Balancer cannot reach downstream backend server.' },
    { code: '503 Service Unavailable', use: 'Server temporarily overloaded or in maintenance; client should retry with backoff.' },
    { code: '504 Gateway Timeout', use: 'Downstream microservice or database query took longer than proxy timeout.' },
  ];

  return (
    <div className="space-y-6 animate-fadeIn select-none">
      {/* Header */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex items-start gap-3">
        <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shrink-0">
          <BookOpen className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base font-bold text-white">System Design Quick Reference Cheat Sheet</h3>
          <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
            Essential tables, SLA downtime math, and protocols to review right before your interview.
          </p>
        </div>
      </div>

      {/* Grid: SLAs & HTTP Codes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Availability "Nines" Table */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>High Availability SLA "Nines" Table</span>
          </h4>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
                <tr>
                  <th className="p-2.5">SLA Tier</th>
                  <th className="p-2.5">Downtime / Year</th>
                  <th className="p-2.5">Target Systems</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 font-mono">
                {availabilityTable.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/30 text-slate-300">
                    <td className="p-2.5 font-bold text-indigo-400">{row.nines}</td>
                    <td className="p-2.5 text-rose-300">{row.downtimeYear}</td>
                    <td className="p-2.5 font-sans text-slate-400 text-[11px]">{row.typicalTarget}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* HTTP Codes */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
            <Network className="w-4 h-4" />
            <span>Critical HTTP Status Codes in System Design</span>
          </h4>

          <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
            {httpCodes.map((item, idx) => (
              <div key={idx} className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs">
                <span className="font-mono font-bold text-amber-300 block mb-0.5">{item.code}</span>
                <span className="text-slate-400 text-[11px] leading-relaxed">{item.use}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CAP & PACELC Core Principles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" />
            <span>The CAP Theorem in Reality</span>
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            In any distributed system across a physical network, network partitions (P) are unavoidable due to fiber cuts, switch failures, or server crashes. Thus, you do not choose between C, A, and P; you choose between:
          </p>
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-xs font-bold text-emerald-400 block mb-1">CP (Consistency)</span>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Rejects writes or returns errors if nodes cannot guarantee agreement. (MongoDB, HBase, Zookeeper).
              </p>
            </div>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-xs font-bold text-cyan-400 block mb-1">AP (Availability)</span>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Accepts writes on any reachable node; reconciles eventual consistency later. (Cassandra, DynamoDB).
              </p>
            </div>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-2">
            <Layers className="w-4 h-4" />
            <span>The PACELC Extension</span>
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            Partitions are rare. What about when the network is normal? PACELC answers:
          </p>
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 space-y-2">
            <div>
              <span className="text-indigo-400 font-bold">If Partition (P):</span> Trade off <strong className="text-white">Availability (A)</strong> vs <strong className="text-white">Consistency (C)</strong>.
            </div>
            <div className="pt-1 border-t border-slate-800">
              <span className="text-cyan-400 font-bold">Else (E):</span> Trade off <strong className="text-white">Latency (L)</strong> vs <strong className="text-white">Consistency (C)</strong>.
            </div>
          </div>
          <p className="text-[11px] text-slate-400">
            Example: Cassandra is <strong>PA/EL</strong> (Availability & Latency prioritized). PostgreSQL is <strong>PC/EC</strong> (Consistency prioritized in all modes).
          </p>
        </div>
      </div>
    </div>
  );
};
