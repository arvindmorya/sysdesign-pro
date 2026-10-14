import type { TradeoffScenario } from '../types/study';

export const TRADEOFF_SCENARIOS: TradeoffScenario[] = [
  {
    id: 'tradeoff-1',
    title: 'Financial Ledger: User Balance & Money Transfers',
    context: 'You are designing the core ledger service for a digital fintech bank. Users transfer funds between checking accounts. Account balance must never go negative, and money must never be lost or duplicated during concurrent network requests.',
    requirements: [
      'Strict Zero Data Loss',
      'ACID transactions (Atomic debit from sender & credit to receiver)',
      'High auditability and reproducibility'
    ],
    options: [
      {
        id: 'opt-1a',
        name: 'Relational Database (PostgreSQL / CockroachDB) with Pessimistic Locking & Idempotency Keys',
        architectureType: 'Strongly Consistent Relational / Distributed SQL',
        verdict: 'Recommended',
        pros: [
          'Full ACID guarantees via row locks (`SELECT ... FOR UPDATE`).',
          'Immediate consistency prevents race conditions (two simultaneous $100 withdrawals on a $100 balance).',
          'Mature tooling, point-in-time recovery, and foreign key audit tables.'
        ],
        cons: [
          'Row locks can cause contention under high concurrency on hot accounts.',
          'Horizontal scaling requires distributed SQL (CockroachDB/Yugabyte) or application-level sharding.'
        ],
        explanation: 'In banking and financial ledgers, correctness and ACID transactions are non-negotiable. Eventual consistency can lead to double-spending or negative balances during partition splits.'
      },
      {
        id: 'opt-1b',
        name: 'Distributed NoSQL (Apache Cassandra) with Eventual Consistency',
        architectureType: 'AP Store (High Availability / Eventual Consistency)',
        verdict: 'Anti-Pattern',
        pros: [
          'High write throughput and masterless peer-to-peer scaling across datacenters.'
        ],
        cons: [
          'No multi-row ACID transactions.',
          'Eventual consistency means simultaneous reads can see stale balances, allowing overdrafts.',
          'Lightweight Transactions (LWT / Paxos) in Cassandra are slow and prone to contention.'
        ],
        explanation: 'Cassandra is optimized for high-write time-series, metrics, and chat history. Using it for double-entry financial bookkeeping is a dangerous anti-pattern.'
      },
      {
        id: 'opt-1c',
        name: 'Event-Sourcing with Kafka + Redis in-memory balance + Async DB flush',
        architectureType: 'In-memory Cache with Async Write-back',
        verdict: 'Acceptable with trade-offs',
        pros: [
          'Ultra-high throughput (millions of ops/sec).',
          'Complete audit trail of immutable events in Kafka.'
        ],
        cons: [
          'If Redis node fails before writing back to disk, recent balance adjustments require replaying Kafka logs.',
          'Complex dual-write consistency and reconciliation pipelines needed.'
        ],
        explanation: 'Used by high-frequency crypto or gaming exchanges, but introduces massive operational complexity compared to a hardened relational database.'
      }
    ]
  },
  {
    id: 'tradeoff-2',
    title: 'IoT Telemetry Ingestion: 2 Million Writes/sec',
    context: 'A smart fleet company tracks 1,000,000 vehicles sending GPS coordinates, engine temperature, and speed every 500ms. Reads are primarily analytical time-range queries (e.g. "show temperature trend for truck #842 over last 24h").',
    requirements: [
      'Sustain 2,000,000 writes per second',
      'Append-only, immutable time-series data',
      'Cost-effective tiered storage (auto-archive data older than 90 days to S3)'
    ],
    options: [
      {
        id: 'opt-2a',
        name: 'Single PostgreSQL instance with standard B-Tree indexes',
        architectureType: 'Standard Monolithic RDBMS',
        verdict: 'Anti-Pattern',
        pros: ['Simple schema and SQL queries.'],
        cons: [
          'B-Tree random I/O writes choke at tens of thousands of writes/sec.',
          'Disk fragmentation and vacuuming overhead will bring down the server under 2M writes/sec.'
        ],
        explanation: 'Traditional relational B-Trees require page rebalancing and random disk writes, making them incapable of absorbing millions of sustained writes per second on a single machine.'
      },
      {
        id: 'opt-2b',
        name: 'LSM-Tree Time-Series / Columnar Store (ClickHouse / TimescaleDB / Apache Cassandra)',
        architectureType: 'Log-Structured Merge-Tree (LSM) & Columnar Storage',
        verdict: 'Recommended',
        pros: [
          'LSM-Trees append all writes sequentially to memory MemTable and WAL (zero random disk I/O).',
          'Massive compression ratios (up to 5x-10x) on repeated columnar data.',
          'ClickHouse scans millions of rows per second for time-range aggregation queries.'
        ],
        cons: [
          'Not suited for frequent point updates or multi-row transactions.'
        ],
        explanation: 'LSM-Trees convert random writes into sequential disk flushes (SSTables), perfectly matched for append-only high-throughput time-series telemetry.'
      }
    ]
  },
  {
    id: 'tradeoff-3',
    title: 'Message Distribution: Order Tracking Notification Service',
    context: 'An e-commerce app dispatches notifications when order status changes (Created -> Paid -> Shipped -> Delivered). Downstream systems include Email, Push notifications, and Inventory reservation.',
    requirements: [
      'Decouple checkout service from notification vendors',
      'Deliver each event to multiple independent consumer groups',
      'Support replayability if email service experiences outage for 4 hours'
    ],
    options: [
      {
        id: 'opt-3a',
        name: 'Distributed Event Log (Apache Kafka)',
        architectureType: 'Persistent Log with Offset Tracking',
        verdict: 'Recommended',
        pros: [
          'Pub/Sub fanout allows multiple independent consumer groups to read at their own pace.',
          'Events are retained for days/weeks on disk: consumers can replay from past offsets after an outage.',
          'Guaranteed per-partition ordering by Order ID.'
        ],
        cons: [
          'Operational overhead (ZooKeeper/KRaft, partition management).',
          'Overkill for low-volume apps with simple message deletion.'
        ],
        explanation: 'Kafka provides event replayability and multi-consumer fanout, ensuring that an email outage doesn’t block or lose messages for SMS or Inventory.'
      },
      {
        id: 'opt-3b',
        name: 'RabbitMQ with Direct Exchanges',
        architectureType: 'Traditional Message Broker (AMQP)',
        verdict: 'Acceptable with trade-offs',
        pros: [
          'Flexible routing keys and exchanges.',
          'Low latency and fine-grained acknowledgement per message.'
        ],
        cons: [
          'Messages are destroyed immediately upon consumer acknowledgement; zero replay capability if downstream fails.',
          'Queues can consume massive RAM if consumers fall behind.'
        ],
        explanation: 'Great for simple worker task queues, but lacks native event replayability once messages are acknowledged.'
      }
    ]
  }
];
