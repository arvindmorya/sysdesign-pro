import React from 'react';
import type { TabType } from '../../types/interview';
import { 
  Layers, 
  Calculator, 
  Scale, 
  BrainCircuit, 
  BookOpen, 
  Terminal,
  Compass,
  Boxes
} from 'lucide-react';

interface HeaderProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  completedCasesCount: number;
  totalCasesCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  completedCasesCount,
  totalCasesCount,
}) => {
  const tabs: { id: TabType; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'interview', label: 'Interview Simulator', icon: <Compass className="w-4 h-4" />, badge: `${completedCasesCount}/${totalCasesCount}` },
    { id: 'cloudlab', label: 'Cloud Arch Lab', icon: <Boxes className="w-4 h-4 text-cyan-400" />, badge: '6 Sims' },
    { id: 'canvas', label: 'Arch Canvas', icon: <Layers className="w-4 h-4" /> },
    { id: 'math', label: 'Math Arena', icon: <Calculator className="w-4 h-4" /> },
    { id: 'tradeoffs', label: 'Trade-Offs', icon: <Scale className="w-4 h-4" /> },
    { id: 'flashcards', label: 'Flashcards', icon: <BrainCircuit className="w-4 h-4" /> },
    { id: 'cheatsheet', label: 'Cheat Sheet', icon: <BookOpen className="w-4 h-4" /> }
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#0c101c]/95 backdrop-blur-md border-b border-slate-800/80 px-4 py-3 select-none">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Logo & Brand */}
        <div className="flex items-center justify-between w-full md:w-auto">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-cyan-400 p-0.5 shadow-lg shadow-indigo-500/20 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Terminal className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-white tracking-tight">SysDesign</span>
                <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  Interactive PRO
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">Master Architecture & Interview Trade-Offs</p>
            </div>
          </div>

          {/* iPad / Tablet Quick Stats */}
          <div className="flex items-center gap-2 text-xs text-slate-400 md:hidden">
            <span className="px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700/60 text-slate-300">
              Cases: <span className="text-cyan-400 font-semibold">{completedCasesCount}/{totalCasesCount}</span>
            </span>
          </div>
        </div>

        {/* Tab Navigation - Touch friendly scroll on iPad / mobile */}
        <nav className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 md:pb-0 scrollbar-none">
          {tabs.map((tab) => {
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs md:text-sm font-medium whitespace-nowrap transition-all duration-200 active:scale-95 touch-manipulation cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/25 ring-1 ring-white/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
