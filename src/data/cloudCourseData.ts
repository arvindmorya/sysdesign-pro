import type { SimulatorMetadata, TopicLesson, CloudQuizQuestion } from '../types/cloudLab';

export const SIMULATORS_METADATA: SimulatorMetadata[] = [
  {
    id: 'circuit-breaker',
    title: 'Circuit Breaker State Machine',
    subtitle: 'Closed ➔ Open ➔ Half-Open Fail-Safe Dynamics',
    category: 'Resilience',
    description: 'Simulate high error rates tripping the breaker, instant 503 fallback routing without server load, and canary probe recovery.',
    badge: 'Video 9 & Resilience',
    keyQuestion: 'How do you prevent a failing downstream dependency from causing cascading exhaustion across your whole cluster?'
  },
  {
    id: 'idempotency',
    title: 'Idempotent CREATE & Deduplication',
    subtitle: 'Exactly-Once Semantics Under Network Drops',
    category: 'Data Consistency',
    description: 'Simulate client-generated idempotency keys, atomic Redis locks, database commits, network response drops, and safe replay.',
    badge: 'Videos 11-12 & CRUD',
    keyQuestion: 'What happens when a payment request succeeds on the server but the client network drops before receiving the 201 response?'
  },
  {
    id: 'outbox',
    title: 'Transactional Outbox & CDC Pattern',
    subtitle: 'Solving the Dual-Write Race Condition',
    category: 'Data Consistency',
    description: 'Compare the catastrophic bug in naive dual-writes (DB + Kafka) against the atomic ACID Outbox Table + Debezium CDC pipeline.',
    badge: 'Modern 2026 Core',
    keyQuestion: 'Why is it impossible to guarantee atomicity between an SQL database commit and a Kafka message publish without 2PC or Outbox?'
  },
  {
    id: 'fault-domains',
    title: 'Fault Domains & Topology Disaster Simulator',
    subtitle: 'Region ➔ AZ ➔ Rack ➔ PC ➔ VM Hierarchy',
    category: 'Topology',
    description: 'Trigger simulated physical disasters (AZ power blackout, top-of-rack switch failure, VM crash) and watch healthy traffic re-routing.',
    badge: 'Videos 2-3 & Infrastructure',
    keyQuestion: 'Why does intra-service replication spanning separate Availability Zones trade higher latency for survivability?'
  },
  {
    id: 'queue-vs-kafka',
    title: 'Message Queue vs. Kafka Event Stream',
    subtitle: 'Destructive Competing Consumers vs. Replayable Partition Logs',
    category: 'Messaging',
    description: 'Inspect side-by-side queues (RabbitMQ/SQS where messages vanish on ack) versus append-only Kafka commit logs with multiple consumer offsets.',
    badge: 'Videos 12 & Streaming',
    keyQuestion: 'When should an architecture use ephemeral task queues instead of an append-only distributed event log?'
  },
  {
    id: 'backoff-jitter',
    title: 'Thundering Herd vs. Full Jitter Simulator',
    subtitle: 'Preventing Self-Inflicted Retry DDoS',
    category: 'Resilience',
    description: 'Watch 25 concurrent clients retry against a recovering server: synchronized backoff causes cyclic crashes; Full Jitter spreads load evenly.',
    badge: 'Video 11 & AWS Math',
    keyQuestion: 'Why does standard exponential backoff without randomness (jitter) repeatedly take down recovering servers?'
  }
];

