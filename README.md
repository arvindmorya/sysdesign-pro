# SysDesign Pro 🚀
### Interactive System Design Interview Prep for iPad & Android

A responsive, touch-optimized Progressive Web App (PWA) designed to practice System Design interviews interactively on tablets (iPadOS) and mobile (Android/iOS).

---

## 📱 Features

1. **🎯 4-Step Interview Simulator**:
   - Step 1: **Scoping & Requirements** (Functional, Non-Functional, Out-of-Scope checklist)
   - Step 2: **Capacity Planning & Math** (DAU, Read/Write QPS, 5-year storage, 80/20 cache sizing)
   - Step 3: **Architecture & Contracts** (Pipeline flow diagram, REST/WebSocket API endpoints, Database schemas & indexing)
   - Step 4: **Deep Dive & Chaos Scenarios** (Hot keys, single points of failure, partition tolerance, cache stampede)
   - Pre-loaded case studies: **TinyURL**, **Distributed Rate Limiter**, **Twitter / X Newsfeed**, **WhatsApp Real-Time Chat**, and **Netflix Video Streaming**.

2. **📐 Interactive Architecture Canvas**:
   - Visual drag-and-drop / touch node placement (Clients, CDN, Load Balancers, Gateways, Redis, Postgres, Cassandra, Kafka, S3).
   - Dynamic node linking with bezier curves.
   - **Live Traffic Simulation**: Animate packet flows under Normal Traffic (1x), 10x Spike Traffic, or Chaos Outage Mode with real-time telemetry (QPS, Latency, Cache Hit %, Failure Rate).

3. **🧮 Capacity Math Arena**:
   - **Interactive Live Estimator**: Adjust sliders for DAU, operations/day, and record payload to view auto-calculated QPS, 5-year storage, and Redis RAM requirements.
   - **Interview Math Drills**: Multiple choice questions with step-by-step whiteboard derivations.
   - **Latency Numbers Every Programmer Should Know**: Visual comparison + human-time scale analogy.
   - **Powers of Two Table** ($2^{10}$ to $2^{50}$).

4. **⚖️ Trade-Off Arena**:
   - Real-world dilemma challenges (Financial Ledger, IoT 2M Writes/sec, Notification Fanout).
   - Side-by-side technology comparison matrices (SQL vs NoSQL, Kafka vs RabbitMQ vs SQS).

5. **🗂️ Active Recall Flashcards**:
   - Touch/mouse 3D flip cards with spaced repetition self-grading (Mastered vs Needs Review).
   - Covers PACELC, LSM vs B+ Trees, Cache Stampede, Consistent Hashing, Circuit Breakers, and Saga Patterns.

6. **📚 Quick Cheat Sheet**:
   - High Availability SLA Nines table (downtime/year).
   - Critical HTTP status codes in distributed systems (301 vs 302, 429, 502, 504).
   - CAP & PACELC breakdown.

---

## 🛠️ Quick Start

```bash
# Install dependencies
pnpm install

# Start local dev server with LAN network access for iPad / Android
pnpm dev
```

### Accessing on iPad / Android:
1. Ensure your Mac and your iPad/Android device are connected to the same Wi-Fi network.
2. The terminal will display your Local Area Network IP (e.g. `http://192.168.1.xxx:5173`).
3. Open Safari (on iPad) or Chrome (on Android) and navigate to that address.

### Installing as a Full-Screen Standalone App:
- **On iPad / iPhone (Safari)**:
  1. Tap the **Share** icon (square with upward arrow).
  2. Scroll down and tap **"Add to Home Screen"**.
  3. Launch SysDesign Pro from your home screen as a standalone app with no browser chrome!
- **On Android (Chrome)**:
  1. Tap the three dots (⋮) in the top-right corner.
  2. Tap **"Install app"** or **"Add to Home screen"**.
