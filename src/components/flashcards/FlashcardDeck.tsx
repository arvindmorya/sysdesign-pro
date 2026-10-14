import React, { useState } from 'react';
import { FLASHCARDS } from '../../data/flashcards';
import type { Flashcard } from '../../types/study';
import { 
  RotateCw, 
  CheckCircle2, 
  ChevronLeft, 
  ChevronRight 
} from 'lucide-react';
import { fireSuccessConfetti } from '../../utils/confetti';

interface FlashcardDeckProps {
  masteredCardIds: string[];
  onToggleMastered: (id: string) => void;
}

export const FlashcardDeck: React.FC<FlashcardDeckProps> = ({
  masteredCardIds,
  onToggleMastered,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);

  const categories = ['All', 'Distributed Systems', 'Databases & Storage', 'Caching', 'Networking', 'Resilience & Scalability'];

  const filteredCards = selectedCategory === 'All'
    ? FLASHCARDS
    : FLASHCARDS.filter((c) => c.category === selectedCategory);

  const currentCard: Flashcard | undefined = filteredCards[currentIndex] || filteredCards[0];
  const isCurrentMastered = currentCard ? masteredCardIds.includes(currentCard.id) : false;

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % filteredCards.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + filteredCards.length) % filteredCards.length);
  };

  const handleMaster = () => {
    if (!currentCard) return;
    if (!isCurrentMastered) {
      fireSuccessConfetti();
    }
    onToggleMastered(currentCard.id);
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto animate-fadeIn select-none">
      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => { setSelectedCategory(cat); setCurrentIndex(0); setIsFlipped(false); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition cursor-pointer ${
              selectedCategory === cat
                ? 'bg-indigo-600 text-white shadow'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Progress Stats */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <span>Card {currentIndex + 1} of {filteredCards.length}</span>
        <span>
          Mastered: <strong className="text-cyan-400">{masteredCardIds.length}</strong> / {FLASHCARDS.length}
        </span>
      </div>

      {/* 3D Flip Flashcard Container */}
      {currentCard && (
        <div
          onClick={() => setIsFlipped(!isFlipped)}
          className="relative w-full min-h-[360px] cursor-pointer perspective-1000 group active:scale-[0.99] transition-transform"
        >
          <div
            className={`w-full min-h-[360px] rounded-3xl p-6 sm:p-8 border shadow-xl flex flex-col justify-between transition-all duration-300 ${
              isFlipped
                ? 'bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/40 border-indigo-500/50 shadow-indigo-500/10'
                : 'bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border-slate-800 hover:border-slate-700'
            }`}
          >
            {/* Top Bar on Card */}
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {currentCard.category}
              </span>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                  currentCard.difficulty === 'Easy'
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : currentCard.difficulty === 'Medium'
                    ? 'bg-amber-500/20 text-amber-400'
                    : 'bg-rose-500/20 text-rose-400'
                }`}>
                  {currentCard.difficulty}
                </span>
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <RotateCw className="w-3 h-3 text-slate-400" />
                  <span>Tap to flip</span>
                </span>
              </div>
            </div>

            {/* Content Area */}
            <div className="my-auto py-6">
              {!isFlipped ? (
                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                    Interview Active Recall Question:
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold text-white leading-snug">
                    {currentCard.question}
                  </h3>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider block mb-1">
                      Key Takeaway:
                    </span>
                    <p className="text-sm font-semibold text-white leading-relaxed">
                      {currentCard.keyAnswer}
                    </p>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    {currentCard.bulletPoints.map((point, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-slate-300 leading-relaxed">
                        <span className="text-indigo-400 font-bold shrink-0">•</span>
                        <span>{point}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Status on Card */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800/80">
              <span className="text-xs text-slate-500">
                {isFlipped ? 'Answer Revealed' : 'Think of answer before flipping'}
              </span>

              <button
                onClick={(e) => { e.stopPropagation(); handleMaster(); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  isCurrentMastered
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-white'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{isCurrentMastered ? 'Mastered' : 'Mark Mastered'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Buttons (iPad touch targets) */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={handlePrev}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-semibold transition cursor-pointer active:scale-95"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous Card</span>
        </button>

        <button
          onClick={handleNext}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-500/25 transition cursor-pointer active:scale-95"
        >
          <span>Next Card</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
