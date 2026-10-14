export type TabType = 'interview' | 'canvas' | 'math' | 'tradeoffs' | 'flashcards' | 'cheatsheet' | 'cloudlab';

export interface RequirementItem {
  id: string;
  text: string;
  category: 'functional' | 'non-functional' | 'out-of-scope';
  explanation: string;
}

export interface MathEstimate {
  dau: number; // e.g. 500_000_000
  readsPerUserPerDay: number;
  writesPerUserPerDay: number;
  readPayloadBytes: number;
  writePayloadBytes: number;
  expectedReadQPS: number;
  expectedWriteQPS: number;
  expectedDailyStorageGB: number;
  expectedYearlyStorageTB: number;
  expectedCacheRAMGB: number;
  unitNotes: string[];
}

export interface ArchitectureComponent {
  id: string;
  name: string;
  type: 'client' | 'gateway' | 'lb' | 'service' | 'cache' | 'database' | 'queue' | 'worker' | 'storage';
  role: string;
  details: string[];
}

export interface ArchitectureEdge {
  from: string;
  to: string;
  label: string;
  protocol: 'HTTPS' | 'TCP' | 'WebSocket' | 'gRPC' | 'Async Queue';
}

export interface DeepDiveScenario {
  id: string;
  question: string;
  hint: string;
  answer: string;
  bestPractices: string[];
  keyTradeoff: string;
}

export interface CaseStudy {
  id: string;
  title: string;
  category: 'Core Distributed' | 'Social & Feed' | 'Real-Time' | 'Streaming' | 'Geospatial';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  summary: string;
  readWriteRatio: string;
  requirements: RequirementItem[];
  math: MathEstimate;
  apiEndpoints: {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    path: string;
    description: string;
    params: string;
    response: string;
  }[];
  dataModel: {
    table: string;
    dbType: string;
    columns: string[];
    indexingStrategy: string;
  }[];
  architecture: {
    components: ArchitectureComponent[];
    edges: ArchitectureEdge[];
    summaryFlow: string[];
  };
  deepDives: DeepDiveScenario[];
}
