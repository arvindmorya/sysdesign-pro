import type { CaseStudy } from '../types/interview';

export const CASE_STUDIES: CaseStudy[] = [
  {
    id: 'tinyurl',
    title: 'Design TinyURL (URL Shortener)',
    category: 'Core Distributed',
    difficulty: 'Beginner',
    summary: 'A high-throughput URL shortening service converting long URLs into compact aliases with fast redirects, analytics, and high availability.',
    readWriteRatio: '100:1 (Read-heavy)',
    requirements: [
      {
        id: 'req-1',
        text: 'Generate a short, unique alias (e.g. tinyurl.com/aB39kZ) for a given long URL.',
        category: 'functional',
        explanation: 'Core capability. The alias must be compact (typically 7 characters Base62).'
      },
      {
        id: 'req-2',
        text: 'Redirect users accessing short URL to original long URL with minimum latency (HTTP 301 vs 302).',
        category: 'functional',
        explanation: '301 is permanent redirect (browser caches it, saving server load but skipping analytics). 302 is temporary redirect (server receives all clicks for metrics).'
      },
      {
        id: 'req-3',
        text: 'Custom aliases and optional expiration date for links.',
        category: 'functional',
        explanation: 'Users can pick vanity URLs or let them expire after N months.'
      },
      {
        id: 'req-4',
        text: 'High Availability (99.999% uptime) is prioritized over strict consistency.',
        category: 'non-functional',
        explanation: 'If a newly created short link takes 1-2 seconds to propagate globally, it is acceptable. Downtime is not.'
      },
      {
        id: 'req-5',
        text: 'Read latency < 10ms (cached at CDN and Redis layer).',
        category: 'non-functional',
        explanation: 'Redirects must be near instantaneous.'
      },
      {
        id: 'req-6',
        text: 'Real-time click fraud detection & ML spam filtering.',
        category: 'out-of-scope',
        explanation: 'Good to mention in interview, but explicitly de-scope to save time for core architecture.'
      }
    ],
    math: {
      dau: 100_000_000,
      readsPerUserPerDay: 5,
      writesPerUserPerDay: 0.05,
      readPayloadBytes: 500,
      writePayloadBytes: 2_000,
      expectedReadQPS: 5800,
      expectedWriteQPS: 58,
      expectedDailyStorageGB: 10,
      expectedYearlyStorageTB: 3.65,
      expectedCacheRAMGB: 50,
      unitNotes: [
        '500M reads/day ÷ 86,400s ≈ 5,800 Read QPS (Peak: ~12,000 QPS)',
        '5M new URLs/day ÷ 86,400s ≈ 58 Write QPS (Peak: ~120 QPS)',
        'Each record: Hash (7B) + Long URL (500B) + CreatedAt (8B) + UserId (8B) ≈ 523 Bytes (~1KB with indexes)',
        '5M writes/day * 2KB = 10 GB/day = 3.65 TB/year = ~18.25 TB for 5 years',
        'Cache 20% hot links (80/20 Pareto Rule): 500M reads * 20% * 500B ≈ 50 GB RAM'
      ]
    },
    apiEndpoints: [
      {
        method: 'POST',
        path: '/api/v1/urls',
        description: 'Shorten a new long URL',
        params: '{ "long_url": "https://...", "custom_alias"?: "my-link", "expire_at"?: "2027-01-01T00:00:00Z" }',
        response: '201 Created: { "short_url": "https://tiny.url/x7K9pQ", "expires_at": "..." }'
      },
      {
        method: 'GET',
        path: '/{short_code}',
        description: 'Redirect to target destination URL',
        params: 'Path param: short_code (e.g. x7K9pQ)',
        response: '302 Found: Location: https://very-long-original-url.com'
      },
      {
        method: 'GET',
        path: '/api/v1/urls/{short_code}/stats',
        description: 'Retrieve click analytics and geographic stats',
        params: 'Path param: short_code',
        response: '200 OK: { "clicks": 14205, "countries": { "US": 8400, "IN": 3100 } }'
      }
    ],
    dataModel: [
      {
        table: 'urls',
        dbType: 'Distributed NoSQL Key-Value (DynamoDB / Cassandra) or Sharded MySQL',
        columns: [
          'short_code VARCHAR(7) PRIMARY KEY',
          'original_url VARCHAR(2048)',
          'user_id BIGINT',
          'created_at TIMESTAMP',
          'expires_at TIMESTAMP'
        ],
        indexingStrategy: 'Primary Key on short_code. Secondary index on user_id for user dashboard lookup.'
      },
      {
        table: 'url_clicks',
        dbType: 'ClickHouse / Apache Pinot (Columnar for analytics)',
        columns: [
          'click_id UUID PRIMARY KEY',
          'short_code VARCHAR(7)',
          'timestamp TIMESTAMP',
          'ip_address VARCHAR(45)',
          'country_code VARCHAR(2)',
          'referrer VARCHAR(512)'
        ],
        indexingStrategy: 'Partition by date(timestamp), Sort by (short_code, timestamp).'
      }
    ],
    architecture: {
      components: [
        {
          id: 'comp-1',
          name: 'Clients & Route 53 (Anycast DNS)',
          type: 'client',
          role: 'Resolves to nearest CDN Edge node with lowest latency.',
          details: ['GeoDNS routing', 'TLS termination']
        },
        {
          id: 'comp-2',
          name: 'Cloudflare / CloudFront CDN',
          type: 'cache',
          role: 'Caches the most frequent 302/301 redirects at edge locations worldwide.',
          details: ['Absorbs 80%+ of read redirects', 'Instant TTFB < 15ms']
        },
        {
          id: 'comp-3',
          name: 'Layer 7 Load Balancers (Envoy / ALB)',
          type: 'lb',
          role: 'Terminates SSL, health checks app servers, distributes HTTP traffic.',
          details: ['Round-robin / Least connections', 'Rate limiting shield']
        },
        {
          id: 'comp-4',
          name: 'URL Redirection Service (Stateless)',
          type: 'service',
          role: 'Serves redirect queries by checking Redis cache before DB.',
          details: ['Horizontally scalable', 'Emits async click events to Kafka']
        },
        {
          id: 'comp-5',
          name: 'Key Generation Service (KGS)',
          type: 'service',
          role: 'Pre-generates random 7-character Base62 keys in advance and stores them in memory & DB.',
          details: ['Avoids runtime hash collisions', 'Distributes key batches to app servers']
        },
        {
          id: 'comp-6',
          name: 'Redis Cluster (Cache Layer)',
          type: 'cache',
          role: 'Stores hot short_code -> original_url mappings with LRU eviction.',
          details: ['Cache-Aside pattern', 'Memory: ~50 GB cluster']
        },
        {
          id: 'comp-7',
          name: 'Distributed Database (DynamoDB / Cassandra)',
          type: 'database',
          role: 'Persistent storage sharded by short_code hash.',
          details: ['High write throughput', 'Sub-10ms key-value lookups']
        },
        {
          id: 'comp-8',
          name: 'Kafka + Analytics Workers',
          type: 'queue',
          role: 'Decouples redirect path from heavy analytical processing.',
          details: ['Zero impact on redirect latency', 'Batched ingestion into ClickHouse']
        }
      ],
      edges: [
        { from: 'comp-1', to: 'comp-2', label: '1. User clicks short link', protocol: 'HTTPS' },
        { from: 'comp-2', to: 'comp-3', label: '2. CDN Cache Miss', protocol: 'HTTPS' },
        { from: 'comp-3', to: 'comp-4', label: '3. Forward request', protocol: 'HTTPS' },
        { from: 'comp-4', to: 'comp-6', label: '4. Check hot cache', protocol: 'TCP' },
        { from: 'comp-4', to: 'comp-7', label: '5. Query persistent DB on miss', protocol: 'TCP' },
        { from: 'comp-4', to: 'comp-8', label: '6. Stream click event', protocol: 'Async Queue' },
        { from: 'comp-5', to: 'comp-4', label: '7. Dispense unique Base62 tokens', protocol: 'gRPC' }
      ],
      summaryFlow: [
        'User requests short URL -> Hit CDN Edge (if cached, instant 302 redirect).',
        'On CDN miss -> Request hits ALB -> Forwarded to Redirection Web Node.',
        'Node queries Redis Cluster -> If found, returns 302 Found.',
        'If Redis miss -> Query Primary Database -> Store in Redis -> Return 302.',
        'Click event is pushed asynchronously to Kafka topic for batch aggregation.'
      ]
    },
    deepDives: [
      {
        id: 'dd-1',
        question: 'How do you generate the 7-character short URL without collisions or concurrency bugs?',
        hint: 'Consider Base62 encoding (62^7 = ~3.5 trillion unique keys). What are the pros/cons of MD5 hash vs Key Generation Service (KGS)?',
        answer: 'Two main approaches: \n1. Hash-based (MD5/SHA256 of original URL + salt, taking first 7 Base62 chars): Causes collision risks under high concurrency, requiring retry loops.\n2. Key Generation Service (KGS - Recommended): A dedicated service pre-computes unique 7-char Base62 keys in the background and stores them in two tables: unused_keys and used_keys. When an app server needs keys, KGS assigns a batch of 1,000 keys to memory. If an app server crashes, unused keys in that batch are discarded (negligible loss out of 3.5 trillion). This guarantees ZERO collisions and sub-millisecond writes.',
        bestPractices: [
          'Use ZooKeeper or Raft to coordinate key batches between KGS instances.',
          'Pre-generate keys into memory rings for zero-disk latency.'
        ],
        keyTradeoff: 'Pre-generating keys uses a small amount of disk storage (~25GB for 3.5B keys) in exchange for zero runtime collision detection overhead.'
      },
      {
        id: 'dd-2',
        question: 'Should we return HTTP 301 Permanent Redirect or HTTP 302 Temporary Redirect?',
        hint: 'Think about browser caching vs server-side analytics accuracy.',
        answer: 'HTTP 301 tells the browser to permanently cache the redirect. Subsequent clicks bypass your servers entirely and go straight to the destination, saving infrastructure cost. However, you completely lose click analytics (visitor count, referrers, device metrics). HTTP 302 forces all clicks to hit your server first, allowing accurate analytics at the cost of handling all traffic. Hybrid choice: Use 302 for links with active analytics; 301 for expired or archival links.',
        bestPractices: [
          'Default to HTTP 302 Found for business links requiring analytics.',
          'Send cache-control: private, max-age=60 to prevent stampede while still logging clicks.'
        ],
        keyTradeoff: '301 saves server compute but destroys click tracking; 302 captures every click but increases ingress QPS.'
      },
      {
        id: 'dd-3',
        question: 'How do you handle a "Hot Link" (e.g. Elon Musk tweets a tinyurl link causing 500,000 clicks/sec)?',
        hint: 'Cache stampede (thundering herd), multi-level caching, CDN edge replication.',
        answer: '1. Multi-tier caching: Push hot links to CDN Edge (Cloudflare Workers / Akamai) so 99% of requests never touch your backend.\n2. Local in-memory LRU cache on application nodes (Guava / Go sync.Map) with 5-second TTL to protect Redis.\n3. Mutex locking (Singleflight pattern): When a cache miss occurs for a key, only one worker thread queries the database while other requests wait, preventing cache stampede.\n4. Redis read replicas behind a consistent hashing ring.',
        bestPractices: [
          'Enable Singleflight / Mutex locking on cache miss.',
          'Leverage CDN Edge Workers to serve cached redirects with <15ms latency.'
        ],
        keyTradeoff: 'Edge caching introduces 10-60 second delay before link updates/deletions propagate globally.'
      }
    ]
  },
  {
    id: 'rate-limiter',
    title: 'Design a Distributed Rate Limiter',
    category: 'Core Distributed',
    difficulty: 'Intermediate',
    summary: 'A high-performance distributed rate limiter to protect public APIs from abuse, DDoS attacks, brute-force attempts, and resource starvation.',
    readWriteRatio: '1:1 (Every incoming request checks and updates quota)',
    requirements: [
      {
        id: 'rl-1',
        text: 'Accurately throttle incoming requests based on IP, API Key, or User ID.',
        category: 'functional',
        explanation: 'Return HTTP 429 Too Many Requests when rate exceeds configured limit.'
      },
      {
        id: 'rl-2',
        text: 'Return standard rate-limiting HTTP headers (X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset).',
        category: 'functional',
        explanation: 'Helps API clients implement exponential backoff.'
      },
      {
        id: 'rl-3',
        text: 'Support multiple tiers and rules (e.g. Free: 100 req/min, Premium: 10,000 req/min).',
        category: 'functional',
        explanation: 'Dynamic configuration loading.'
      },
      {
        id: 'rl-4',
        text: 'Ultra-low latency overhead (< 1-2 ms per API call).',
        category: 'non-functional',
        explanation: 'Rate limiter sits directly on the critical path of every API request.'
      },
      {
        id: 'rl-5',
        text: 'High Availability & Graceful degradation (Fail-open vs Fail-closed).',
        category: 'non-functional',
        explanation: 'If rate limiter cluster dies, critical services should still function (fail-open).'
      }
    ],
    math: {
      dau: 50_000_000,
      readsPerUserPerDay: 20,
      writesPerUserPerDay: 20,
      readPayloadBytes: 200,
      writePayloadBytes: 200,
      expectedReadQPS: 11500,
      expectedWriteQPS: 11500,
      expectedDailyStorageGB: 12,
      expectedYearlyStorageTB: 0,
      expectedCacheRAMGB: 16,
      unitNotes: [
        '50M users * 20 calls/day = 1 Billion API requests/day',
        '1,000,000,000 ÷ 86,400 ≈ 11,574 QPS average (Peak: ~35,000 QPS)',
        'Each rate limit tracker key in Redis: key (user:12345), counter (4B), timestamp (8B) ≈ 64 bytes with overhead',
        '50M active keys * 64 bytes = ~3.2 GB RAM in Redis',
        'With 3x safety margin and sliding window log: ~16 GB Redis cluster handles all traffic with sub-millisecond execution.'
      ]
    },
    apiEndpoints: [
      {
        method: 'POST',
        path: '/api/v1/check-rate-limit',
        description: 'Internal RPC called by API Gateway for every incoming request',
        params: '{ "client_id": "usr_9981", "cost": 1, "tier": "premium" }',
        response: '200 OK: { "allowed": true, "remaining": 999, "reset_epoch": 1780000000 } or 429 Too Many Requests'
      }
    ],
    dataModel: [
      {
        table: 'rate_limit_rules',
        dbType: 'PostgreSQL or Redis Hash (Cached in memory with local TTL)',
        columns: [
          'rule_id VARCHAR(64) PRIMARY KEY',
          'tier VARCHAR(32)',
          'max_requests INT',
          'window_seconds INT'
        ],
        indexingStrategy: 'Cached inside API Gateway memory, reloaded via Pub/Sub on configuration updates.'
      },
      {
        table: 'client_quota',
        dbType: 'Redis Sorted Set (ZSET) or Redis Hash',
        columns: [
          'Key: rate:{client_id}:{endpoint}',
          'Score: timestamp in milliseconds',
          'Value: unique request ID / counter'
        ],
        indexingStrategy: 'ZADD and ZREMRANGEBYSCORE executed atomically in Redis Lua script.'
      }
    ],
    architecture: {
      components: [
        {
          id: 'rl-c1',
          name: 'Clients (Web/Mobile Apps)',
          type: 'client',
          role: 'Sends API requests with Authorization tokens.',
          details: ['Inspects 429 Retry-After headers', 'Backoff with jitter']
        },
        {
          id: 'rl-c2',
          name: 'API Gateway (Envoy / Kong / Zuul)',
          type: 'gateway',
          role: 'Intercepts requests, evaluates auth, and executes Rate Limit Filter.',
          details: ['Sidecar or embedded filter', 'Config cache in local memory']
        },
        {
          id: 'rl-c3',
          name: 'Rate Limiter Service / Cluster',
          type: 'service',
          role: 'Executes algorithm logic against Redis data structures.',
          details: ['Stateless', 'Uses Lua scripts for atomic increments']
        },
        {
          id: 'rl-c4',
          name: 'Redis Cluster (Memory Store)',
          type: 'cache',
          role: 'In-memory sorted sets / token counters sharded with consistent hashing.',
          details: ['Sub-millisecond latency', 'TTL auto-eviction of expired windows']
        },
        {
          id: 'rl-c5',
          name: 'Config Store & Admin Dashboard',
          type: 'database',
          role: 'Stores rate limit policies per tier.',
          details: ['Pub/Sub notifications when limits change']
        }
      ],
      edges: [
        { from: 'rl-c1', to: 'rl-c2', label: '1. API Request', protocol: 'HTTPS' },
        { from: 'rl-c2', to: 'rl-c3', label: '2. Check Quota (gRPC)', protocol: 'gRPC' },
        { from: 'rl-c3', to: 'rl-c4', label: '3. Atomic Lua Script', protocol: 'TCP' },
        { from: 'rl-c2', to: 'rl-c1', label: '4. 429 or Forward to Backend', protocol: 'HTTPS' }
      ],
      summaryFlow: [
        'Incoming request arrives at API Gateway.',
        'Gateway extracts client identifier (API token / IP / user ID).',
        'Gateway calls Rate Limiter filter with cost and client key.',
        'Redis runs atomic Lua script (Token Bucket or Sliding Window Counter).',
        'If quota allowed: Request proceeds to downstream backend services.',
        'If quota exceeded: Returns HTTP 429 with Retry-After and rate limit headers.'
      ]
    },
    deepDives: [
      {
        id: 'rldd-1',
        question: 'Compare the 4 rate limiting algorithms: Token Bucket, Leaky Bucket, Fixed Window, and Sliding Window Counter.',
        hint: 'Consider memory footprint, handling traffic bursts, and boundary conditions.',
        answer: '1. Token Bucket (Recommended for APIs): Tokens replenish at fixed rate up to capacity. Allows bursts up to bucket size, memory efficient (2 numbers: tokens, last_updated_time).\n2. Leaky Bucket: Requests enter FIFO queue and processed at constant rate. Smooths out traffic (great for downstream stability), but bursts are delayed.\n3. Fixed Window Counter: Simple counter resets every minute. Problem: 2x burst at window boundaries (e.g. 100 requests at 00:59 and 100 at 01:00 = 200 requests within 2 seconds).\n4. Sliding Window Counter (Best balance): Combines previous window count and current window count based on current timestamp overlap. Memory efficient (~64 bytes) and smooths boundary bursts.',
        bestPractices: [
          'Use Token Bucket or Sliding Window Counter for general API gateways.',
          'Use Leaky Bucket when downstream dependencies are fragile and cannot tolerate bursts.'
        ],
        keyTradeoff: 'Sliding Window Log requires storing timestamps of all requests (high memory); Sliding Window Counter approximates by interpolating between two windows with 99.9% accuracy and minimal RAM.'
      },
      {
        id: 'rldd-2',
        question: 'How do you prevent race conditions when multiple API instances query Redis concurrently?',
        hint: 'Think about Read-Modify-Write cycles. Lua scripts vs Redis Locks.',
        answer: 'If two requests check remaining quota concurrently, both might read `counter = 99` (limit 100) and both increment to 100, letting 101 requests through. Solution:\n1. Redis Lua Script (Best): Redis executes Lua scripts single-threaded and atomically. All logic (get time, clean old entries, check size, add entry) runs in one atomic script without multi-step round trips.\n2. Avoid Distributed Locks: Redlock or distributed mutexes add unnecessary latency (several ms) and risk deadlocks.',
        bestPractices: [
          'Package your rate limit evaluation into an atomic Redis Lua script.',
          'Use Redis EVALSHA to execute pre-compiled scripts for speed.'
        ],
        keyTradeoff: 'Lua scripts run on the single Redis thread, so scripts must be ultra-fast (<0.2ms) to avoid blocking other Redis commands.'
      },
      {
        id: 'rldd-3',
        question: 'What happens if Redis dies? Fail-Open vs Fail-Closed?',
        hint: 'Business impact of outage vs security/DDoS considerations.',
        answer: 'For general user APIs: Fail-Open. It is better to temporarily allow excess traffic than to drop 100% of legitimate user requests. Fallback to a local in-memory rate limiter inside each API Gateway node.\nFor critical security endpoints (Login / Password Reset / Payment verification): Fail-Closed to prevent brute force or payment fraud attacks.',
        bestPractices: [
          'Implement circuit breakers with short timeouts (e.g. 5ms).',
          'Deploy Redis in Multi-AZ Sentinel or Cluster with auto-failover.'
        ],
        keyTradeoff: 'Fail-open risks system overload during DDoS; Fail-closed causes total site outage if rate limiter fails.'
      }
    ]
  },
  {
    id: 'twitter-newsfeed',
    title: 'Design Twitter / X Newsfeed System',
    category: 'Social & Feed',
    difficulty: 'Advanced',
    summary: 'A scalable feed generation system supporting millions of concurrent users posting tweets, following networks, and fetching real-time personalized timelines.',
    readWriteRatio: '100:1 (Read-heavy)',
    requirements: [
      {
        id: 'tw-1',
        text: 'Users can publish tweets (text, images, video links).',
        category: 'functional',
        explanation: 'Low latency publishing (< 200ms).'
      },
      {
        id: 'tw-2',
        text: 'Users can follow/unfollow other users.',
        category: 'functional',
        explanation: 'Graph relationship management.'
      },
      {
        id: 'tw-3',
        text: 'Generate Home Timeline containing tweets from followed users, sorted chronologically.',
        category: 'functional',
        explanation: 'Sub-100ms timeline retrieval.'
      },
      {
        id: 'tw-4',
        text: 'Handle Celebrities ("Hot Keys" / high fanout like 100M+ followers).',
        category: 'non-functional',
        explanation: 'A tweet by a celebrity must not crash or lag the fanout workers.'
      },
      {
        id: 'tw-5',
        text: 'High Availability & Eventual Consistency (slight timeline lag of a few seconds is acceptable).',
        category: 'non-functional',
        explanation: 'Users prefer seeing slightly delayed tweets over an error page.'
      }
    ],
    math: {
      dau: 300_000_000,
      readsPerUserPerDay: 20,
      writesPerUserPerDay: 1,
      readPayloadBytes: 15_000,
      writePayloadBytes: 500,
      expectedReadQPS: 69444,
      expectedWriteQPS: 3472,
      expectedDailyStorageGB: 150,
      expectedYearlyStorageTB: 54.7,
      expectedCacheRAMGB: 1800,
      unitNotes: [
        '300M DAU * 20 timeline visits = 6 Billion timeline reads/day ÷ 86,400 ≈ ~70,000 Read QPS (Peak: ~150,000 QPS)',
        '300M tweets/day ÷ 86,400 ≈ ~3,500 Write QPS (Peak: ~10,000 QPS)',
        'Each tweet metadata: 500 bytes (tweet_id, user_id, text, timestamp)',
        '300M * 500B = 150 GB text data per day = ~55 TB per year',
        'Timeline cache: Cache top 800 tweet IDs per active user (800 * 8 bytes ≈ 6.4 KB). 300M users * 6.4 KB ≈ 1.92 TB RAM in Redis cluster.'
      ]
    },
    apiEndpoints: [
      {
        method: 'POST',
        path: '/api/v1/tweets',
        description: 'Publish a new tweet',
        params: '{ "content": "Hello distributed systems!", "media_ids": [] }',
        response: '201 Created: { "tweet_id": "1892837491", "created_at": "..." }'
      },
      {
        method: 'GET',
        path: '/api/v1/feed/home',
        description: 'Fetch personalized home timeline with pagination cursor',
        params: '?cursor=1892837000&limit=20',
        response: '200 OK: { "tweets": [...], "next_cursor": "1892836500" }'
      }
    ],
    dataModel: [
      {
        table: 'tweets',
        dbType: 'Distributed Wide-Column / Relational (PostgreSQL / CockroachDB / Cassandra)',
        columns: [
          'tweet_id BIGINT PRIMARY KEY (Snowflake)',
          'author_id BIGINT',
          'content VARCHAR(280)',
          'media_urls TEXT[]',
          'created_at TIMESTAMP'
        ],
        indexingStrategy: 'Sharded by author_id or tweet_id. Secondary index on (author_id, created_at DESC).'
      },
      {
        table: 'followers_graph',
        dbType: 'Graph DB (Neo4j) or Sharded MySQL / Redis Graph',
        columns: [
          'follower_id BIGINT',
          'followee_id BIGINT',
          'created_at TIMESTAMP'
        ],
        indexingStrategy: 'Composite Primary Key (followee_id, follower_id) for fast fanout lookups.'
      },
      {
        table: 'user_timeline_cache',
        dbType: 'Redis Sorted Set (ZSET)',
        columns: [
          'Key: timeline:{user_id}',
          'Score: tweet_id (Snowflake contains timestamp)',
          'Member: tweet_id'
        ],
        indexingStrategy: 'ZREVRANGEBYSCORE with limit 20. Truncate list to 800 items using ZREMRANGEBYRANK.'
      }
    ],
    architecture: {
      components: [
        {
          id: 'tw-c1',
          name: 'Clients (Web & Mobile Apps)',
          type: 'client',
          role: 'Renders infinite scroll timelines and posts tweets.',
          details: ['Optimistic UI updates', 'Cursor-based pagination']
        },
        {
          id: 'tw-c2',
          name: 'API Gateway & Load Balancer',
          type: 'lb',
          role: 'Directs traffic to Tweet Service or Feed Service.',
          details: ['SSL termination', 'Path-based routing']
        },
        {
          id: 'tw-c3',
          name: 'Tweet Ingestion Service',
          type: 'service',
          role: 'Validates tweet, generates Snowflake ID, writes to DB, emits to Kafka.',
          details: ['Fast write acknowledgment', 'Zero blocking']
        },
        {
          id: 'tw-c4',
          name: 'Kafka Event Bus',
          type: 'queue',
          role: 'Buffers new tweet events for fanout workers.',
          details: ['Partitioned by author_id', 'Guaranteed persistence']
        },
        {
          id: 'tw-c5',
          name: 'Fanout Service (Worker Pool)',
          type: 'worker',
          role: 'Retrieves followers list and pushes tweet ID to follower Redis timelines.',
          details: ['Hybrid fanout logic', 'Skips celebrities']
        },
        {
          id: 'tw-c6',
          name: 'Redis Timeline Clusters',
          type: 'cache',
          role: 'Stores pre-computed sorted lists of tweet IDs per active user.',
          details: ['ZSET sorted by Snowflake ID', 'Caches top 800 items']
        },
        {
          id: 'tw-c7',
          name: 'Feed Aggregation Service',
          type: 'service',
          role: 'Merges pre-computed Redis timeline with real-time celebrity tweets on read.',
          details: ['Hydrates tweet content from Tweet Cache', 'Applies ranking']
        },
        {
          id: 'tw-c8',
          name: 'Primary Database & Object Storage',
          type: 'database',
          role: 'Persistent source of truth for tweets, media, and user graph.',
          details: ['S3 for photos/videos', 'CockroachDB / Cassandra for tweet metadata']
        }
      ],
      edges: [
        { from: 'tw-c1', to: 'tw-c2', label: '1. Post Tweet', protocol: 'HTTPS' },
        { from: 'tw-c2', to: 'tw-c3', label: '2. Ingest Tweet', protocol: 'HTTPS' },
        { from: 'tw-c3', to: 'tw-c8', label: '3. Persist Tweet', protocol: 'TCP' },
        { from: 'tw-c3', to: 'tw-c4', label: '4. Publish Event', protocol: 'Async Queue' },
        { from: 'tw-c4', to: 'tw-c5', label: '5. Consume for Fanout', protocol: 'Async Queue' },
        { from: 'tw-c5', to: 'tw-c6', label: '6. Push to Follower Timelines', protocol: 'TCP' },
        { from: 'tw-c1', to: 'tw-c7', label: '7. Fetch Timeline', protocol: 'HTTPS' },
        { from: 'tw-c7', to: 'tw-c6', label: '8. Read pre-computed Feed', protocol: 'TCP' }
      ],
      summaryFlow: [
        'User publishes tweet -> Tweet Service saves to DB and publishes to Kafka.',
        'Fanout Worker checks author follower count: If regular user (< 20,000 followers), Fanout-on-Write pushes tweet ID to all follower Redis timelines.',
        'If Celebrity (> 20,000 followers), skip Fanout-on-Write to prevent write amplification.',
        'When a user opens app -> Feed Service fetches their Redis timeline and merges with recent tweets of any celebrities they follow (Fanout-on-Read).',
        'Tweet metadata is hydrated in bulk using Redis MGET, returning the assembled timeline in < 50ms.'
      ]
    },
    deepDives: [
      {
        id: 'twdd-1',
        question: 'Fanout-on-Write (Push) vs Fanout-on-Read (Pull): Why is a Hybrid approach essential?',
        hint: 'Calculate write amplification for a celebrity with 100 million followers.',
        answer: '• Fanout-on-Write (Push): When User A posts, write to all followers\' timeline caches immediately. Read is ultra-fast O(1), but writing becomes disastrous when a celebrity with 100M followers posts (100 million Redis writes!).\n• Fanout-on-Read (Pull): Don\'t write to follower caches on post. When user opens app, query all people they follow, sort and merge. Write is O(1), but read becomes excruciatingly slow O(N log N) if you follow 1,000 active users.\n• Hybrid Solution (Twitter\'s Architecture): Use Push for normal users (< 20k followers). For celebrities (> 20k followers), do NOT fan out. Instead, when a follower requests their feed, fetch their pre-computed Push timeline and merge it with the celebrity\'s tweets on the fly.',
        bestPractices: [
          'Mark accounts with > 20,000 followers with a celebrity flag.',
          'Only fan out to active users who logged in within the past 14 days.'
        ],
        keyTradeoff: 'Hybrid model adds code complexity in the feed merge layer, but guarantees bounded write latency and sub-50ms read latency.'
      },
      {
        id: 'twdd-2',
        question: 'Why is Twitter Snowflake ID used instead of UUID or auto-incrementing database IDs?',
        hint: 'Consider chronological sorting, 64-bit size, and decentralized generation.',
        answer: '1. Naturally Time-Ordered: 41 bits for epoch timestamp in ms + 10 bits machine ID + 12 bits sequence number. Sorting by Snowflake ID automatically sorts by creation time without querying timestamps!\n2. Fits in 64-bit integer (BIGINT): Indexed easily in B-Trees, compact compared to 128-bit UUID strings.\n3. Decentralized: Up to 1,024 independent server instances can generate unique IDs concurrently without inter-server network coordination or database locks (up to 4,096 IDs/ms per machine).',
        bestPractices: [
          'Use 64-bit Snowflake IDs as Primary Keys for all time-series entities.',
          'Synchronize machine clocks with NTP to prevent clock drift issues.'
        ],
        keyTradeoff: 'Requires NTP server monitoring; if system clock moves backwards, ID generation must wait or fail.'
      }
    ]
  },
  {
    id: 'whatsapp-chat',
    title: 'Design WhatsApp / Slack Real-Time Chat',
    category: 'Real-Time',
    difficulty: 'Advanced',
    summary: 'A secure, bidirectional real-time messaging architecture supporting 1-on-1 conversations, group chats, online presence, and offline message synchronization.',
    readWriteRatio: '1:1 (Every sent message is read by recipients)',
    requirements: [
      {
        id: 'wa-1',
        text: 'Real-time 1-on-1 and Group messaging with ultra-low latency (< 100ms).',
        category: 'functional',
        explanation: 'Persistent bidirectional connection (WebSockets).'
      },
      {
        id: 'wa-2',
        text: 'Message Delivery Receipts: Sent (✓), Delivered (✓✓), Read (blue ✓✓).',
        category: 'functional',
        explanation: 'State machine for message acknowledgment.'
      },
      {
        id: 'wa-3',
        text: 'Offline message storage and instant sync upon reconnection.',
        category: 'functional',
        explanation: 'Queue messages until recipient device reconnects.'
      },
      {
        id: 'wa-4',
        text: 'End-to-End Encryption (E2EE) and privacy.',
        category: 'non-functional',
        explanation: 'Server acts as an encrypted packet relay; cannot read message payload.'
      },
      {
        id: 'wa-5',
        text: 'Presence Status (Online / Last seen at...).',
        category: 'functional',
        explanation: 'Heartbeat mechanism over existing connection.'
      }
    ],
    math: {
      dau: 500_000_000,
      readsPerUserPerDay: 50,
      writesPerUserPerDay: 50,
      readPayloadBytes: 200,
      writePayloadBytes: 200,
      expectedReadQPS: 289351,
      expectedWriteQPS: 289351,
      expectedDailyStorageGB: 5000,
      expectedYearlyStorageTB: 1825,
      expectedCacheRAMGB: 250,
      unitNotes: [
        '500M DAU * 50 messages/day = 25 Billion messages/day',
        '25,000,000,000 ÷ 86,400 ≈ ~290,000 msgs/second average (Peak: ~800,000 QPS)',
        'Concurrent open WebSocket connections: ~50M - 100M active connections at peak',
        'Each connection state in RAM: ~10 KB -> 100M * 10 KB ≈ 1 TB RAM across Gateway cluster (10,000 connections/server = 10k servers)',
        'Daily storage: 25B * 200 bytes = 5 TB/day (Temporary inbox queue; once delivered, WhatsApp deletes messages from server).'
      ]
    },
    apiEndpoints: [
      {
        method: 'POST',
        path: 'WebSocket: wss://chat.app/ws',
        description: 'Persistent duplex channel for sending/receiving frames',
        params: 'Protobuf payload: { "to": "usr_2", "msg_id": "9812", "encrypted_body": "...", "timestamp": 1780000000 }',
        response: 'Ack frame: { "msg_id": "9812", "status": "DELIVERED_TO_SERVER" }'
      }
    ],
    dataModel: [
      {
        table: 'user_sessions',
        dbType: 'Redis Key-Value Cluster',
        columns: [
          'Key: session:{user_id}',
          'Value: { "gateway_server_ip": "10.0.12.45", "socket_fd": 881, "last_heartbeat": 1780000021 }'
        ],
        indexingStrategy: 'Sub-millisecond lookup to route incoming message to recipient\'s current Gateway host.'
      },
      {
        table: 'messages_inbox',
        dbType: 'Apache Cassandra / ScyllaDB (Wide-column optimized for sequential writes)',
        columns: [
          'receiver_id BIGINT',
          'message_id TIMEUUID',
          'sender_id BIGINT',
          'encrypted_content BLOB',
          'status VARCHAR(16)'
        ],
        indexingStrategy: 'Partition Key: receiver_id, Clustering Key: message_id ASC. Allows sequential pull upon reconnection.'
      }
    ],
    architecture: {
      components: [
        {
          id: 'wa-c1',
          name: 'Mobile Clients (Android & iOS)',
          type: 'client',
          role: 'Maintains long-lived WebSocket connection with exponential reconnect.',
          details: ['Local SQLite database for chat history', 'Local key pair for E2EE Signal protocol']
        },
        {
          id: 'wa-c2',
          name: 'WebSocket Gateway Cluster',
          type: 'gateway',
          role: 'Maintains open TCP/WebSocket connections for 100M+ concurrent devices.',
          details: ['Erlang / Go / Netty high-concurrency servers', 'Registers session in Redis']
        },
        {
          id: 'wa-c3',
          name: 'Session & Routing Service (Redis Cluster)',
          type: 'cache',
          role: 'Tracks which Gateway host holds the active socket for each user ID.',
          details: ['In-memory mapping', 'Heartbeat TTL (30 seconds)']
        },
        {
          id: 'wa-c4',
          name: 'Message Routing & Delivery Engine',
          type: 'service',
          role: 'Dispatches message directly to recipient gateway, or enqueues if offline.',
          details: ['Handles ACK states', 'Message sequencing']
        },
        {
          id: 'wa-c5',
          name: 'Undelivered Message Store (Cassandra)',
          type: 'database',
          role: 'Buffers offline messages until recipient comes online; deletes once delivered.',
          details: ['LSM-Tree high write throughput', 'Auto-expires after 30 days']
        },
        {
          id: 'wa-c6',
          name: 'Push Notification Gateway (APNs / FCM)',
          type: 'service',
          role: 'Sends wake-up push notification when recipient socket is disconnected.',
          details: ['Apple APNs', 'Google Firebase Cloud Messaging']
        }
      ],
      edges: [
        { from: 'wa-c1', to: 'wa-c2', label: '1. Send Message frame', protocol: 'WebSocket' },
        { from: 'wa-c2', to: 'wa-c3', label: '2. Lookup recipient host', protocol: 'TCP' },
        { from: 'wa-c2', to: 'wa-c4', label: '3. Forward payload', protocol: 'gRPC' },
        { from: 'wa-c4', to: 'wa-c2', label: '4a. Recipient online: push down socket', protocol: 'TCP' },
        { from: 'wa-c4', to: 'wa-c5', label: '4b. Recipient offline: persist inbox', protocol: 'TCP' },
        { from: 'wa-c4', to: 'wa-c6', label: '4c. Trigger push notification', protocol: 'HTTPS' }
      ],
      summaryFlow: [
        'Sender sends message over active WebSocket to Gateway Server A.',
        'Server A queries Redis Session Registry to find Recipient B’s location.',
        'Case 1: Recipient B is online on Server B -> Forward message via gRPC to Server B -> Deliver down WebSocket to Recipient B.',
        'Recipient sends back ACK -> Delivered receipt (✓✓) sent back to Sender.',
        'Case 2: Recipient B is offline -> Message stored in Cassandra Inbox and FCM/APNs wake-up push notification is triggered.',
        'When Recipient B reconnects -> Batch pull all messages ordered by Message ID.'
      ]
    },
    deepDives: [
      {
        id: 'wadd-1',
        question: 'How do you guarantee message ordering in distributed real-time chat?',
        hint: 'Client-generated timestamps vs Server timestamps vs Cassandra clustering keys.',
        answer: 'Never rely on client device timestamps because phone clocks drift or can be manipulated. Solution:\n1. Server Assigns Monotonic IDs: Gateway generates a 64-bit Snowflake or time-ordered UUID upon arrival at server.\n2. Per-Chat Sequence Number: Maintain a continuous sequence counter per 1-on-1 or group conversation in Redis (`INCR chat:{id}:seq`).\n3. Storage: Cassandra clusters rows by `(chat_id, sequence_id ASC)` so queries always return messages in guaranteed sequential order, even if packets arrived out of order.',
        bestPractices: [
          'Client local DB sorts by sequence_id, not local arrival time.',
          'If client detects a missing sequence number (e.g. got #5 after #3), request backfill for #4.'
        ],
        keyTradeoff: 'Centralized sequence numbering requires a fast Redis counter, but completely eliminates out-of-order message display.'
      },
      {
        id: 'wadd-2',
        question: 'How to efficiently manage 100M+ online presence updates without bringing down the system?',
        hint: 'Think about fanout: if 500 friends go online/offline, how many presence updates happen?',
        answer: 'Naive approach: Broadcast presence change to all friends immediately. If 100M users reconnect each morning, broadcast fanout creates quadrillions of events! Solution:\n1. Heartbeat over WebSocket: Client sends a heartbeat ping every 30-60s. Gateway updates Redis key `user:{id}:last_seen` with 90s TTL.\n2. Pull-on-Open instead of Push: Do NOT push presence to friends until they actively open the chat window with that specific friend.\n3. Batching: For group chats, presence is polled every 10 seconds only for currently visible screen members.',
        bestPractices: [
          'Never fan out presence to entire contact list.',
          'Fetch presence on-demand when entering a chat conversation.'
        ],
        keyTradeoff: 'Presence indicators may lag by 30-60 seconds, but reduces network traffic by 98%.'
      }
    ]
  },
  {
    id: 'netflix-video',
    title: 'Design Netflix / YouTube Video Streaming',
    category: 'Streaming',
    difficulty: 'Advanced',
    summary: 'A global video-on-demand platform handling terabits/sec of media delivery, multi-bitrate transcoding pipelines, and content delivery networks (CDNs).',
    readWriteRatio: '1000:1 (Heavy video egress)',
    requirements: [
      {
        id: 'nx-1',
        text: 'Upload video and transcode into multiple resolutions (4K, 1080p, 720p, 360p) and bitrates.',
        category: 'functional',
        explanation: 'Adaptive Bitrate Streaming (ABR) via HLS/DASH.'
      },
      {
        id: 'nx-2',
        text: 'Seamless video playback with buffer pre-loading and zero buffering during network drops.',
        category: 'functional',
        explanation: 'Dynamically switch resolution chunks on the fly.'
      },
      {
        id: 'nx-3',
        text: 'Serve petabytes of video traffic globally with lowest CDN egress cost.',
        category: 'non-functional',
        explanation: 'Multi-tier Open Connect appliance / CDN edge caching.'
      }
    ],
    math: {
      dau: 200_000_000,
      readsPerUserPerDay: 3,
      writesPerUserPerDay: 0.001,
      readPayloadBytes: 500_000_000,
      writePayloadBytes: 1_000_000_000,
      expectedReadQPS: 6944,
      expectedWriteQPS: 2,
      expectedDailyStorageGB: 100_000,
      expectedYearlyStorageTB: 36500,
      expectedCacheRAMGB: 50000,
      unitNotes: [
        'Average user watches 60 mins of video/day at 3 Mbps ≈ ~1.35 GB / user',
        '200M users * 1.35 GB = 270 Petabytes streamed per day!',
        'Peak egress bandwidth: ~270 PB ÷ 86,400s ≈ ~25 Terabits / second',
        'Direct streaming from AWS S3 would cost tens of millions per month -> Dedicated ISP edge CDN nodes (Netflix Open Connect) required to serve 95% from local ISP caches.'
      ]
    },
    apiEndpoints: [
      {
        method: 'GET',
        path: '/api/v1/videos/{video_id}/manifest.m3u8',
        description: 'Fetch HLS master playlist containing available resolutions & bitrates',
        params: 'Path: video_id',
        response: '200 OK: Returns HLS Master Playlist containing resolution chunk URLs'
      }
    ],
    dataModel: [
      {
        table: 'video_metadata',
        dbType: 'PostgreSQL / DynamoDB',
        columns: [
          'video_id UUID PRIMARY KEY',
          'title VARCHAR(256)',
          'duration_seconds INT',
          'hls_manifest_url VARCHAR(512)',
          'status VARCHAR(32) (UPLOADED, PROCESSING, READY)'
        ],
        indexingStrategy: 'Primary key on video_id. Search index on title via Elasticsearch.'
      }
    ],
    architecture: {
      components: [
        {
          id: 'nx-c1',
          name: 'Player Client (TV, iPad, Phone)',
          type: 'client',
          role: 'Measures bandwidth, requests master manifest, and downloads 4-second .ts chunks.',
          details: ['Adaptive Bitrate (ABR) algorithm', 'Local playback buffer (30 seconds)']
        },
        {
          id: 'nx-c2',
          name: 'ISP Edge Caches (Open Connect / Cloudflare)',
          type: 'cache',
          role: 'Serves 95%+ of video chunks directly from appliances deployed inside ISP data centers.',
          details: ['Sub-10ms chunk delivery', 'Saves transit costs']
        },
        {
          id: 'nx-c3',
          name: 'API Gateway & Metadata Service',
          type: 'gateway',
          role: 'Handles authentication, user profiles, recommendations, and search.',
          details: ['Microservices architecture', 'Stateless REST']
        },
        {
          id: 'nx-c4',
          name: 'Video Transcoding Pipeline',
          type: 'worker',
          role: 'Splits raw uploaded video into chunks, encodes in parallel across GPU workers into multiple formats (H.264, AV1).',
          details: ['Distributed task queue (Temporal / SQS)', 'Outputs HLS .m3u8 playlists']
        },
        {
          id: 'nx-c5',
          name: 'Object Storage (AWS S3 / Cloud Storage)',
          type: 'storage',
          role: 'Origin storage holding raw master video assets and transcoded segments.',
          details: ['S3 Standard for hot catalog', 'S3 Glacier for raw archives']
        }
      ],
      edges: [
        { from: 'nx-c1', to: 'nx-c3', label: '1. Request Playback Manifest', protocol: 'HTTPS' },
        { from: 'nx-c1', to: 'nx-c2', label: '2. Download 4-sec video chunks', protocol: 'HTTPS' },
        { from: 'nx-c2', to: 'nx-c5', label: '3. Origin pull on CDN miss', protocol: 'HTTPS' },
        { from: 'nx-c4', to: 'nx-c5', label: '4. Upload transcoded segments', protocol: 'HTTPS' }
      ],
      summaryFlow: [
        'Content is uploaded -> Split into 4-second fragments -> Transcoded into multiple bitrates in parallel.',
        'HLS/DASH manifest file (.m3u8) generated listing all resolutions.',
        'Video chunks pre-seeded into global ISP edge caches overnight before release.',
        'Client player fetches master manifest, checks current WiFi/cellular bandwidth, and requests appropriate chunk resolution.',
        'If network drops, player seamlessly requests the next 4-second chunk at lower 720p/480p bitrate without pausing video playback.'
      ]
    },
    deepDives: [
      {
        id: 'nxdd-1',
        question: 'How does Adaptive Bitrate Streaming (ABR) work under the hood?',
        hint: 'Chunking, HLS/MPEG-DASH, and client-side bandwidth estimation heuristics.',
        answer: 'Raw video is sliced into small uniform chunks (typically 2 to 6 seconds each). Each chunk is encoded at 5-8 different bitrates (e.g. 4K at 15Mbps, 1080p at 5Mbps, 720p at 2.5Mbps, 360p at 500Kbps).\nThe client player runs an ABR algorithm that measures:\n1. Download speed of previous chunk.\n2. Current buffer fullness (e.g., 20 seconds buffered).\nIf buffer is full and speed is high, it upgrades next chunk to 4K. If WiFi drops and buffer dips below 5 seconds, it immediately requests the next chunk at 480p. The user experiences zero interruption or spinner.',
        bestPractices: [
          'Use 4-second chunks to balance encoding efficiency with adaptation responsiveness.',
          'Support both HLS (Apple) and MPEG-DASH (Android/Web).'
        ],
        keyTradeoff: 'Shorter chunks allow faster bitrate adaptation but increase HTTP request overhead and metadata manifest size.'
      }
    ]
  }
];
