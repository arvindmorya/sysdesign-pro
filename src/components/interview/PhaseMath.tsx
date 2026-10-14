import React, { useState } from 'react';
import type { CaseStudy } from '../../types/interview';
import { Calculator, HardDrive, Cpu, Zap, ArrowRight, Eye, CheckCircle2 } from 'lucide-react';

interface PhaseMathProps {
  caseStudy: CaseStudy;
  onCompletePhase: () => void;
  onPrevPhase: () => void;
}

export const PhaseMath: React.FC<PhaseMathProps> = ({
  caseStudy,
  onCompletePhase,
  onPrevPhase,
}) => {
  const [revealed, setRevealed] = useState(false);
  const math = caseStudy.math;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Intro Box */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shrink-0">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Step 2: Back-of-the-Envelope Capacity Estimations</h3>
              <p className="text-sm text-slate-400 mt-1 leading-relaxed">
                Estimate Read/Write QPS, storage growth, and memory caching needs. These numbers dictate your database partitioning, caching strategy, and cluster size.
              </p>
            </div>
          </div>

          <button
            onClick={() => setRevealed(!revealed)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition cursor-pointer active:scale-95"
          >
            <Eye className="w-4 h-4 text-cyan-400" />
            <span>{revealed ? 'Hide Step Formulas' : 'Reveal Step Formulas'}</span>
          </button>
        </div>

        {/* Core Inputs Summary Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-800/80">
          <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-800">
            <span className="text-[11px] text-slate-400 font-medium block">Daily Active Users (DAU)</span>
            <span className="text-sm font-bold text-white mt-0.5 block">
              {(math.dau / 1_000_000).toLocaleString()} Million
            </span>
          </div>
          <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-800">
            <span className="text-[11px] text-slate-400 font-medium block">Read : Write Ratio</span>
            <span className="text-sm font-bold text-cyan-400 mt-0.5 block">{caseStudy.readWriteRatio}</span>
          </div>
          <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-800">
            <span className="text-[11px] text-slate-400 font-medium block">Writes / User / Day</span>
            <span className="text-sm font-bold text-white mt-0.5 block">{math.writesPerUserPerDay}</span>
          </div>
          <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-800">
            <span className="text-[11px] text-slate-400 font-medium block">Write Record Size</span>
            <span className="text-sm font-bold text-emerald-400 mt-0.5 block">{math.writePayloadBytes} Bytes</span>
          </div>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Read QPS */}
        <div className="bg-gradient-to-b from-slate-900/90 to-slate-900/40 border border-slate-800 p-4 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Read Throughput</span>
            <Zap className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-white">
              ~{math.expectedReadQPS.toLocaleString()}{' '}
              <span className="text-xs font-normal text-slate-400">QPS</span>
            </div>
            <div className="text-[11px] text-cyan-400 mt-1 font-medium">
              Peak: ~{(math.expectedReadQPS * 2).toLocaleString()} QPS (2x)
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Requires CDN edge caching and Redis read replicas.</p>
        </div>

        {/* Write QPS */}
        <div className="bg-gradient-to-b from-slate-900/90 to-slate-900/40 border border-slate-800 p-4 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Write Throughput</span>
            <Cpu className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-white">
              ~{math.expectedWriteQPS.toLocaleString()}{' '}
              <span className="text-xs font-normal text-slate-400">QPS</span>
            </div>
            <div className="text-[11px] text-indigo-400 mt-1 font-medium">
              Peak: ~{(math.expectedWriteQPS * 2).toLocaleString()} QPS (2x)
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Determines DB write sharding & message queue buffer.</p>
        </div>

        {/* Storage */}
        <div className="bg-gradient-to-b from-slate-900/90 to-slate-900/40 border border-slate-800 p-4 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Storage (5 Years)</span>
            <HardDrive className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-white">
              ~{(math.expectedYearlyStorageTB * 5).toFixed(1)}{' '}
              <span className="text-xs font-normal text-slate-400">TB</span>
            </div>
            <div className="text-[11px] text-emerald-400 mt-1 font-medium">
              ~{math.expectedDailyStorageGB} GB added per day
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Fits in standard distributed NoSQL or sharded relational cluster.</p>
        </div>

        {/* Memory Caching */}
        <div className="bg-gradient-to-b from-slate-900/90 to-slate-900/40 border border-slate-800 p-4 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Cache Memory (80/20)</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-white">
              ~{math.expectedCacheRAMGB}{' '}
              <span className="text-xs font-normal text-slate-400">GB RAM</span>
            </div>
            <div className="text-[11px] text-amber-400 mt-1 font-medium">
              20% daily hot data cached in Redis
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Can easily be hosted on 2-3 Redis cluster instances with replication.</p>
        </div>
      </div>

      {/* Step-by-Step Calculation Breakdown */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5">
        <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2 mb-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Derivation & Formulas for the Interview Whiteboard</span>
        </h4>
        <div className="space-y-2.5">
          {math.unitNotes.map((note, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 font-mono text-xs text-slate-300 flex items-start gap-2.5"
            >
              <span className="text-indigo-400 font-bold shrink-0">{idx + 1}.</span>
              <span className="leading-relaxed">{note}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Phase Navigation */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={onPrevPhase}
          className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs border border-slate-700 transition cursor-pointer"
        >
          ← Back to Scoping
        </button>

        <button
          onClick={onCompletePhase}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-medium text-sm shadow-lg shadow-indigo-500/25 transition cursor-pointer active:scale-95 flex items-center gap-2"
        >
          <span>Continue to Step 3: High-Level Architecture</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
