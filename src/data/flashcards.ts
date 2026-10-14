import type { Flashcard } from '../types/study';

export const FLASHCARDS: Flashcard[] = [
  {
    id: 'fc-1',
    category: 'Distributed Systems',
    difficulty: 'Medium',
    question: 'What is the PACELC Theorem, and how does it extend the CAP Theorem?',
    keyAnswer: 'If there is a Partition (P), how does the system trade off Availability (A) and Consistency (C); Else (E), how does it trade off Latency (L) and Consistency (C)?',
    bulletPoints: [
      'CAP theorem only considers behavior during network partitions (rare events).',
      'PACELC covers normal operating conditions: even without partitions, you must choose between low Latency or strong Consistency.',
      'Example: MongoDB is PC/EC (prefers Consistency in both). DynamoDB/Cassandra is PA/EL (prefers Availability and Latency).'
    ]
  },
  {
    id: 'fc-2',
    category: 'Databases & Storage',
    difficulty: 'Hard',
    question: 'Explain the difference between B+ Trees and LSM Trees (Log-Structured Merge-Trees). When do you pick each?',
    keyAnswer: 'B+ Trees optimize for READ-heavy workloads by keeping balanced on-disk pages. LSM Trees optimize for WRITE-heavy workloads by writing sequentially to memory (MemTable) and appending to disk (SSTables).',
    bulletPoints: [
      'B+ Tree: In-place updates causing random disk I/O. Fast reads (1-3 disk seeks). Used in Postgres, MySQL InnoDB.',
      'LSM Tree: Appends sequentially to MemTable + Write-Ahead Log (WAL). Zero random disk writes. Compacts SSTables in background. Fast writes, slower reads (requires Bloom filters). Used in Cassandra, RocksDB, ClickHouse.'
    ]
  },
  {
    id: 'fc-3',
    category: 'Caching',
    difficulty: 'Medium',
    question: 'What are Cache Stampede (Thundering Herd), Cache Penetration, and Cache Breakdown, and how do you prevent them?',
    keyAnswer: 'Three classic cache failure modes that can overwhelm backend databases with traffic spikes.',
    bulletPoints: [
      'Cache Stampede / Thundering Herd: A hot key expires, and thousands of concurrent requests simultaneously query DB. Fix: Mutex / Singleflight lock so only 1 request queries DB; or pre-warm cache before expiration.',
      'Cache Penetration: Requests for non-existent keys bypass cache and repeatedly hit DB. Fix: Cache null values with short TTL, or use a Bloom filter at the gateway to reject non-existent IDs immediately.',
      'Cache Breakdown: A single critical hot key expires while under heavy load. Fix: Mutual exclusion locks or probabilistic early expiration (XFetch algorithm).'
    ]
  },
  {
    id: 'fc-4',
    category: 'Distributed Systems',
    difficulty: 'Medium',
    question: 'How does Consistent Hashing work, and why are Virtual Nodes used?',
    keyAnswer: 'Consistent hashing maps both servers and data keys onto an abstract 360° hash ring. Adding or removing a server only remaps k/n keys instead of re-hashing the entire cluster.',
    bulletPoints: [
      'Standard modulo hashing (hash(key) % N) re-allocates almost 100% of keys when N changes.',
      'Consistent hashing maps servers onto a ring. A key is assigned to the first server encountered clockwise.',
      'Virtual Nodes (vnodes): A single physical server is hashed to multiple points on the ring (e.g. 100-256 tokens) to ensure uniform data distribution and prevent hot spots.'
    ]
  },
  {
    id: 'fc-5',
    category: 'Resilience & Scalability',
    difficulty: 'Easy',
    question: 'What is the Circuit Breaker pattern, and what are its three states?',
    keyAnswer: 'Prevents cascading failures by detecting failing downstream dependencies and short-circuiting calls.',
    bulletPoints: [
      'Closed: Normal state. Requests pass through. If error rate crosses threshold, trip to Open.',
      'Open: Requests immediately fail fast without calling the downstream dependency. Starts a cooldown timer.',
      'Half-Open: Allows a limited trial number of probe requests through. If successful, resets to Closed; if errors persist, returns to Open.'
    ]
  },
  {
    id: 'fc-6',
    category: 'Networking',
    difficulty: 'Medium',
    question: 'What is the difference between Layer 4 (L4) and Layer 7 (L7) Load Balancing?',
    keyAnswer: 'L4 balances traffic at the Transport layer (TCP/UDP IPs and Ports) without inspecting packet contents. L7 balances traffic at the Application layer (HTTP headers, cookies, URLs).',
    bulletPoints: [
      'L4 (e.g. AWS NLB, IPVS): Extremely fast, low CPU overhead, cannot inspect HTTP path or headers.',
      'L7 (e.g. AWS ALB, Envoy, Nginx): Terminates TLS, can inspect cookies, routes `/api/v1/orders` vs `/static/` to different clusters, enables sticky sessions and path routing.'
    ]
  },
  {
    id: 'fc-7',
    category: 'Distributed Systems',
    difficulty: 'Hard',
    question: 'What is the Saga Pattern, and how does it solve distributed transactions across microservices?',
    keyAnswer: 'Replaces expensive 2-Phase Commit (2PC) with a sequence of local transactions across services, paired with compensating transactions on failure.',
    bulletPoints: [
      'Choreography-based: Services publish events to a message queue; other services listen and react. Decentralized, great for simple flows.',
      'Orchestration-based: A centralized orchestrator (e.g. Temporal, AWS Step Functions) sends explicit commands to each service. Easier to debug and audit.',
      'Compensating Actions: If Step 3 (Payment) fails, the saga invokes compensating actions for Step 2 (Cancel Flight) and Step 1 (Release Hotel).'
    ]
  },
  {
    id: 'fc-8',
    category: 'Resilience & Scalability',
    difficulty: 'Medium',
    question: 'How do you implement an Idempotent CREATE operation in a distributed HTTP API?',
    keyAnswer: 'Client attaches a unique Idempotency-Key (UUID); the server atomically checks and logs this key before mutating database state.',
    bulletPoints: [
      'Client generates UUID on initial user action (e.g. click "Pay Now") and sends `Idempotency-Key: <uuid>`.',
      'API Gateway atomically executes `SET key IN_PROGRESS NX EX 86400` in Redis.',
      'If key already completed, return cached 201 response directly without re-executing.',
      'If network drops before client receives reply, client retries with the same key safely without duplicate charges.'
    ]
  },
  {
    id: 'fc-9',
    category: 'Databases & Storage',
    difficulty: 'Hard',
    question: 'What is the Dual-Write Problem, and how does the Transactional Outbox Pattern solve it?',
    keyAnswer: 'Calling a database commit and a Kafka publish consecutively is non-atomic; crashing between them causes permanent data desynchronization.',
    bulletPoints: [
      'The Dual-Write Bug: If `db.save(order)` succeeds but the server crashes before `kafka.send()`, the event is permanently lost.',
      'Outbox Solution: Insert both the business record (`orders`) and the event record (`outbox`) within the SAME atomic ACID database transaction.',
      'CDC (Change Data Capture): A tool like Debezium tails the database transaction log (Postgres WAL / MySQL binlog) and reliably streams events to Kafka with guaranteed at-least-once delivery.'
    ]
  },
  {
    id: 'fc-10',
    category: 'Distributed Systems',
    difficulty: 'Medium',
    question: 'What is the physical infrastructure hierarchy in cloud computing, and what is a Fault Domain?',
    keyAnswer: 'Hierarchy: Plant > Region > Availability Zone (AZ) > Rack > Host PC > VM > Container. A fault domain is the perimeter of a single point of failure.',
    bulletPoints: [
      'Availability Zone (AZ): One or more independent data centers with isolated power, cooling, and networking.',
      'Cross-Domain Replication: Replicating across separate AZs adds ~1-2ms fiber latency but guarantees survival if a whole datacenter loses power.',
      'Intra-Rack Danger: Placing replicas in the same rack leaves you vulnerable to a single Top-of-Rack (TOR) switch or power strip failure.'
    ]
  },
  {
    id: 'fc-11',
    category: 'Distributed Systems',
    difficulty: 'Medium',
    question: 'When should you choose Apache Kafka over a traditional Message Queue like AWS SQS or RabbitMQ?',
    keyAnswer: 'Choose SQS/RabbitMQ for simple ephemeral worker task queues; choose Kafka for high-throughput, ordered, replayable event streaming across multiple consumer groups.',
    bulletPoints: [
      'Queue (RabbitMQ/SQS): Destructive pop—messages are permanently deleted once acknowledged. Great for point-to-point task distribution.',
      'Kafka: Append-only partitioned commit log with time-based retention. Messages are not deleted on read.',
      'Independent Consumer Offsets: Multiple services (Payments, Analytics, Audit) can read at their own speed, and offsets can be rewound to replay past events.'
    ]
  },
  {
    id: 'fc-12',
    category: 'Resilience & Scalability',
    difficulty: 'Medium',
    question: 'Why does standard Exponential Backoff without Jitter cause a "Thundering Herd" retry storm?',
    keyAnswer: 'Without randomness, all recovering clients calculate identical sleep intervals (1s, 2s, 4s...) and slam the recovering server at the exact same millisecond.',
    bulletPoints: [
      'Thundering Herd: A synchronized wave of retries repeatedly overloads the recovering server CPU, causing cyclic outages.',
      'Full Jitter Formula: `sleep = random(0, min(cap, base * 2^attempt))`.',
      'Benefit: Randomly disperses retry requests evenly across time, allowing the recovering backend to process traffic smoothly.'
    ]
  }
];