export const TOPIC_LESSONS: TopicLesson[] = [
  {
    id: 'topic-1',
    number: 1,
    title: 'Cloud Philosophy: Embracing Failure as Normal',
    category: 'Fundamentals',
    courseVideoUrl: 'https://www.youtube.com/watch?v=F2Jxkmz38CY&list=PL9XzOCngAkqs0Q8ZRdafnSYExKQurZrB&index=3',
    originalNotes: {
      summary: 'In cloud computing, hardware failure and operational disruption are inevitable. Systems must be architected from day one under the assumption that everything can and will fail.',
      keyPoints: [
        'Developer causes: Unhandled exceptions, memory leaks, bad deployments.',
        'DevOps causes: Downscaling instances, rolling updates to new software versions.',
        'Orchestrator causes: Moving service code from one machine to another during rebalancing.',
        'Force Majeure: Hardware death, disk corruption, power outages, fiber cuts, complete datacenter outages.',
        'Mitigation: Eliminate Single Points of Failure (SPOF) everywhere—run code across multiple machines, and replicate data across distinct machines.'
      ],
      rulesOrChecklists: [
        'Never rely on a single router or instance (if router goes down, all 10 behind it become unreachable).',
        'Stateless compute can crash anytime—keep session state off the node.',
        'Replicate data across independent machines before acknowledging writes.'
      ]
    },
    modernShift2026: {
      title: 'Chaos Engineering & Ephemeral Spot Compute',
      description: 'Modern cloud architectures not only embrace failure, they proactively induce it continuously in production using Chaos Mesh and Gremlin. Furthermore, workloads are designed to run on volatile Spot / Preemptible VMs that can disappear with 30 seconds notice.',
      keyDifferences: [
        { older: 'Redundancy planned manually via active-passive failover VMs.', modern: 'Automated self-healing Kubernetes replica sets and multi-cloud serverless.' },
        { older: 'Disaster recovery tested annually during planned maintenance windows.', modern: 'Continuous automated Chaos Engineering (Chaos Monkey / Chaos Mesh) running during business hours.' }
      ]
    },
    interviewTradeoffs: {
      scenario: 'An interviewer asks: "How do you guarantee 99.999% availability for a financial service?"',
      recommendation: 'State that high availability is a probability distribution achieved through automated isolation, multi-AZ active-active deployments, health check-driven circuit breakers, and zero single points of failure.',
      pitfall: 'Relying on expensive "super-reliable" enterprise hardware instead of commodity distributed software-level fault tolerance.'
    },
    relatedSimulatorId: 'fault-domains'
  },
  {
    id: 'topic-2',
    number: 2,
    title: 'Physical Topology: Hierarchy & Fault Domains',
    category: 'Topology',
    courseVideoUrl: 'https://www.youtube.com/watch?v=4gIGYOCjsLs&list=PL9XzOCngAkqs0Q8ZRdafnSYExKQurZrB&index=4',
    originalNotes: {
      summary: 'Data center infrastructure is organized into a strict physical hierarchy. A fault domain is the perimeter of a single point of failure.',
      keyPoints: [
        'Physical Hierarchy: Plant ➔ Region ➔ Availability Zone (AZ) ➔ Rack ➔ PC (Host) ➔ VM ➔ Container.',
        'Region: A geographical area with multiple distinct data centers (e.g. US-East, Europe-West).',
        'Availability Zone (AZ): One or more physical data centers with independent power, cooling, and networking, connected via low-latency private fiber (< 2ms).',
        'Rack: Houses multiple physical computers sharing a Top-of-Rack (TOR) switch and power strip.',
        'Host PC ➔ Virtual Machine (VM) ➔ Container.'
      ],
      rulesOrChecklists: [
        'Replication rule: Intra-service data replication must cross fault domains (separate AZs).',
        'Trade-off: Cross-AZ replication incurs ~1-2ms round-trip latency, but guarantees survival if an entire data center loses power.'
      ]
    },
    modernShift2026: {
      title: 'Topology-Aware Kubernetes Routing & Edge Computing',
      description: 'Kubernetes uses Topology Aware Hints and node affinity labels (`topology.kubernetes.io/zone`) to route traffic to the closest local pod to minimize cross-AZ network egress costs while ensuring replicas remain scheduled across distinct AZs.',
      keyDifferences: [
        { older: 'Replicas placed manually on specific VM pools or subnets.', modern: 'Declarative `podAntiAffinity` rules and `topologySpreadConstraints`.' },
        { older: 'Cloud boundaries limited to central regions.', modern: 'Multi-region active-active clusters combined with Cloudflare/Fastly Edge compute.' }
      ]
    },
    interviewTradeoffs: {
      scenario: 'Designing database replication for high write throughput vs survivability.',
      recommendation: 'Use synchronous replication across 3 Availability Zones with quorum consensus (e.g., Raft/Paxos), accepting ~2ms network latency to guarantee zero data loss (RPO = 0).',
      pitfall: 'Replicating data between two VMs situated on the same rack or same AZ to get faster p99 writes, leaving the system vulnerable to a single switch/datacenter failure.'
    },
    relatedSimulatorId: 'fault-domains'
  },
  {
    id: 'topic-3',
    number: 3,
    title: 'Orchestrators, Virtualization & Container Runtimes',
    category: 'Runtimes',
    courseVideoUrl: 'https://www.youtube.com/watch?v=BZgB3fGXRHc&list=PL9XzOCngAkqs0Q8ZRdafnSYExKQurZrB&index=6',
    originalNotes: {
      summary: 'Orchestrators automate the cluster lifecycle, scaling, health monitoring, and rolling software upgrades across virtualized nodes.',
      keyPoints: [
        'Lifecycle Management: Orchestrators create, monitor, destroy, and reschedule VMs and containers.',
        'Resource Governance: Hard caps on CPU cores and RAM per container prevent noisy-neighbor starvation.',
        'Isolation vs Density Spectrum: Bare Metal PC (Highest isolation, lowest density) ➔ VM ➔ Hyper-V Container ➔ Docker Container ➔ Process (Lowest isolation, highest density).',
        'Docker Daemon: Listens on ports 2375 (unencrypted) / 2376 (TLS). Checks Local Image Registry; if missing, pulls from Remote Registry (Docker Hub) and boots container.'
      ],
      rulesOrChecklists: [
        'Container images must be immutable and define all runtime dependencies.',
        'The same binary image must run in Dev, Test, Staging, and Production.',
        'Container OS kernel must match host kernel (Linux container on Linux host; Windows container on Windows host).'
      ]
    },
    modernShift2026: {
      title: 'Kubernetes, CRI-O/containerd & Serverless Containers',
      description: 'Docker daemon was deprecated in Kubernetes (Dockershim removed in v1.24) in favor of the lightweight Container Runtime Interface (CRI) with `containerd` or `CRI-O`. Modern deployments also leverage serverless container runtimes (AWS ECS/Fargate, GCP Cloud Run) where cluster node management is eliminated.',
      keyDifferences: [
        { older: 'Direct Docker daemon managing containers on ports 2375/2376.', modern: 'Kubernetes Kubelet speaking CRI to containerd; OCI-standard container images.' },
        { older: 'Heavy VM hypervisors for multi-tenant isolation.', modern: 'MicroVMs (Firecracker, Kata Containers) combining VM security with container sub-second startup.' }
      ]
    },
    interviewTradeoffs: {
      scenario: 'When to choose Serverless Containers (Cloud Run / Fargate) vs. Self-Managed EKS/GKE.',
      recommendation: 'Choose Serverless Containers for unpredictable or spiky workloads, microservices, and lean teams to eliminate node patching and capacity planning. Choose Kubernetes when needing complex sidecar meshes, custom kernel modules, or thousands of persistent nodes.',
      pitfall: 'Running a self-managed multi-master Kubernetes cluster for small workloads when managed container services reduce operational overhead by 90%.'
    },
    relatedSimulatorId: 'outbox'
  },
  {
    id: 'topic-4',
    number: 4,
    title: '12-Factor Microservices & CI/CD Pipelines',
    category: 'Runtimes',
    courseVideoUrl: 'https://www.youtube.com/watch?v=LcPM7FsQK6g&list=PL9XzOCngAkqs0Q8ZRdafnSYExKQurZrB&index=5',
    originalNotes: {
      summary: 'The 12-Factor methodology defines architecture principles for building modern, scalable, cloud-native services.',
      keyPoints: [
        '1. Single Root Repo: One codebase per service; no sharing code via internal copy-paste.',
        '2. Explicit Dependencies: Bundle all dependencies inside the container image.',
        '3. Config in Environment: Never hardcode database credentials or URLs in code; read from environment variables.',
        '4. Backing Services as Resources: Treat databases, queues, and caches as attached resources via URLs.',
        '5. Strict Separation of Build, Release, Run: Build creates immutable artifact; Release merges build with config; Run executes.',
        '6. Stateless Processes: Services share nothing and store state in external backing datastores.',
        '7. Port Binding: Self-contained services listen on ports (no IIS/Apache host dependencies).',
        '8. Concurrency via Processes: Scale out horizontally with processes rather than complex thread locking.',
        '9. Disposability: Fast startup and graceful shutdown on SIGTERM.',
        '10. Dev/Prod Parity: Keep local development and production environments as similar as possible.',
        '11. Logs as Event Streams: Write unbuffered logs to stdout; external aggregators handle storage.',
        '12. Admin Tasks as One-Off Processes: Run database migrations and scripts as one-off jobs.'
      ]
    },
    modernShift2026: {
      title: 'GitOps & Ephemeral Preview Environments',
      description: 'Modern 12-Factor is driven by GitOps (ArgoCD / Flux) where Git is the single source of truth for both application and infrastructure state. Secrets are injected via External Secrets Operators (Vault / AWS Secrets Manager) rather than raw environment files, and pull requests automatically spin up isolated preview clusters.',
      keyDifferences: [
        { older: 'CI server pushes code directly into staging/prod clusters.', modern: 'GitOps pull-based operators synchronizing declared Kubernetes manifests.' },
        { older: 'Static configuration in .env files.', modern: 'Dynamic configuration with hot-reload via Consul or Kubernetes ConfigMaps and KMS-encrypted secrets.' }
      ]
    },
    interviewTradeoffs: {
      scenario: 'Handling database migrations in a zero-downtime CI/CD deployment.',
      recommendation: 'Use the Expand/Contract (Parallel Run) migration pattern: Step 1: Add new nullable columns. Step 2: Deploy new code writing to both. Step 3: Backfill old data. Step 4: Drop old columns in a subsequent release.',
      pitfall: 'Running destructive SQL migrations (dropping columns or renaming tables) directly during the deployment script, breaking existing running instances.'
    }
  },
  {
    id: 'topic-5',
    number: 5,
    title: 'Networking: Forward vs. Reverse Proxies & Virtual Ports',
    category: 'Networking',
    courseVideoUrl: 'https://www.youtube.com/watch?v=0OukrSld3sY&list=PL9XzOCngAkqs0Q8ZRdafnSYExKQurZrB&index=8',
    originalNotes: {
      summary: 'When multiple containers run on a single host, port collisions occur. Virtual networking and proxies provide addressing, stability, and security.',
      keyPoints: [
        'Port Collision Problem: Multiple containers wanting port 80/443 on the same physical PC require virtual translation (SNAT/DNAT, Host:Port mapping).',
        'Reverse Proxy: Sits in FRONT of backend servers facing clients. Provides a single stable DNS endpoint while backend service instances scale up, down, or migrate.',
        'Reverse Proxy Roles: L4 (TCP/UDP) & L7 (HTTP) load balancing, SSL Termination, canary routing, response caching, tenant rate limiting, and DDoS mitigation.',
        'Forward Proxy: Sits in FRONT of clients facing the internet. Handles outbound egress filtering, URL censoring, client anonymization, and corporate egress caching.'
      ],
      rulesOrChecklists: [
        'Reverse Proxy = Protects and abstracts SERVERS from clients.',
        'Forward Proxy = Protects and abstracts CLIENTS from servers.',
        'Downside of Reverse Proxy: Introduces an extra network hop and potential latency if not sized properly.'
      ]
    },
    modernShift2026: {
      title: 'Service Mesh (Envoy/Istio) & eBPF Networking',
      description: 'Traditional centralized reverse proxies created bottlenecks for east-west (service-to-service) traffic. Modern architectures use distributed Service Meshes (Envoy sidecars) or kernel-level eBPF (Cilium) to provide mTLS encryption, canary routing, and telemetry without routing all internal traffic through a central proxy.',
      keyDifferences: [
        { older: 'Centralized Nginx/HAProxy reverse proxy handling all internal routing.', modern: 'Envoy sidecar proxies and eBPF kernel bypass for east-west traffic; API Gateways (Kong, Envoy Gateway) for north-south.' },
        { older: 'Manual iptables port forwarding rules.', modern: 'eBPF socket-level redirection directly within the Linux kernel, bypassing iptables overhead.' }
      ]
    },
    interviewTradeoffs: {
      scenario: 'When to terminate SSL at the Edge Load Balancer vs. End-to-End internal TLS.',
      recommendation: 'Terminate public TLS at the perimeter API Gateway / Cloudflare Edge (SSL Offloading) for high performance, but enforce mutual TLS (mTLS) with internal service mesh for Zero-Trust internal compliance.',
      pitfall: 'Passing unencrypted plaintext traffic inside a multi-tenant cloud cluster without mTLS or VPC network policies.'
    },
    relatedSimulatorId: 'circuit-breaker'
  },
  {
    id: 'topic-6',
    number: 6,
    title: 'Service APIs: Contract-First, Versioning & gRPC',
    category: 'APIs & Resilience',
    courseVideoUrl: 'https://www.youtube.com/watch?v=jXAUAWPhIcc&list=PL9XzOCngAkqs0Q8ZRdafnSYExKQurZrB&index=10',
    originalNotes: {
      summary: 'Turning a monolithic method call into a network service call introduces network boundaries. Strict, language-agnostic contracts are essential.',
      keyPoints: [
        'Contract-First Design: Define formal API contract (OpenAPI / Swagger) BEFORE writing code. Avoid generating contracts from language-specific code.',
        'The Illusion of Versioning: APIs must maintain backward compatibility—you cannot simply break existing clients.',
        'Versioning Techniques: URI Path (`/v1/orders`), Query Parameter (`?api-version=1.0`), Date-based Header (`2026-10-14`).',
        'When to Bump Major Version: Changing mandatory fields, altering payload format, changing HTTP status fault contracts, or modifying semantic behavior.',
        'Beware Leaky RPC Abstractions: Technologies that try to make network calls look like local method calls (CORBA, DCOM, WCF) fail because network latency and partial failures cannot be abstracted away.'
      ]
    },
    modernShift2026: {
      title: 'gRPC, Protobuf & GraphQL Federation',
      description: 'While REST/OpenAPI remains standard for external public APIs, internal microservice communication is now dominated by gRPC over HTTP/2 with Protocol Buffers (strictly typed binary serialization, 5-10x faster than JSON). For complex frontend clients, GraphQL Federation (Apollo) provides unified querying.',
      keyDifferences: [
        { older: 'JSON over HTTP/1.1 with text serialization overhead.', modern: 'Protobuf binary serialization over HTTP/2 multiplexed streams with code-generated SDKs.' },
        { older: 'Path/Query versioning creating duplicated endpoints.', modern: 'Additive schema evolution in Protobuf (optional fields, field tags) avoiding version forks.' }
      ]
    },
    interviewTradeoffs: {
      scenario: 'Choosing between REST + JSON vs. gRPC + Protobuf for a distributed system.',
      recommendation: 'Use REST + JSON for external public APIs, third-party developers, and web clients. Use gRPC + Protobuf for high-throughput, low-latency internal microservice communication.',
      pitfall: 'Using gRPC directly from public browser web clients without a gRPC-Web proxy, or using unversioned JSON payloads for internal RPCs causing runtime deserialization crashes.'
    }
  },
  {
    id: 'topic-7',
    number: 7,
    title: 'Resilience: Circuit Breakers & Cascading Failure',
    category: 'APIs & Resilience',
    courseVideoUrl: 'https://www.youtube.com/watch?v=eWljhk1RvCM&list=PL9XzOCngAkqs0Q8ZRdafnSYExKQurZrB&index=9',
    originalNotes: {
      summary: 'When a downstream service degrades, continuous client retries create a self-inflicted Denial of Service attack. Circuit breakers isolate the failure.',
      keyPoints: [
        'Circuit Breaker Pattern: Monitors failed requests. If failure percentage exceeds threshold in a given window, the breaker trips to OPEN.',
        'Closed State: Normal operation. Requests pass through to the downstream service.',
        'Open State: Downstream is failing. All calls are rejected IMMEDIATELY (Fail Fast) with 503 or fallback response, saving CPU and thread pools.',
        'Half-Open State: After a cooldown timeout, allows a limited canary probe request. If successful, resets to Closed; if it fails, trips back to Open.'
      ],
      rulesOrChecklists: [
        'Never let client threads block indefinitely on a hung downstream service.',
        'Fail Fast: An immediate error response is infinitely better than a 30-second timeout that exhausts thread pools.'
      ]
    },
    modernShift2026: {
      title: 'Mesh-Level Outlier Detection & Adaptive Rate Limiting',
      description: 'Modern circuit breaking is delegated to the infrastructure proxy (Envoy / Istio) via Outlier Detection, ejecting unhealthy instances automatically. Furthermore, Adaptive Concurrency Limits measure round-trip latency gradients to throttle incoming traffic before timeouts occur.',
      keyDifferences: [
        { older: 'Application-level library (Netflix Hystrix, Polly) baked into code.', modern: 'Envoy Outlier Detection sidecar configuration without altering application code.' },
        { older: 'Static error rate threshold (e.g. > 50% errors).', modern: 'Dynamic latency percentile detection (p99 degradation) and automatic load shedding.' }
      ]
    },
    interviewTradeoffs: {
      scenario: 'How to handle a failing recommendation service on an e-commerce checkout page.',
      recommendation: 'Wrap the recommendation call in a circuit breaker. When tripped, return a cached or static fallback list (or hide the widget completely) so the checkout transaction completes seamlessly.',
      pitfall: 'Letting the checkout service wait for recommendations to time out, causing the critical checkout transaction to fail.'
    },
    relatedSimulatorId: 'circuit-breaker'
  },
  {
    id: 'topic-8',
    number: 8,
    title: 'Fault-Tolerance: Retries, Idempotency & Exactly-Once',
    category: 'APIs & Resilience',
    courseVideoUrl: 'https://www.youtube.com/watch?v=gH_hwwn2yDk&list=PL9XzOCngAkqs0Q8ZRdafnSYExKQurZrB&index=11',
    originalNotes: {
      summary: 'Clients must retry failed network calls due to network fallacies, but retries without idempotency cause duplicate charges and data corruption.',
      keyPoints: [
        'Fallacies of Distributed Computing: Networks are NOT reliable; latency is NOT zero; bandwidth is NOT infinite.',
        'Idempotency Definition: An operation is idempotent if executing it multiple times produces the exact same end state as executing it once.',
        'Naturally Idempotent HTTP Methods: GET, HEAD, OPTIONS, TRACE, PUT (last writer wins), DELETE (if already deleted, return 200/204).',
        'Non-Idempotent Method: POST (Creates new resources; retrying creates duplicates).',
        'Idempotency Pattern for CREATE: Client sends unique `Idempotency-Key` UUID. Server atomically checks log: if exists, return cached response; if not, execute operation and store result.'
      ],
      rulesOrChecklists: [
        'Client creates unique GUID / UUID for each mutating transaction.',
        'Server verifies ID in deduplication log atomically before executing.',
        'Periodic cleanup / TTL on deduplication keys to prevent unbounded database growth.'
      ]
    },
    modernShift2026: {
      title: 'Distributed Redis Mutexes & Stripe Idempotency Standard',
      description: 'The industry-standard implementation (popularized by Stripe) uses Redis with atomic commands (`SET key status NX EX 86400`) to lock the request in flight, execute the SQL write, and store the serialized response in Redis with a 24-hour TTL.',
      keyDifferences: [
        { older: 'Ad-hoc database table unique constraints checking client IDs.', modern: 'Redis two-phase idempotency locks (in-progress lock ➔ completed payload caching).' },
        { older: 'Blind retries with static backoff.', modern: 'Exponential backoff with full jitter to eliminate synchronized client retry waves.' }
      ]
    },
    interviewTradeoffs: {
      scenario: 'Preventing double-charging when a mobile user clicks "Pay Now" on a flaky cellular network.',
      recommendation: 'Generate an idempotency key on the mobile device upon button click. Send `Idempotency-Key` header with payment request. If network drops, mobile app retries with the exact same key. Payment gateway detects existing key and returns cached confirmation.',
      pitfall: 'Generating the idempotency key on the server, which renders it useless if the initial network request drops before reaching the server.'
    },
    relatedSimulatorId: 'idempotency'
  },
  {
    id: 'topic-9',
    number: 9,
    title: 'Async Messaging: Request/Reply vs. Event Streams',
    category: 'Messaging & Data',
    courseVideoUrl: 'https://www.youtube.com/watch?v=C26paSeSQD8&list=PL9XzOCngAkqs0Q8ZRdafnSYExKQurZrB&index=12',
    originalNotes: {
      summary: 'Synchronous request/reply couples client and server lifecycles. Asynchronous messaging decouples execution, absorbs traffic spikes, and enables elasticity.',
      keyPoints: [
        'Drawbacks of Synchronous Request/Reply: Client blocked waiting for response; client fails if server is busy; requires open network ports.',
        'Benefits of Message Queuing: Resource efficiency (no blocked threads), pull vs push model (workers pull at their own capacity), resiliency (servers can be offline without message loss).',
        'Elasticity: Queue depth metric is used to drive autoscaling (scale up workers when queue grows; scale down when empty).'
      ]
    },
    modernShift2026: {
      title: 'Message Queues (RabbitMQ/SQS) vs. Event Streams (Kafka/Kinesis)',
      description: 'Traditional message queues (SQS, RabbitMQ) are point-to-point and destructive (messages are deleted after processing). Modern cloud systems combine queues with Distributed Event Streaming (Kafka, Redpanda) where append-only partitioned logs allow multiple independent consumer groups to replay historical events indefinitely.',
      keyDifferences: [
        { older: 'Single queue abstraction where messages disappear once consumed.', modern: 'Dichotomy: Ephemeral task queues (RabbitMQ/SQS) vs Durable Event Streams (Kafka/Kinesis).' },
        { older: 'Scaling based solely on CPU usage.', modern: 'KEDA (Kubernetes Event-driven Autoscaling) scaling pods from 0 to N based on Kafka consumer group lag or SQS queue depth.' }
      ]
    },
    interviewTradeoffs: {
      scenario: 'Choosing between AWS SQS and Apache Kafka for an enterprise notification system.',
      recommendation: 'Use AWS SQS if you need simple worker task distribution with independent message ACKs and zero cluster management. Use Kafka if you need high-throughput event streaming, message ordering per partition, event replayability, and multiple independent consumer groups.',
      pitfall: 'Using Kafka as a simple background job queue with complex rebalancing, or using SQS for event sourcing where historical event replay is required.'
    },
    relatedSimulatorId: 'queue-vs-kafka'
  },
  {
    id: 'topic-10',
    number: 10,
    title: 'Modern Distributed Data: Outbox, Sagas & Observability',
    category: 'Messaging & Data',
    courseVideoUrl: 'https://www.youtube.com/watch?v=pxQV51aJlKU&list=PL9XzOCngAkqs0Q8ZRdafnSYExKQurZrB&index=5',
    originalNotes: {
      summary: 'Each microservice must own its private datastore. However, maintaining consistency across distributed services requires architectural patterns beyond standard 2-Phase Commit.',
      keyPoints: [
        'Exclusive Data Store: A microservice must have exclusive access to its own database. No other service may query or write to its tables directly.',
        'Why Monolithic Transactions Fail in Cloud: 2-Phase Commit (2PC) locks tables across network nodes, destroying availability and latency under partition.',
        'PACELC Theorem: In normal operation (no partition), a distributed database must trade off Latency (L) versus Consistency (C).'
      ]
    },
    modernShift2026: {
      title: 'Transactional Outbox, Sagas & OpenTelemetry',
      description: 'To solve the Dual-Write problem (writing to SQL + publishing to Kafka), services write to an `outbox` table within the same ACID transaction, and a CDC tool (Debezium) streams events to Kafka. Distributed transactions are orchestrated via Sagas with compensating transactions. End-to-end traceability is provided by OpenTelemetry Distributed Tracing.',
      keyDifferences: [
        { older: 'Naive dual write (Service writes to SQL then calls message broker), risking desynchronization if the app crashes between calls.', modern: 'Transactional Outbox + Debezium CDC reading MySQL binlog / Postgres WAL.' },
        { older: 'Basic application logging to flat text files.', modern: 'OpenTelemetry Distributed Tracing with W3C Trace Context propagating Trace ID and Span ID across 30+ microservices.' }
      ]
    },
    interviewTradeoffs: {
      scenario: 'A candidate suggests: "My Order Service inserts into PostgreSQL and then immediately calls KafkaProducer.send()."',
      recommendation: 'Flag the Dual-Write trap. If the database commit succeeds but the app crashes or network fails before Kafka responds, the event is permanently lost. Propose the Transactional Outbox Pattern to guarantee atomicity.',
      pitfall: 'Attempting distributed two-phase commit (XA transactions) across microservices, creating high latency and single points of failure.'
    },
    relatedSimulatorId: 'outbox'
  }
];

