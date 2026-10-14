import React, { useState } from 'react';
import type { CaseStudy, ArchitectureComponent } from '../../types/interview';
import { 
  Network, 
  Server, 
  Database, 
  Layers, 
  Radio, 
  ArrowRight, 
  Table, 
  Code,
  Info
} from 'lucide-react';

interface PhaseArchitectureProps {
  caseStudy: CaseStudy;
  onCompletePhase: () => void;
  onPrevPhase: () => void;
}

export const PhaseArchitecture: React.FC<PhaseArchitectureProps> = ({
  caseStudy,
  onCompletePhase,
  onPrevPhase,
}) => {
  const [selectedComp, setSelectedComp] = useState<ArchitectureComponent | null>(
    caseStudy.architecture.components[0] || null
  );
  const [activeSubTab, setActiveSubTab] = useState<'diagram' | 'api' | 'schema'>('diagram');

  const getComponentIcon = (type: ArchitectureComponent['type']) => {
    switch (type) {
      case 'client':
        return <Radio className="w-4 h-4 text-cyan-400" />;
      case 'gateway':
      case 'lb':
        return <Network className="w-4 h-4 text-amber-400" />;
      case 'service':
      case 'worker':
        return <Server className="w-4 h-4 text-indigo-400" />;
      case 'cache':
        return <Layers className="w-4 h-4 text-pink-400" />;
      case 'database':
      case 'storage':
      case 'queue':
        return <Database className="w-4 h-4 text-emerald-400" />;
      default:
        return <Server className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Intro Header */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold text-white">Step 3: High-Level System Architecture & Contracts</h3>
            <p className="text-sm text-slate-400 mt-1">
              Assemble the core pipeline, define API endpoint contracts, and establish database schema models.
            </p>
          </div>

          {/* Sub-tabs switch */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 self-start md:self-auto">
            <button
              onClick={() => setActiveSubTab('diagram')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                activeSubTab === 'diagram' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Network className="w-3.5 h-3.5" />
              <span>Pipeline Diagram</span>
            </button>
            <button
              onClick={() => setActiveSubTab('api')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                activeSubTab === 'api' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              <span>API Contracts</span>
            </button>
            <button
              onClick={() => setActiveSubTab('schema')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                activeSubTab === 'schema' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span>Data Models</span>
            </button>
          </div>
        </div>
      </div>

      {/* Subtab 1: Pipeline Diagram */}
      {activeSubTab === 'diagram' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Visual Component List */}
          <div className="lg:col-span-2 space-y-3">
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                <Network className="w-3.5 h-3.5 text-indigo-400" />
                <span>Architecture Blocks (Tap to inspect)</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {caseStudy.architecture.components.map((comp) => {
                  const isSelected = selectedComp?.id === comp.id;
                  return (
                    <div
                      key={comp.id}
                      onClick={() => setSelectedComp(comp)}
                      className={`p-3 rounded-xl border transition-all duration-150 cursor-pointer text-left active:scale-[0.98] ${
                        isSelected
                          ? 'bg-indigo-950/40 border-indigo-500 shadow-md ring-1 ring-indigo-500/50'
                          : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-lg bg-slate-800 border border-slate-700">
                          {getComponentIcon(comp.type)}
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-white truncate">{comp.name}</div>
                          <div className="text-[10px] text-slate-400 truncate uppercase tracking-wider mt-0.5">
                            {comp.type}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step by Step Execution Flow */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
                <span>End-to-End Request Flow Sequence</span>
              </h4>
              <div className="space-y-2">
                {caseStudy.architecture.summaryFlow.map((flow, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-950/40 border border-slate-800/80 text-xs text-slate-300"
                  >
                    <span className="w-5 h-5 rounded-full bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                      {index + 1}
                    </span>
                    <span className="leading-relaxed">{flow}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Component Details Inspector Panel */}
          <div className="lg:col-span-1">
            {selectedComp ? (
              <div className="bg-gradient-to-b from-slate-900 to-slate-900/80 border border-indigo-500/40 rounded-2xl p-5 sticky top-20 shadow-xl">
                <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
                  <div className="p-2.5 rounded-xl bg-indigo-500/20 border border-indigo-500/30">
                    {getComponentIcon(selectedComp.type)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{selectedComp.name}</h4>
                    <span className="text-[10px] font-semibold text-indigo-400 uppercase tracking-wider">
                      Type: {selectedComp.type}
                    </span>
                  </div>
                </div>

                <div className="mt-4">
                  <span className="text-xs font-semibold text-slate-300 block mb-1">Architecture Responsibility:</span>
                  <p className="text-xs text-slate-400 leading-relaxed bg-slate-950/50 p-3 rounded-xl border border-slate-800">
                    {selectedComp.role}
                  </p>
                </div>

                <div className="mt-4">
                  <span className="text-xs font-semibold text-slate-300 block mb-2">Key Implementation Details:</span>
                  <ul className="space-y-2">
                    {selectedComp.details.map((detail, idx) => (
                      <li key={idx} className="text-xs text-slate-300 flex items-start gap-2 bg-slate-800/30 p-2 rounded-lg">
                        <span className="text-cyan-400 font-bold">•</span>
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="bg-slate-900/40 border border-slate-800 border-dashed rounded-2xl p-8 text-center text-xs text-slate-500">
                Select a component to inspect its architecture details.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Subtab 2: API Endpoints Contract */}
      {activeSubTab === 'api' && (
        <div className="space-y-4">
          {caseStudy.apiEndpoints.map((endpoint, idx) => (
            <div key={idx} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 overflow-hidden">
              <div className="flex items-center gap-3 flex-wrap">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                  endpoint.method === 'GET'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : endpoint.method === 'POST'
                    ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                }`}>
                  {endpoint.method}
                </span>
                <span className="font-mono text-sm font-semibold text-white">{endpoint.path}</span>
                <span className="text-xs text-slate-400 ml-auto">{endpoint.description}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 pt-3 border-t border-slate-800/80">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Request Parameters / Body:
                  </span>
                  <pre className="font-mono text-xs text-cyan-300 whitespace-pre-wrap">{endpoint.params}</pre>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Response Payload:
                  </span>
                  <pre className="font-mono text-xs text-emerald-300 whitespace-pre-wrap">{endpoint.response}</pre>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Subtab 3: Schema & Data Model */}
      {activeSubTab === 'schema' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {caseStudy.dataModel.map((model, idx) => (
            <div key={idx} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Table className="w-4 h-4 text-cyan-400" />
                    <span className="font-mono text-sm font-bold text-white">{model.table}</span>
                  </div>
                  <span className="text-[11px] text-indigo-400 font-medium bg-indigo-950/40 px-2 py-0.5 rounded border border-indigo-800/40">
                    {model.dbType}
                  </span>
                </div>

                <div className="mt-3">
                  <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider block mb-2">Columns & Data Types</span>
                  <div className="space-y-1.5 font-mono text-xs text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800">
                    {model.columns.map((col, cIdx) => (
                      <div key={cIdx} className="flex items-center gap-2">
                        <span className="text-slate-600">›</span>
                        <span>{col}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 text-xs text-slate-400">
                <span className="font-semibold text-slate-300 flex items-center gap-1 mb-1">
                  <Info className="w-3.5 h-3.5 text-amber-400" />
                  Indexing & Sharding Strategy:
                </span>
                <p className="leading-relaxed bg-amber-950/20 p-2.5 rounded-lg border border-amber-800/30 text-slate-300">
                  {model.indexingStrategy}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Phase Navigation */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={onPrevPhase}
          className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs border border-slate-700 transition cursor-pointer"
        >
          ← Back to Math
        </button>

        <button
          onClick={onCompletePhase}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-medium text-sm shadow-lg shadow-indigo-500/25 transition cursor-pointer active:scale-95 flex items-center gap-2"
        >
          <span>Continue to Step 4: Deep Dive & Bottlenecks</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
