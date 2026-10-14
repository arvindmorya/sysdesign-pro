import React, { useState } from 'react';
import type { CaseStudy } from '../../types/interview';
import { CheckCircle2, Circle, HelpCircle, Sparkles } from 'lucide-react';

interface PhaseRequirementsProps {
  caseStudy: CaseStudy;
  onCompletePhase: () => void;
}

export const PhaseRequirements: React.FC<PhaseRequirementsProps> = ({
  caseStudy,
  onCompletePhase,
}) => {
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());

  const toggleCheck = (id: string) => {
    const next = new Set(checkedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setCheckedIds(next);
  };

  const functional = caseStudy.requirements.filter((r) => r.category === 'functional');
  const nonFunctional = caseStudy.requirements.filter((r) => r.category === 'non-functional');
  const outOfScope = caseStudy.requirements.filter((r) => r.category === 'out-of-scope');

  const allCount = caseStudy.requirements.length;
  const completedCount = checkedIds.size;
  const progressPercent = Math.round((completedCount / allCount) * 100);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Introduction Banner */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">Step 1: Scoping & Requirements Clarification</h3>
            <p className="text-sm text-slate-400 mt-1 leading-relaxed">
              Never start drawing architecture immediately! Top interviewers evaluate how well you clarify ambiguous problem statements, define system scope, and establish non-functional SLAs. Tap each requirement to verify you understand its trade-off.
            </p>
          </div>
        </div>

        {/* Progress meter */}
        <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex justify-between text-xs text-slate-400 mb-1.5 font-medium">
              <span>Clarified Requirements</span>
              <span>{completedCount} of {allCount} items ({progressPercent}%)</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-indigo-500 to-cyan-400 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Grid of 3 categories */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Functional Requirements */}
        <div className="bg-slate-900/60 border border-slate-800/90 rounded-2xl p-4 flex flex-col h-full">
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-800">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
            <h4 className="font-semibold text-sm text-slate-200">Functional Requirements</h4>
            <span className="text-[11px] text-slate-500 ml-auto">({functional.length})</span>
          </div>
          <div className="space-y-3 flex-1">
            {functional.map((item) => {
              const isChecked = checkedIds.has(item.id);
              return (
                <div
                  key={item.id}
                  onClick={() => toggleCheck(item.id)}
                  className={`p-3 rounded-xl border transition-all duration-150 cursor-pointer select-none active:scale-[0.98] ${
                    isChecked
                      ? 'bg-emerald-950/20 border-emerald-600/40 text-slate-200'
                      : 'bg-slate-800/40 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    {isChecked ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <Circle className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className="text-xs font-medium leading-snug">{item.text}</p>
                      <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">{item.explanation}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Non-Functional Requirements */}
        <div className="bg-slate-900/60 border border-slate-800/90 rounded-2xl p-4 flex flex-col h-full">
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-800">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
            <h4 className="font-semibold text-sm text-slate-200">Non-Functional SLAs</h4>
            <span className="text-[11px] text-slate-500 ml-auto">({nonFunctional.length})</span>
          </div>
          <div className="space-y-3 flex-1">
            {nonFunctional.map((item) => {
              const isChecked = checkedIds.has(item.id);
              return (
                <div
                  key={item.id}
                  onClick={() => toggleCheck(item.id)}
                  className={`p-3 rounded-xl border transition-all duration-150 cursor-pointer select-none active:scale-[0.98] ${
                    isChecked
                      ? 'bg-cyan-950/20 border-cyan-600/40 text-slate-200'
                      : 'bg-slate-800/40 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    {isChecked ? (
                      <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    ) : (
                      <Circle className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className="text-xs font-medium leading-snug">{item.text}</p>
                      <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">{item.explanation}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Out of Scope Items */}
        <div className="bg-slate-900/60 border border-slate-800/90 rounded-2xl p-4 flex flex-col h-full">
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-800">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
            <h4 className="font-semibold text-sm text-slate-200">Out of Scope (Explicit)</h4>
            <span className="text-[11px] text-slate-500 ml-auto">({outOfScope.length})</span>
          </div>
          <div className="space-y-3 flex-1">
            {outOfScope.map((item) => {
              const isChecked = checkedIds.has(item.id);
              return (
                <div
                  key={item.id}
                  onClick={() => toggleCheck(item.id)}
                  className={`p-3 rounded-xl border transition-all duration-150 cursor-pointer select-none active:scale-[0.98] ${
                    isChecked
                      ? 'bg-amber-950/20 border-amber-600/40 text-slate-200'
                      : 'bg-slate-800/40 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    {isChecked ? (
                      <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    ) : (
                      <Circle className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className="text-xs font-medium leading-snug">{item.text}</p>
                      <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">{item.explanation}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Interviewer Tip Callout */}
      <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-800/40 flex items-start gap-3">
        <HelpCircle className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-300 leading-relaxed">
          <span className="font-semibold text-indigo-300">Staff Engineer Tip: </span>
          In real interviews, proactively proposing 1 or 2 out-of-scope features demonstrates seniority. It shows you understand project boundaries and prevents getting distracted by peripheral complexity (e.g. analytics dashboards, fraud ML) before solving the core distributed bottleneck.
        </div>
      </div>

      {/* Next Step Action */}
      <div className="flex justify-end pt-2">
        <button
          onClick={onCompletePhase}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-medium text-sm shadow-lg shadow-indigo-500/25 transition-all duration-200 active:scale-95 cursor-pointer flex items-center gap-2"
        >
          <span>Continue to Step 2: Back-of-the-Envelope Math</span>
          <span className="text-lg">→</span>
        </button>
      </div>
    </div>
  );
};
