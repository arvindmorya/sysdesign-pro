import React, { useState } from 'react';
import { CASE_STUDIES } from '../../data/caseStudies';
import type { CaseStudy } from '../../types/interview';
import { PhaseRequirements } from './PhaseRequirements';
import { PhaseMath } from './PhaseMath';
import { PhaseArchitecture } from './PhaseArchitecture';
import { PhaseDeepDive } from './PhaseDeepDive';
import { 
  CheckCircle2, 
  Sparkles, 
  Layers, 
  ShieldCheck, 
  Flame 
} from 'lucide-react';

interface InterviewSimulatorProps {
  completedCases: string[];
  onToggleCompleteCase: (caseId: string) => void;
}

export const InterviewSimulator: React.FC<InterviewSimulatorProps> = ({
  completedCases,
  onToggleCompleteCase,
}) => {
  const [selectedCaseId, setSelectedCaseId] = useState<string>(CASE_STUDIES[0].id);
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  const activeCase = CASE_STUDIES.find((c) => c.id === selectedCaseId) || CASE_STUDIES[0];
  const isCompleted = completedCases.includes(activeCase.id);

  const handleSelectCase = (caseItem: CaseStudy) => {
    setSelectedCaseId(caseItem.id);
    setCurrentStep(1);
  };

  const steps = [
    { num: 1, label: '1. Scoping', icon: <ShieldCheck className="w-3.5 h-3.5" /> },
    { num: 2, label: '2. Math & Scale', icon: <Layers className="w-3.5 h-3.5" /> },
    { num: 3, label: '3. Architecture', icon: <Sparkles className="w-3.5 h-3.5" /> },
    { num: 4, label: '4. Deep Dive', icon: <Flame className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="space-y-6">
      {/* Case Study Selection Pills (Touch-scrollable on iPad / Mobile) */}
      <div className="bg-slate-900/60 border border-slate-800/80 p-3 rounded-2xl">
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 px-1 flex items-center justify-between">
          <span>Select Interview Case Study</span>
          <span className="text-slate-500 font-normal">
            Completed: {completedCases.length} of {CASE_STUDIES.length}
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {CASE_STUDIES.map((c) => {
            const isCurrent = c.id === activeCase.id;
            const done = completedCases.includes(c.id);

            return (
              <button
                key={c.id}
                onClick={() => handleSelectCase(c)}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-medium whitespace-nowrap transition cursor-pointer active:scale-95 border ${
                  isCurrent
                    ? 'bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-600/30'
                    : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                {done ? (
                  <CheckCircle2 className={`w-3.5 h-3.5 ${isCurrent ? 'text-white' : 'text-emerald-400'}`} />
                ) : (
                  <span className={`w-2 h-2 rounded-full ${isCurrent ? 'bg-white' : 'bg-slate-600'}`} />
                )}
                <span>{c.title.replace('Design ', '')}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                  c.difficulty === 'Beginner'
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : c.difficulty === 'Intermediate'
                    ? 'bg-amber-500/20 text-amber-300'
                    : 'bg-rose-500/20 text-rose-300'
                }`}>
                  {c.difficulty}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Case Header & Step Tracker */}
      <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-950/50 px-2 py-0.5 rounded border border-indigo-800/40">
                {activeCase.category}
              </span>
              <span className="text-[11px] font-medium text-slate-400">
                Difficulty: <strong className="text-slate-200">{activeCase.difficulty}</strong>
              </span>
              {isCompleted && (
                <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Mastered</span>
                </span>
              )}
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">{activeCase.title}</h2>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">{activeCase.summary}</p>
          </div>

          {/* 4-Step Interactive Stepper Bar */}
          <div className="flex items-center gap-1 bg-slate-950 p-1.5 rounded-xl border border-slate-800 self-start lg:self-auto overflow-x-auto max-w-full">
            {steps.map((step) => {
              const isActive = currentStep === step.num;
              const isPast = currentStep > step.num;

              return (
                <button
                  key={step.num}
                  onClick={() => setCurrentStep(step.num as 1 | 2 | 3 | 4)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow'
                      : isPast
                      ? 'text-emerald-400 bg-emerald-950/30 border border-emerald-800/40'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  {isPast ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : step.icon}
                  <span>{step.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Render Active Phase Step */}
      <div className="transition-all duration-200">
        {currentStep === 1 && (
          <PhaseRequirements
            caseStudy={activeCase}
            onCompletePhase={() => setCurrentStep(2)}
          />
        )}
        {currentStep === 2 && (
          <PhaseMath
            caseStudy={activeCase}
            onCompletePhase={() => setCurrentStep(3)}
            onPrevPhase={() => setCurrentStep(1)}
          />
        )}
        {currentStep === 3 && (
          <PhaseArchitecture
            caseStudy={activeCase}
            onCompletePhase={() => setCurrentStep(4)}
            onPrevPhase={() => setCurrentStep(2)}
          />
        )}
        {currentStep === 4 && (
          <PhaseDeepDive
            caseStudy={activeCase}
            onFinishCase={() => onToggleCompleteCase(activeCase.id)}
            onPrevPhase={() => setCurrentStep(3)}
            isAlreadyCompleted={isCompleted}
          />
        )}
      </div>
    </div>
  );
};
