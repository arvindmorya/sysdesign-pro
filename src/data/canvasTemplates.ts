import type { CanvasTemplate } from '../types/canvas';

export const CANVAS_TEMPLATES: CanvasTemplate[] = [
  {
    id: 'tinyurl-arch',
    name: 'TinyURL Architecture',
    description: 'High-throughput URL shortener with CDN, Redis Cache-Aside, KGS, and Cassandra.',
    nodes: [
      { id: 'n1', type: 'client', label: 'Web / Mobile Client', sublabel: 'Browser / App', x: 40, y: 160, status: 'healthy', customConfig: { qps: 6000, latencyMs: 12 } },
      { id: 'n2', type: 'cdn', label: 'Cloudflare CDN', sublabel: 'Edge 302 Cache', x: 220, y: 160, status: 'healthy', customConfig: { qps: 5800, latencyMs: 5, cacheHitRatio: 85 } },
      { id: 'n3', type: 'lb', label: 'Layer 7 ALB', sublabel: 'Traffic Distributor', x: 400, y: 160, status: 'healthy', customConfig: { qps: 900, latencyMs: 2 } },
      { id: 'n4', type: 'service', label: 'Shortener Service', sublabel: 'Stateless API Cluster', x: 580, y: 160, status: 'healthy', customConfig: { qps: 900, latencyMs: 8 } },
      { id: 'n5', type: 'cache', label: 'Redis Cluster', sublabel: 'LRU Hot Cache', x: 780, y: 80, status: 'healthy', customConfig: { qps: 850, latencyMs: 1, cacheHitRatio: 92 } },
      { id: 'n6', type: 'database', label: 'NoSQL DB', sublabel: 'Cassandra / DynamoDB', x: 780, y: 240, status: 'healthy', customConfig: { qps: 50, latencyMs: 6 } },
      { id: 'n7', type: 'worker', label: 'Key Gen Service (KGS)', sublabel: 'Pre-generates Base62', x: 580, y: 320, status: 'healthy', customConfig: { qps: 10, latencyMs: 1 } },
      { id: 'n8', type: 'queue', label: 'Kafka Stream', sublabel: 'Click Analytics Queue', x: 400, y: 320, status: 'healthy', customConfig: { qps: 6000, latencyMs: 3 } }
    ],
    connections: [
      { id: 'c1', from: 'n1', to: 'n2', label: 'GET /x7K9pQ' },
      { id: 'c2', from: 'n2', to: 'n3', label: 'Miss (15%)' },
      { id: 'c3', from: 'n3', to: 'n4', label: 'Proxy HTTP' },
      { id: 'c4', from: 'n4', to: 'n5', label: 'Cache Lookup' },
      { id: 'c5', from: 'n4', to: 'n6', label: 'DB Fallback' },
      { id: 'c6', from: 'n7', to: 'n4', label: 'Dispense Token' },
      { id: 'c7', from: 'n4', to: 'n8', label: 'Emit Click' }
    ]
  },
  {
    id: 'chat-arch',
    name: 'Real-Time WebSocket Chat',
    description: 'Bidi WebSocket gateway, Redis Session Registry, and Cassandra Message Inbox.',
    nodes: [
      { id: 'cn1', type: 'client', label: 'Sender Device', sublabel: 'iOS / Android App', x: 40, y: 120, status: 'healthy', customConfig: { qps: 1200, latencyMs: 25 } },
      { id: 'cn2', type: 'gateway', label: 'WebSocket Gateway', sublabel: 'Netty/Go Host A', x: 260, y: 120, status: 'healthy', customConfig: { qps: 1200, latencyMs: 3 } },
      { id: 'cn3', type: 'cache', label: 'Session Registry', sublabel: 'Redis User:Host Map', x: 480, y: 40, status: 'healthy', customConfig: { qps: 1200, latencyMs: 1 } },
      { id: 'cn4', type: 'service', label: 'Message Router', sublabel: 'Internal Dispatcher', x: 480, y: 160, status: 'healthy', customConfig: { qps: 1200, latencyMs: 4 } },
      { id: 'cn5', type: 'gateway', label: 'WebSocket Gateway', sublabel: 'Netty/Go Host B', x: 700, y: 120, status: 'healthy', customConfig: { qps: 1100, latencyMs: 3 } },
      { id: 'cn6', type: 'client', label: 'Recipient Device', sublabel: 'Active Socket', x: 920, y: 120, status: 'healthy', customConfig: { qps: 1100, latencyMs: 25 } },
      { id: 'cn7', type: 'database', label: 'Cassandra Inbox', sublabel: 'Offline Fallback Store', x: 480, y: 300, status: 'healthy', customConfig: { qps: 100, latencyMs: 8 } }
    ],
    connections: [
      { id: 'cc1', from: 'cn1', to: 'cn2', label: 'WS Frame' },
      { id: 'cc2', from: 'cn2', to: 'cn3', label: 'Lookup Host' },
      { id: 'cc3', from: 'cn2', to: 'cn4', label: 'gRPC Route' },
      { id: 'cc4', from: 'cn4', to: 'cn5', label: 'Deliver Target' },
      { id: 'cc5', from: 'cn5', to: 'cn6', label: 'WS Push' },
      { id: 'cc6', from: 'cn4', to: 'cn7', label: 'If Offline' }
    ]
  }
];
