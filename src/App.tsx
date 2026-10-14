import { useState, useEffect } from 'react';
import type { TabType } from './types/interview';
import { CASE_STUDIES } from './data/caseStudies';
import { Header } from './components/navigation/Header';
import { InterviewSimulator } from './components/interview/InterviewSimulator';
import { ArchitectureCanvas } from './components/canvas/ArchitectureCanvas';
import { MathArena } from './components/math/MathArena';
import { TradeOffArena } from './components/tradeoffs/TradeOffArena';
import { FlashcardDeck } from './components/flashcards/FlashcardDeck';
import { CheatSheetView } from './components/cheatsheet/CheatSheetView';
import { CloudLabView } from './components/cloudlab/CloudLabView';
import { useLocalStorage } from './hooks/useLocalStorage';
import { 
  Compass, 
  Layers, 
  Calculator, 
  Scale, 
  BrainCircuit, 
  BookOpen, 
  Tablet, 
  Download,
  X,
  Boxes
} from 'lucide-react';

export function App() {
  const [currentTab, setCurrentTab] = useState<TabType>('interview');
  const [completedCases, setCompletedCases] = useLocalStorage<string[]>('sysdesign_completed_cases', ['tinyurl']);
  const [masteredCards, setMasteredCards] = useLocalStorage<string[]>('sysdesign_mastered_cards', ['fc-1', 'fc-5']);
  const [showPwaBanner, setShowPwaBanner] = useState<boolean>(true);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  // Capture PWA beforeinstallprompt on Android
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowPwaBanner(false);
      }
      setDeferredPrompt(null);
    } else {
      // Show iPad instruction tip
      alert("To install on iPad or iPhone:\n1. Tap the Share button in Safari (box with arrow)\n2. Select 'Add to Home Screen'\n\nOn Android Chrome:\n1. Tap the three dots (⋮)\n2. Select 'Install app' or 'Add to Home screen'");
    }
  };

  const handleToggleCompleteCase = (caseId: string) => {
    setCompletedCases((prev) => {
      if (prev.includes(caseId)) return prev.filter((id) => id !== caseId);
      return [...prev, caseId];
    });
  };

  const handleToggleMasteredCard = (cardId: string) => {
    setMasteredCards((prev) => {
      if (prev.includes(cardId)) return prev.filter((id) => id !== cardId);
      return [...prev, cardId];
    });
  };

  return (
    <div className="min-h-screen bg-[#070b13] text-slate-100 flex flex-col font-sans">
      {/* Top Navigation */}
      <Header
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        completedCasesCount={completedCases.length}
        totalCasesCount={CASE_STUDIES.length}
      />

      {/* PWA Offline / Tablet Installation Notice Banner */}
      {showPwaBanner && (
        <div className="bg-gradient-to-r from-indigo-950/80 via-slate-900 to-slate-950 border-b border-indigo-800/40 px-4 py-2.5">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <Tablet className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>
                <strong className="text-white font-semibold">iPad & Android Optimized: </strong>
                Add this web app to your Home Screen for full-screen offline practice.
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleInstallApp}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-[11px] shadow transition cursor-pointer"
              >
                <Download className="w-3 h-3" />
                <span>Install App</span>
              </button>
              <button
                onClick={() => setShowPwaBanner(false)}
                className="text-slate-500 hover:text-slate-300 p-1 cursor-pointer"
                title="Dismiss"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 pb-24 md:pb-8">
        {currentTab === 'interview' && (
          <InterviewSimulator
            completedCases={completedCases}
            onToggleCompleteCase={handleToggleCompleteCase}
          />
        )}

        {currentTab === 'cloudlab' && <CloudLabView />}

        {currentTab === 'canvas' && <ArchitectureCanvas />}

        {currentTab === 'math' && <MathArena />}

        {currentTab === 'tradeoffs' && <TradeOffArena />}

        {currentTab === 'flashcards' && (
          <FlashcardDeck
            masteredCardIds={masteredCards}
            onToggleMastered={handleToggleMasteredCard}
          />
        )}

        {currentTab === 'cheatsheet' && <CheatSheetView />}
      </main>

      {/* Mobile / Tablet Bottom Navigation Bar (Large touch targets for iPad/Android) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0c101c]/95 backdrop-blur-md border-t border-slate-800 px-2 py-2 safe-area-pb">
        <div className="grid grid-cols-7 gap-1 text-center">
          <button
            onClick={() => setCurrentTab('interview')}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl cursor-pointer ${
              currentTab === 'interview' ? 'text-indigo-400 font-bold' : 'text-slate-400'
            }`}
          >
            <Compass className="w-5 h-5" />
            <span className="text-[9px] mt-1">Cases</span>
          </button>

          <button
            onClick={() => setCurrentTab('cloudlab')}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl cursor-pointer ${
              currentTab === 'cloudlab' ? 'text-indigo-400 font-bold' : 'text-slate-400'
            }`}
          >
            <Boxes className="w-5 h-5 text-cyan-400" />
            <span className="text-[9px] mt-1 font-bold text-cyan-400">Cloud Lab</span>
          </button>

          <button
            onClick={() => setCurrentTab('canvas')}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl cursor-pointer ${
              currentTab === 'canvas' ? 'text-indigo-400 font-bold' : 'text-slate-400'
            }`}
          >
            <Layers className="w-5 h-5" />
            <span className="text-[9px] mt-1">Canvas</span>
          </button>

          <button
            onClick={() => setCurrentTab('math')}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl cursor-pointer ${
              currentTab === 'math' ? 'text-indigo-400 font-bold' : 'text-slate-400'
            }`}
          >
            <Calculator className="w-5 h-5" />
            <span className="text-[10px] mt-1">Math</span>
          </button>

          <button
            onClick={() => setCurrentTab('tradeoffs')}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl cursor-pointer ${
              currentTab === 'tradeoffs' ? 'text-indigo-400 font-bold' : 'text-slate-400'
            }`}
          >
            <Scale className="w-5 h-5" />
            <span className="text-[10px] mt-1">Trade-offs</span>
          </button>

          <button
            onClick={() => setCurrentTab('flashcards')}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl cursor-pointer ${
              currentTab === 'flashcards' ? 'text-indigo-400 font-bold' : 'text-slate-400'
            }`}
          >
            <BrainCircuit className="w-5 h-5" />
            <span className="text-[10px] mt-1">Cards</span>
          </button>

          <button
            onClick={() => setCurrentTab('cheatsheet')}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl cursor-pointer ${
              currentTab === 'cheatsheet' ? 'text-indigo-400 font-bold' : 'text-slate-400'
            }`}
          >
            <BookOpen className="w-5 h-5" />
            <span className="text-[10px] mt-1">Cheat</span>
          </button>
        </div>
      </nav>
    </div>
  );
}

export default App;
