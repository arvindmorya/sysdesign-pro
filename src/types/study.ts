export interface MathDrillQuestion {
  id: string;
  title: string;
  scenario: string;
  question: string;
  options: {
    label: string;
    value: string;
    isCorrect: boolean;
    explanation: string;
  }[];
  stepsFormula: string[];
}

export interface LatencyMetric {
  operation: string;
  timeNs: number;
  displayTime: string;
  category: 'cpu' | 'memory' | 'storage' | 'network';
  description: string;
}

export interface TradeoffScenario {
  id: string;
  title: string;
  context: string;
  requirements: string[];
  options: {
    id: string;
    name: string;
    architectureType: string;
    verdict: 'Recommended' | 'Acceptable with trade-offs' | 'Anti-Pattern';
    pros: string[];
    cons: string[];
    explanation: string;
  }[];
}

export interface Flashcard {
  id: string;
  category: 'Distributed Systems' | 'Databases & Storage' | 'Caching' | 'Networking' | 'Resilience & Scalability';
  question: string;
  keyAnswer: string;
  bulletPoints: string[];
  codeOrDiagram?: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}
