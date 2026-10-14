import React, { useState } from 'react';
import type { SimulatorId } from '../../types/cloudLab';
import { SIMULATORS_METADATA, TOPIC_LESSONS, CLOUD_QUIZ_QUESTIONS } from '../../data/cloudCourseData';
import { CircuitBreakerSim } from './simulators/CircuitBreakerSim';
import { IdempotencySim } from './simulators/IdempotencySim';
import { TransactionalOutboxSim } from './simulators/TransactionalOutboxSim';
import { FaultDomainSim } from './simulators/FaultDomainSim';
import { QueueVsKafkaSim } from './simulators/QueueVsKafkaSim';
import { BackoffJitterSim } from './simulators/BackoffJitterSim';
import { 
  Boxes, 
  BookOpen, 
  Sparkles, 
  HelpCircle, 
  Search, 
  ExternalLink, 
  ShieldAlert,
  Key,
  Layers,
  Globe,
  Radio,
  Flame,
  Check,
  RotateCcw
} from 'lucide-react';

type SubView = 'simulators' | 'curriculum' | 'quiz';

export const CloudLabView: React.FC = () => {
  const [subView, setSubView] = useState<SubView>('simulators');
  const [selectedSimId, setSelectedSimId] = useState<SimulatorId>('circuit-breaker');
  
  // Curriculum search & category filter
  const [curriculumSearch, setCurriculumSearch] = useState<string>('');
  const [curriculumCategory, setCurriculumCategory] = useState<string>('all');
  const [expandedTopicId, setExpandedTopicId] = useState<string>('topic-1');

  // Quiz state
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [revealedExplanations, setRevealedExplanations] = useState<Record<string, boolean>>({});

  const filteredTopics = TOPIC_LESSONS.filter((topic) => {
    const matchesSearch = 
      topic.title.toLowerCase().includes(curriculumSearch.toLowerCase()) ||
      topic.originalNotes.summary.toLowerCase().includes(curriculumSearch.toLowerCase()) ||
      topic.modernShift2026.title.toLowerCase().includes(curriculumSearch.toLowerCase());
    const matchesCategory = curriculumCategory === 'all' || topic.category === curriculumCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSelectQuizOption = (questionId: string, optionIndex: number) => {
    setUserAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
    setRevealedExplanations((prev) => ({ ...prev, [questionId]: true }));
  };

  const handleResetQuiz = () => {
    setUserAnswers({});
    setRevealedExplanations({});
  };

  const currentSimMeta = SIMULATORS_METADATA.find((s) => s.id === selectedSimId) || SIMULATORS_METADATA[0];

  return (
    <div className="flex flex-col gap-6">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-indigo-950/70 via-slate-900 to-slate-950 border border-indigo-500/30 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-indigo-500/10 to-transparent pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                Course Companion + 2026 Additions
              </span>
              <span className="text-xs text-slate-400 hidden sm:inline">
                Architecting Distributed Cloud Applications
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">
              Cloud Architecture & Resilience Lab
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-1.5 leading-relaxed">
              Master distributed failure domains, circuit breaking, idempotency, transactional outbox CDC, and Kafka streams through interactive animated simulations and modern architecture principles.
            </p>
          </div>

          {/* Quick Sub-Navigation Pills */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-950/80 border border-slate-800 rounded-xl self-start md:self-center shrink-0">
            <button
              onClick={() => setSubView('simulators')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                subView === 'simulators'
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Boxes className="w-4 h-4 text-cyan-400" />
              <span>Animated Simulators (6)</span>
            </button>

            <button
              onClick={() => setSubView('curriculum')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                subView === 'curriculum'
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <BookOpen className="w-4 h-4 text-indigo-400" />
              <span>Course Curriculum (10)</span>
            </button>

            <button
              onClick={() => setSubView('quiz')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                subView === 'quiz'
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <HelpCircle className="w-4 h-4 text-emerald-400" />
              <span>Scenario Drills</span>
            </button>
          </div>
        </div>
      </div>

      {/* SUBVIEW 1: ANIMATED SIMULATORS LAB */}
      {subView === 'simulators' && (
        <div className="flex flex-col gap-6">
          {/* Simulator Selection Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {SIMULATORS_METADATA.map((sim) => {
              const isSelected = selectedSimId === sim.id;
              return (
                <button
                  key={sim.id}
                  onClick={() => setSelectedSimId(sim.id)}
                  className={`p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between gap-2 ${
                    isSelected
                      ? 'bg-gradient-to-b from-indigo-900/60 to-slate-900 border-indigo-500 shadow-lg shadow-indigo-950/50 ring-1 ring-indigo-400'
                      : 'bg-[#0b101d] border-slate-800 hover:border-slate-700 hover:bg-slate-900/70'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                      {sim.category}
                    </span>
                    {sim.id === 'circuit-breaker' && <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />}
                    {sim.id === 'idempotency' && <Key className="w-3.5 h-3.5 text-indigo-400" />}
                    {sim.id === 'outbox' && <Layers className="w-3.5 h-3.5 text-violet-400" />}
                    {sim.id === 'fault-domains' && <Globe className="w-3.5 h-3.5 text-cyan-400" />}
                    {sim.id === 'queue-vs-kafka' && <Radio className="w-3.5 h-3.5 text-orange-400" />}
                    {sim.id === 'backoff-jitter' && <Flame className="w-3.5 h-3.5 text-amber-400" />}
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-white leading-snug">{sim.title}</h4>
                    <span className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{sim.subtitle}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Simulator Header Banner */}
          <div className="bg-[#070b14] border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">{currentSimMeta.title}</h2>
                <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold">
                  {currentSimMeta.badge}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{currentSimMeta.description}</p>
            </div>

            <div className="bg-slate-950 px-3 py-2 rounded-lg border border-slate-800 text-xs text-slate-300 max-w-md shrink-0">
              <strong className="text-cyan-400 block text-[10px] uppercase font-bold mb-0.5">Core Architectural Question:</strong>
              <span className="text-[11px] leading-tight italic">"{currentSimMeta.keyQuestion}"</span>
            </div>
          </div>

          {/* Render Active Simulator Component */}
          {selectedSimId === 'circuit-breaker' && <CircuitBreakerSim />}
          {selectedSimId === 'idempotency' && <IdempotencySim />}
          {selectedSimId === 'outbox' && <TransactionalOutboxSim />}
          {selectedSimId === 'fault-domains' && <FaultDomainSim />}
          {selectedSimId === 'queue-vs-kafka' && <QueueVsKafkaSim />}
          {selectedSimId === 'backoff-jitter' && <BackoffJitterSim />}
        </div>
      )}

      {/* SUBVIEW 2: COURSE CURRICULUM (10 TOPICS WITH 2026 ADDITIONS) */}
      {subView === 'curriculum' && (
        <div className="flex flex-col gap-5">
          {/* Filters & Search */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#0b101d] border border-slate-800 p-3 rounded-xl">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search topics, patterns, or tech..."
                value={curriculumSearch}
                onChange={(e) => setCurriculumSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 sm:pb-0 scrollbar-none">
              {['all', 'Fundamentals', 'Runtimes', 'Networking', 'APIs & Resilience', 'Messaging & Data'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCurriculumCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition cursor-pointer ${
                    curriculumCategory === cat
                      ? 'bg-indigo-600 text-white font-bold'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  {cat === 'all' ? 'All Topics' : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Topics List */}
          <div className="flex flex-col gap-4">
            {filteredTopics.map((topic) => {
              const isExpanded = expandedTopicId === topic.id;
              return (
                <div
                  key={topic.id}
                  className="bg-[#0b101d] border border-slate-800 rounded-xl overflow-hidden transition-all duration-200"
                >
                  {/* Topic Title Accordion Header */}
                  <div
                    onClick={() => setExpandedTopicId(isExpanded ? '' : topic.id)}
                    className="p-4 flex items-center justify-between gap-3 cursor-pointer hover:bg-slate-900/60 transition"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-lg bg-indigo-950 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold text-xs font-mono shrink-0">
                        {topic.number}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-white">{topic.title}</h3>
                          <span className="text-[10px] px-2 py-0.2 rounded-full bg-slate-800 text-slate-400 border border-slate-700 hidden sm:inline">
                            {topic.category}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{topic.originalNotes.summary}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {topic.relatedSimulatorId && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedSimId(topic.relatedSimulatorId!);
                            setSubView('simulators');
                          }}
                          className="hidden sm:flex items-center gap-1 text-[11px] font-bold text-cyan-400 hover:underline"
                        >
                          <Boxes className="w-3.5 h-3.5" />
                          <span>Open Sim</span>
                        </button>
                      )}
                      <span className="text-xs text-indigo-400 font-bold font-mono">
                        {isExpanded ? 'Collapse ▲' : 'Expand ▼'}
                      </span>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="p-4 pt-0 border-t border-slate-800/80 flex flex-col gap-4 text-xs">
                      {/* Original Course Takeaways */}
                      <div className="bg-[#070b14] p-3.5 rounded-lg border border-slate-800 flex flex-col gap-2">
                        <div className="flex items-center justify-between text-indigo-400 font-bold uppercase tracking-wider text-[11px]">
                          <span>Original Course Fundamentals (From Your Notes):</span>
                          <a
                            href={topic.courseVideoUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-white underline"
                          >
                            <ExternalLink className="w-3 h-3" /> Watch Video #{topic.number}
                          </a>
                        </div>
                        <ul className="list-disc list-inside flex flex-col gap-1 text-slate-300">
                          {topic.originalNotes.keyPoints.map((pt, i) => (
                            <li key={i} className="leading-relaxed">{pt}</li>
                          ))}
                        </ul>

                        {topic.originalNotes.rulesOrChecklists && (
                          <div className="mt-2 pt-2 border-t border-slate-800/80 flex flex-col gap-1">
                            <span className="text-[10px] font-bold text-amber-400 uppercase">Architecture Checklist:</span>
                            {topic.originalNotes.rulesOrChecklists.map((rule, idx) => (
                              <div key={idx} className="flex items-start gap-1.5 text-slate-400 text-[11px]">
                                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                                <span>{rule}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Modern 2026 Shift */}
                      <div className="bg-gradient-to-r from-indigo-950/40 to-slate-900 p-3.5 rounded-lg border border-indigo-500/30 flex flex-col gap-2">
                        <span className="text-cyan-400 font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5" /> Modern 2026 Production Evolution: {topic.modernShift2026.title}
                        </span>
                        <p className="text-slate-300 leading-relaxed">{topic.modernShift2026.description}</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-1">
                          {topic.modernShift2026.keyDifferences.map((diff, i) => (
                            <div key={i} className="bg-slate-950/70 p-2.5 rounded border border-slate-800 flex flex-col gap-1">
                              <span className="text-[10px] text-slate-500 uppercase font-semibold">Older / Legacy:</span>
                              <span className="text-slate-400 text-[11px] line-through">{diff.older}</span>
                              <span className="text-[10px] text-cyan-400 uppercase font-bold mt-1">Modern Standard:</span>
                              <span className="text-emerald-300 text-[11px] font-medium">{diff.modern}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Interview Trade-off Dilemma */}
                      <div className="bg-amber-950/20 border border-amber-500/30 p-3 rounded-lg flex flex-col gap-1">
                        <span className="text-amber-400 font-bold uppercase text-[10px]">Interview Scenario:</span>
                        <p className="text-slate-200 font-medium">{topic.interviewTradeoffs.scenario}</p>
                        <p className="text-emerald-300 mt-1">
                          <strong>Recommended Answer:</strong> {topic.interviewTradeoffs.recommendation}
                        </p>
                        <p className="text-rose-300">
                          <strong>Common Pitfall:</strong> {topic.interviewTradeoffs.pitfall}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUBVIEW 3: SCENARIO DRILLS & QUIZZES */}
      {subView === 'quiz' && (
        <div className="flex flex-col gap-5">
          <div className="flex items-center justify-between bg-[#0b101d] border border-slate-800 p-4 rounded-xl">
            <div>
              <h2 className="text-base font-bold text-white">Cloud Architecture Scenario Drills</h2>
              <p className="text-xs text-slate-400">Test your mastery of failure modes, idempotency, fault domains, and Kafka log architecture.</p>
            </div>
            <button
              onClick={handleResetQuiz}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700 transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Drills</span>
            </button>
          </div>

          <div className="flex flex-col gap-4">
            {CLOUD_QUIZ_QUESTIONS.map((q, qIndex) => {
              const selectedOpt = userAnswers[q.id];
              const isRevealed = revealedExplanations[q.id];

              return (
                <div key={q.id} className="bg-[#0b101d] border border-slate-800 rounded-xl p-5 flex flex-col gap-3">
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                    <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider">
                      Question #{qIndex + 1} — {q.topicTitle}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">Topic {q.topicNumber}</span>
                  </div>

                  <div className="bg-[#070b14] p-3 rounded-lg border border-slate-800 text-xs text-slate-300 leading-relaxed italic">
                    <strong className="text-cyan-400 not-italic block mb-0.5">Scenario:</strong>
                    "{q.scenario}"
                  </div>

                  <h3 className="text-sm font-bold text-white leading-snug">{q.question}</h3>

                  {/* Options */}
                  <div className="flex flex-col gap-2 mt-1">
                    {q.options.map((opt, optIndex) => {
                      const isChosen = selectedOpt === optIndex;
                      return (
                        <button
                          key={optIndex}
                          onClick={() => handleSelectQuizOption(q.id, optIndex)}
                          className={`p-3 rounded-xl border text-left text-xs transition cursor-pointer flex items-start gap-2.5 ${
                            isChosen
                              ? opt.isCorrect
                                ? 'bg-emerald-950/50 border-emerald-500 text-white shadow-md'
                                : 'bg-rose-950/50 border-rose-500 text-white shadow-md'
                              : isRevealed && opt.isCorrect
                              ? 'bg-emerald-950/30 border-emerald-500/60 text-emerald-200'
                              : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-900 hover:text-white'
                          }`}
                        >
                          <span className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 text-[10px] font-bold font-mono mt-0.5 ${
                            isChosen
                              ? opt.isCorrect ? 'bg-emerald-500 text-emerald-950 border-white' : 'bg-rose-500 text-white border-white'
                              : 'bg-slate-800 border-slate-700 text-slate-400'
                          }`}>
                            {String.fromCharCode(65 + optIndex)}
                          </span>
                          <div className="flex-1">
                            <span className="leading-relaxed block">{opt.label}</span>
                            {isRevealed && isChosen && (
                              <span className={`block mt-1 text-[11px] font-medium ${opt.isCorrect ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {opt.explanation}
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Deep-Dive Rationale Box */}
                  {isRevealed && (
                    <div className="bg-indigo-950/30 border border-indigo-500/30 p-3 rounded-lg text-xs text-indigo-200 leading-relaxed mt-2 flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-cyan-300 block mb-0.5">Architecture Deep-Dive Rationale:</strong>
                        <span>{q.deepDiveExplanation}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
