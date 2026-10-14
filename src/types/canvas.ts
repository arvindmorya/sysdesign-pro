export type NodeType =
  | 'client'
  | 'dns'
  | 'cdn'
  | 'lb'
  | 'gateway'
  | 'service'
  | 'cache'
  | 'database'
  | 'replica'
  | 'queue'
  | 'worker'
  | 'storage';

export interface CanvasNode {
  id: string;
  type: NodeType;
  label: string;
  sublabel: string;
  x: number;
  y: number;
  status: 'healthy' | 'degraded' | 'failed';
  customConfig?: {
    qps?: number;
    latencyMs?: number;
    cacheHitRatio?: number;
  };
}

export interface CanvasConnection {
  id: string;
  from: string;
  to: string;
  label?: string;
  protocol?: string;
}

export interface CanvasTemplate {
  id: string;
  name: string;
  description: string;
  nodes: CanvasNode[];
  connections: CanvasConnection[];
}
