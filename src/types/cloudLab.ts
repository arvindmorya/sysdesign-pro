export type SimulatorId = 
  | 'circuit-breaker' 
  | 'idempotency' 
  | 'outbox' 
  | 'fault-domains' 
  | 'queue-vs-kafka' 
  | 'backoff-jitter';

export interface SimulatorMetadata {
  id: SimulatorId;
  title: string;
  subtitle: string;
  category: 'Resilience' | 'Data Consistency' | 'Topology' | 'Messaging';
  description: string;
  badge: string;
  keyQuestion: string;
}

export interface TopicLesson {
  id: string;
  number: number;
  title: string;
  category: 'Fundamentals' | 'Topology' | 'Runtimes' | 'Networking' | 'APIs & Resilience' | 'Messaging & Data';
  courseVideoUrl: string;
  originalNotes: {
    summary: string;
    keyPoints: string[];
    rulesOrChecklists?: string[];
  };
  modernShift2026: {
    title: string;
    description: string;
    keyDifferences: { older: string; modern: string }[];
  };
  interviewTradeoffs: {
    scenario: string;
    recommendation: string;
    pitfall: string;
  };
  relatedSimulatorId?: SimulatorId;
}

export interface CloudQuizQuestion {
  id: string;
  topicNumber: number;
  topicTitle: string;
  scenario: string;
  question: string;
  options: {
    label: string;
    isCorrect: boolean;
    explanation: string;
  }[];
  deepDiveExplanation: string;
}
