import React, { useState } from 'react';
import type { CaseStudy } from '../../types/interview';
import { 
  Flame, 
  HelpCircle, 
  CheckCircle, 
  AlertTriangle, 
  Trophy, 
  ChevronDown, 
  ChevronUp,
  Sparkles
} from 'lucide-react';
import { fireSuccessConfetti } from '../../utils/confetti';

interface PhaseDeepDiveProps {
  caseStudy: CaseStudy;
  onFinishCase: () => void;
  onPrevPhase: () => void;
  isAlreadyCompleted: boolean;
}

export const PhaseDeepDive: React.FC<PhaseDeepDiveProps> = ({
  caseStudy,
  onFinishCase,
  onPrevPhase,
  isAlreadyCompleted,
}) => {
  const [openIds, setOpenIds] = useState<Set<string>>(new Set([caseStudy.deepDives[0]?.id || '']));
  const [revealedHints, setRevealedHints] = useState<Set<string>>(new Set());
  const [masteredIds, setMasteredIds] = useState<Set<string>>(new Set());

  const toggleOpen = (id: string) => {
    const next = new Set(openIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setOpenIds(next);
  };

  const toggleHint = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = new Set(revealedHints);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setRevealedHints(next);
  };

  const toggleMastered = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = new Set(masteredIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setMasteredIds(next);
  };

  const handleFinish = () => {
    fireSuccessConfetti();
    onFinishCase();
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Intro Header */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">Step 4: Deep Dive, Bottlenecks & Chaos Scenarios</h3>
            <p className="text-sm text-slate-400 mt-1 leading-relaxed">
              In FAANG/Senior interviews, the top 20 minutes are spent diving into edge cases, distributed failure modes, hot keys, and fault tolerance. Tackle each challenge below.
            </p>
          </div>
        </div>
      </div>

      {/* Deep Dive Scenarios List */}
      <div className="space-y-4">
        {caseStudy.deepDives.map((scenario, index) => {
          const isOpen = openIds.has(scenario.id);
          const isHintShown = revealedHints.has(scenario.id);
          const isMastered = masteredIds.has(scenario.id);

          return (
            <div
              key={scenario.id}
              className={`border rounded-2xl transition-all duration-200 overflow-hidden ${
                isOpen ? 'bg-slate-900/90 border-slate-700 shadow-lg' : 'bg-slate-900/40 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              {/* Header / Question Accordion */}
              <div
                onClick={() => toggleOpen(scenario.id)}
                className="p-4 cursor-pointer select-none flex items-start justify-between gap-3"
              >
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    Q{index + 1}
                  </span>
                  <div>
                    <h4 className="text-sm font-semibold text-white leading-snug">{scenario.question}</h4>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={(e) => toggleHint(scenario.id, e)}
                        className="text-[11px] text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1 cursor-pointer"
                      >
                        <HelpCircle className="w-3 h-3" />
                        <span>{isHintShown ? 'Hide Hint' : 'Show Interviewer Hint'}</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={(e) => toggleMastered(scenario.id, e)}
                    className={`p-1.5 rounded-lg border text-xs font-medium transition cursor-pointer ${
                      isMastered
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                    }`}
                    title="Mark as understood"
                  >
                    <CheckCircle className="w-4 h-4" />
                  </button>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </div>
              </div>

              {/* Hint Box (Expandable) */}
              {isHintShown && (
                <div className="mx-4 mb-3 p-3 rounded-xl bg-cyan-950/30 border border-cyan-800/40 text-xs text-cyan-300 flex items-start gap-2">
                  <Sparkles className="w-4 h-4 shrink-0 mt-0.5 text-cyan-400" />
                  <div>
                    <span className="font-semibold text-cyan-200">Interviewer Hint: </span>
                    <span>{scenario.hint}</span>
                  </div>
                </div>
              )}

              {/* Expanded Answer Body */}
              {isOpen && (
                <div className="px-5 pb-5 pt-1 border-t border-slate-800/80 space-y-4">
                  {/* Detailed Explanation */}
                  <div className="mt-3">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">
                      Architectural Solution & Best Approach:
                    </span>
                    <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                      {scenario.answer}
                    </div>
                  </div>

                  {/* Best Practices */}
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 block mb-1.5">
                      Production Best Practices:
                    </span>
                    <ul className="space-y-1.5">
                      {scenario.bestPractices.map((practice, pIdx) => (
                        <li key={pIdx} className="text-xs text-slate-300 flex items-start gap-2 bg-emerald-950/20 border border-emerald-800/30 p-2 rounded-lg">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{practice}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Trade-off Warning */}
                  <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-800/40 text-xs text-amber-200 flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-amber-300">The Essential Trade-Off: </span>
                      <span className="text-slate-300">{scenario.keyTradeoff}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Completion Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-950/60 via-slate-900 to-slate-950 border border-indigo-800/40 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-400 text-white shadow-lg shadow-indigo-500/30">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-base font-bold text-white">Ready to Finish this Case Study?</h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Reviewing all 4 phases equips you with end-to-end mastery for this design problem.
            </p>
          </div>
        </div>

        <button
          onClick={handleFinish}
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-semibold text-sm shadow-lg shadow-emerald-600/30 transition-all duration-200 active:scale-95 cursor-pointer flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          <span>{isAlreadyCompleted ? 'Review & Re-complete Case' : 'Complete Case Study'}</span>
        </button>
      </div>

      {/* Prev button */}
      <div className="flex justify-start">
        <button
          onClick={onPrevPhase}
          className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs border border-slate-700 transition cursor-pointer"
        >
          ← Back to Architecture
        </button>
      </div>
    </div>
  );
};