export const CLOUD_QUIZ_QUESTIONS: CloudQuizQuestion[] = [
  {
    id: 'cq-1',
    topicNumber: 7,
    topicTitle: 'Circuit Breaker Fail-Fast',
    scenario: 'Your Order Service depends on a 3rd-party Fraud Checking service. The Fraud service experiences a database deadlock and starts taking 45 seconds to respond or timing out.',
    question: 'Without a Circuit Breaker, what will immediately happen to the Order Service?',
    options: [
      {
        label: 'The Order Service will automatically scale down instances to save memory.',
        isCorrect: false,
        explanation: 'Orchestrators scale down on low load, not when requests are piling up.'
      },
      {
        label: 'Order Service worker threads and connection pools will become exhausted waiting for timeouts, causing cascading failure across the entire application.',
        isCorrect: true,
        explanation: 'Correct! When downstream calls hang for 45s, incoming requests accumulate. Thread pools, memory, and database connections saturate, taking down the Order Service.'
      },
      {
        label: 'The network router will cache previous successful fraud results and return them.',
        isCorrect: false,
        explanation: 'Network routers do not inspect or synthesize application-level HTTP transaction responses.'
      },
      {
        label: 'The reverse proxy will automatically convert the call into an asynchronous queue message.',
        isCorrect: false,
        explanation: 'Proxies cannot fundamentally change synchronous REST semantics into async messaging without architecture-level configuration.'
      }
    ],
    deepDiveExplanation: 'This is the classic Cascading Failure scenario. A Circuit Breaker trips to OPEN after a threshold of failures, immediately returning a 503 fallback (Fail Fast in 0ms) and protecting thread pools from exhaustion.'
  },
  {
    id: 'cq-2',
    topicNumber: 8,
    topicTitle: 'Idempotency Under Network Drops',
    scenario: 'A mobile client initiates a $50 bank transfer. The server successfully processes the database debit, but the mobile user enters a tunnel and loses 4G connection before receiving the HTTP 200 OK.',
    question: 'How does an Idempotent API prevent the user from being double-charged when the app automatically retries?',
    options: [
      {
        label: 'The server rejects all POST requests that occur within 60 seconds of each other.',
        isCorrect: false,
        explanation: 'Blind rate-limiting by time would block legitimate distinct payments for other items.'
      },
      {
        label: 'The client sends a client-generated UUID in the Idempotency-Key header; the server recognizes the existing key in its deduplication log and returns the cached confirmation without re-executing.',
        isCorrect: true,
        explanation: 'Correct! The client-generated idempotency key uniquely identifies the intent. The server detects the key has already been executed and safely returns the previous 200 OK response.'
      },
      {
        label: 'The database relies on auto-incrementing primary keys to prevent identical amounts.',
        isCorrect: false,
        explanation: 'Auto-incrementing keys create a brand new ID on every insert, which would cause duplicate rows.'
      },
      {
        label: 'The server switches from HTTP/1.1 to HTTP/2 to recover the dropped TCP connection.',
        isCorrect: false,
        explanation: 'HTTP/2 multiplexing does not solve physical network disconnections or application retry semantics.'
      }
    ],
    deepDiveExplanation: 'Idempotency ensures safe retryability in distributed systems. By verifying the Idempotency-Key atomically in Redis/SQL, the mutating logic executes strictly once.'
  },
  {
    id: 'cq-3',
    topicNumber: 10,
    topicTitle: 'The Dual-Write Bug',
    scenario: 'In a microservices architecture, the Order Service executes: `database.save(order)` followed immediately by `kafkaProducer.send("order-created", order)`.',
    question: 'What is the catastrophic flaw in this naive dual-write implementation?',
    options: [
      {
        label: 'Kafka cannot handle JSON payloads produced by relational databases.',
        isCorrect: false,
        explanation: 'Kafka is format-agnostic and handles JSON, Protobuf, Avro, etc.'
      },
      {
        label: 'If the service crashes or loses power immediately after `database.save()` commits, the Kafka message is never published, leaving downstream services desynchronized forever.',
        isCorrect: true,
        explanation: 'Correct! Database write and message publishing are two separate network operations. Without atomic coordination (Transactional Outbox), failure between them results in permanent inconsistency.'
      },
      {
        label: 'Relational databases automatically roll back commits if Kafka is not reachable within 500ms.',
        isCorrect: false,
        explanation: 'Standard databases have no knowledge of external message brokers; once `COMMIT` executes, it is written to the WAL.'
      },
      {
        label: 'Calling Kafka after database save causes an infinite recursive loop.',
        isCorrect: false,
        explanation: 'Publishing an event is not recursive unless the consumer publishes back to the exact same topic without an exit condition.'
      }
    ],
    deepDiveExplanation: 'This is the Dual-Write problem. The solution is the Transactional Outbox Pattern: insert into `orders` and `outbox` within the SAME atomic database transaction, and let a CDC process (like Debezium) stream from `outbox` to Kafka.'
  },
  {
    id: 'cq-4',
    topicNumber: 2,
    topicTitle: 'Fault Domains & Replication Latency',
    scenario: 'You are configuring database replication for a critical payment ledger across nodes in an AWS / Azure cloud region.',
    question: 'Why should synchronous replication nodes be located in different Availability Zones (AZs) rather than different racks in the same data center?',
    options: [
      {
        label: 'Cross-AZ networking is completely free of bandwidth charges.',
        isCorrect: false,
        explanation: 'Cross-AZ network traffic usually incurs standard cloud provider egress fees.'
      },
      {
        label: 'Separate Availability Zones represent separate Fault Domains with isolated power, cooling, and flood plains; surviving a catastrophic data center blackout justifies the ~1-2ms fiber latency.',
        isCorrect: true,
        explanation: 'Correct! An entire data center can lose power or flood. Replicating across separate AZs guarantees survivability against site-wide disaster at the cost of slight network latency.'
      },
      {
        label: 'Racks in the same data center cannot run the same operating system kernel.',
        isCorrect: false,
        explanation: 'Racks have nothing to do with OS kernel compatibility.'
      },
      {
        label: 'Load balancers cannot route TCP traffic between computers in the same rack.',
        isCorrect: false,
        explanation: 'Intra-rack routing is standard Ethernet switching.'
      }
    ],
    deepDiveExplanation: 'A Fault Domain defines the boundary of failure. If an entire AZ goes dark, intra-rack replication in that AZ is wiped out. Spanning AZs trades 1-2ms fiber latency for high availability.'
  },
  {
    id: 'cq-5',
    topicNumber: 9,
    topicTitle: 'Queue vs. Kafka Log Replay',
    scenario: 'You have a high-volume financial event stream. The Fraud Detection service discovered a critical bug in its heuristic model and needs to recalculate fraud scores for the past 7 days of transactions.',
    question: 'Why is Apache Kafka suited for this recovery scenario whereas standard AWS SQS or RabbitMQ is not?',
    options: [
      {
        label: 'Kafka automatically decrypts SSL packets faster than RabbitMQ.',
        isCorrect: false,
        explanation: 'TLS encryption performance is unrelated to message retention architecture.'
      },
      {
        label: 'RabbitMQ and SQS delete messages permanently once consumed and ACKed; Kafka retains messages in an append-only log, allowing the consumer group to reset its offset to 7 days ago and replay all events.',
        isCorrect: true,
        explanation: 'Correct! Kafka partitions are durable commit logs. Consumer groups track their position via an offset integer, which can be rewound at any time to replay historical events.'
      },
      {
        label: 'SQS only allows a maximum of 10 messages per day.',
        isCorrect: false,
        explanation: 'SQS handles millions of messages per second.'
      },
      {
        label: 'Kafka stores messages exclusively in RAM, preventing disk degradation.',
        isCorrect: false,
        explanation: 'Kafka relies heavily on OS disk page cache and sequential disk writes (zero-copy).'
      }
    ],
    deepDiveExplanation: 'Queues are destructive: read ➔ process ➔ delete. Kafka is an append-only commit log with time-based retention (e.g. 14 days), enabling multiple consumer groups to read and replay independently.'
  }
];
