import React, { useState } from 'react';
import { TRADEOFF_SCENARIOS } from '../../data/tradeoffs';
import { 
  Scale, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Table, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { fireSuccessConfetti } from '../../utils/confetti';

export const TradeOffArena: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'challenges' | 'matrices'>('challenges');
  const [scenarioIdx, setScenarioIdx] = useState<number>(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);

  const scenario = TRADEOFF_SCENARIOS[scenarioIdx];
  const selectedOption = scenario.options.find((o) => o.id === selectedOptionId);

  const handleSelectOption = (optId: string) => {
    setSelectedOptionId(optId);
    const chosen = scenario.options.find((o) => o.id === optId);
    if (chosen?.verdict === 'Recommended') {
      fireSuccessConfetti();
    }
  };

  const handleNextScenario = () => {
    setSelectedOptionId(null);
    setScenarioIdx((prev) => (prev + 1) % TRADEOFF_SCENARIOS.length);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Subtabs */}
      <div className="bg-slate-900/80 border border-slate-800 p-2 rounded-2xl flex items-center gap-2">
        <button
          onClick={() => setActiveTab('challenges')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
            activeTab === 'challenges' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Scale className="w-3.5 h-3.5" />
          <span>Architectural Dilemma Challenges</span>
        </button>
        <button
          onClick={() => setActiveTab('matrices')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
            activeTab === 'matrices' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Table className="w-3.5 h-3.5" />
          <span>Direct Comparison Matrices</span>
        </button>
      </div>

      {/* Tab 1: Dilemma Challenges */}
      {activeTab === 'challenges' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 bg-indigo-950/60 px-2.5 py-1 rounded border border-indigo-800/40">
              Scenario {scenarioIdx + 1} of {TRADEOFF_SCENARIOS.length}
            </span>
            <span className="text-xs text-slate-400">Choose Your Weapon: Evaluate Architectural Fit</span>
          </div>

          <div>
            <h3 className="text-lg font-bold text-white">{scenario.title}</h3>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed bg-slate-950 p-4 rounded-xl border border-slate-800">
              {scenario.context}
            </p>

            <div className="mt-4 flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-slate-400">Non-negotiables:</span>
              {scenario.requirements.map((req, rIdx) => (
                <span
                  key={rIdx}
                  className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-slate-800 text-cyan-300 border border-slate-700"
                >
                  ✓ {req}
                </span>
              ))}
            </div>
          </div>

          {/* Options */}
          <div className="space-y-3 pt-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              Which architecture would you recommend in an interview?
            </span>

            {scenario.options.map((opt) => {
              const isSelected = selectedOptionId === opt.id;
              return (
                <div
                  key={opt.id}
                  onClick={() => handleSelectOption(opt.id)}
                  className={`p-4 rounded-xl border transition cursor-pointer select-none active:scale-[0.99] ${
                    isSelected
                      ? 'bg-indigo-950/40 border-indigo-500 shadow-md ring-1 ring-indigo-500/50'
                      : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="text-xs font-bold text-white">{opt.name}</h4>
                      <span className="text-[11px] text-slate-400 font-mono mt-0.5 block">
                        Category: {opt.architectureType}
                      </span>
                    </div>

                    {isSelected && (
                      <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full shrink-0 flex items-center gap-1 ${
                        opt.verdict === 'Recommended'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : opt.verdict === 'Anti-Pattern'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        {opt.verdict === 'Recommended' && <CheckCircle2 className="w-3 h-3" />}
                        {opt.verdict === 'Anti-Pattern' && <XCircle className="w-3 h-3" />}
                        {opt.verdict === 'Acceptable with trade-offs' && <AlertTriangle className="w-3 h-3" />}
                        <span>{opt.verdict}</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Detailed Rationale for Selected Option */}
          {selectedOption && (
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4 animate-fadeIn">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                  Architectural Evaluation & Trade-offs
                </h4>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                {selectedOption.explanation}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                {/* Pros */}
                <div className="bg-emerald-950/20 border border-emerald-800/30 p-3 rounded-xl">
                  <span className="text-xs font-bold text-emerald-400 block mb-2">Advantages:</span>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {selectedOption.pros.map((pro, pIdx) => (
                      <li key={pIdx} className="flex items-start gap-1.5">
                        <span className="text-emerald-400 font-bold">+</span>
                        <span>{pro}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Cons */}
                <div className="bg-rose-950/20 border border-rose-800/30 p-3 rounded-xl">
                  <span className="text-xs font-bold text-rose-400 block mb-2">Trade-offs & Risks:</span>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {selectedOption.cons.map((con, cIdx) => (
                      <li key={cIdx} className="flex items-start gap-1.5">
                        <span className="text-rose-400 font-bold">-</span>
                        <span>{con}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={handleNextScenario}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition cursor-pointer active:scale-95 flex items-center gap-2"
                >
                  <span>Next Dilemma</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Direct Comparison Matrices */}
      {activeTab === 'matrices' && (
        <div className="space-y-6">
          {/* Matrix 1: SQL vs NoSQL */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
            <h4 className="text-sm font-bold text-white mb-3">Relational (SQL) vs Distributed NoSQL</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
                  <tr>
                    <th className="p-3">Attribute</th>
                    <th className="p-3 text-indigo-400">Relational (Postgres, MySQL)</th>
                    <th className="p-3 text-cyan-400">NoSQL (Cassandra, DynamoDB, MongoDB)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 text-slate-300">
                  <tr>
                    <td className="p-3 font-semibold text-slate-400">Data Model</td>
                    <td className="p-3">Normalized tables with joins and foreign keys</td>
                    <td className="p-3">Denormalized Key-Value, Document, or Column Families</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-400">ACID Transactions</td>
                    <td className="p-3 text-emerald-400 font-medium">Full multi-row ACID support</td>
                    <td className="p-3 text-amber-400 font-medium">Single-item transactions; Eventual consistency</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-400">Horizontal Scaling</td>
                    <td className="p-3">Harder (requires sharding, Vitess, CockroachDB)</td>
                    <td className="p-3 text-emerald-400 font-medium">Native automatic partitioning & consistent hashing</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-400">Optimal Use Case</td>
                    <td className="p-3">Financial ledgers, auth, complex relations</td>
                    <td className="p-3">Time-series, IoT, user feeds, shopping carts</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Matrix 2: Kafka vs RabbitMQ */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
            <h4 className="text-sm font-bold text-white mb-3">Apache Kafka vs RabbitMQ vs AWS SQS</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
                  <tr>
                    <th className="p-3">Capability</th>
                    <th className="p-3 text-indigo-400">Apache Kafka</th>
                    <th className="p-3 text-cyan-400">RabbitMQ</th>
                    <th className="p-3 text-amber-400">AWS SQS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 text-slate-300">
                  <tr>
                    <td className="p-3 font-semibold text-slate-400">Architecture Model</td>
                    <td className="p-3">Distributed append-only commit log</td>
                    <td className="p-3">Smart broker / Dumb consumer message queue</td>
                    <td className="p-3">Fully managed cloud pull-based queue</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-400">Message Replayability</td>
                    <td className="p-3 text-emerald-400 font-bold">Yes (re-seek past offsets)</td>
                    <td className="p-3 text-rose-400">No (deleted on ACK)</td>
                    <td className="p-3 text-rose-400">No (deleted upon completion)</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-400">Throughput</td>
                    <td className="p-3 text-emerald-400 font-bold">1M+ msg/sec per cluster</td>
                    <td className="p-3">20k - 50k msg/sec</td>
                    <td className="p-3">Elastic auto-scaling</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-400">Best Suited For</td>
                    <td className="p-3">Event streaming, telemetry, CDC replication</td>
                    <td className="p-3">Complex routing, priority task workers</td>
                    <td className="p-3">Simple asynchronous serverless workers</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
