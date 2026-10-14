import type { LatencyMetric } from '../types/study';

export const LATENCY_METRICS: LatencyMetric[] = [
  {
    operation: 'L1 CPU Cache Reference',
    timeNs: 0.5,
    displayTime: '0.5 ns',
    category: 'cpu',
    description: 'Fastest memory access on modern CPU chips.'
  },
  {
    operation: 'Branch Mispredict',
    timeNs: 5,
    displayTime: '5 ns',
    category: 'cpu',
    description: 'CPU pipeline flush caused by incorrect conditional branch guess.'
  },
  {
    operation: 'L2 CPU Cache Reference',
    timeNs: 7,
    displayTime: '7 ns',
    category: 'cpu',
    description: 'Slightly larger, slightly slower on-chip cache (~14x slower than L1).'
  },
  {
    operation: 'Mutex Lock / Unlock',
    timeNs: 25,
    displayTime: '25 ns',
    category: 'cpu',
    description: 'Fast OS kernel/hardware synchronization primitive.'
  },
  {
    operation: 'Main Memory (RAM) Reference',
    timeNs: 100,
    displayTime: '100 ns',
    category: 'memory',
    description: 'Direct RAM bus read. ~200x slower than L1 cache.'
  },
  {
    operation: 'Compress 1KB with Zstandard',
    timeNs: 2_000,
    displayTime: '2.0 µs',
    category: 'cpu',
    description: 'In-memory data compression time.'
  },
  {
    operation: 'NVMe SSD Random Read',
    timeNs: 16_000,
    displayTime: '16 µs',
    category: 'storage',
    description: 'High-speed solid-state drive read. ~160x slower than RAM.'
  },
  {
    operation: 'Read 1 MB sequentially from Memory',
    timeNs: 250_000,
    displayTime: '250 µs',
    category: 'memory',
    description: 'High throughput sequential memory bandwidth (~4 GB/s).'
  },
  {
    operation: 'Round-trip within same Data Center',
    timeNs: 500_000,
    displayTime: '0.5 ms',
    category: 'network',
    description: 'Internal private fiber network latency between racks/hosts.'
  },
  {
    operation: 'Read 1 MB sequentially from NVMe SSD',
    timeNs: 1_000_000,
    displayTime: '1.0 ms',
    category: 'storage',
    description: 'Sequential read from modern enterprise flash drive.'
  },
  {
    operation: 'Mechanical HDD Seek',
    timeNs: 10_000_000,
    displayTime: '10 ms',
    category: 'storage',
    description: 'Physical disk arm movement. 100,000x slower than RAM!'
  },
  {
    operation: 'Cross-Continent Round-trip (US East to West)',
    timeNs: 60_000_000,
    displayTime: '60 ms',
    category: 'network',
    description: 'Fiber optics speed-of-light propagation across continental US.'
  },
  {
    operation: 'Trans-Atlantic Round-trip (US to Europe)',
    timeNs: 150_000_000,
    displayTime: '150 ms',
    category: 'network',
    description: 'Submarine fiber optic cable latency roundtrip.'
  }
];

export const POWERS_OF_TWO = [
  { power: '2^10', exact: '1,024', approx: '~1 Thousand (1 KB)', note: 'Kilobyte' },
  { power: '2^20', exact: '1,048,576', approx: '~1 Million (1 MB)', note: 'Megabyte' },
  { power: '2^30', exact: '1,073,741,824', approx: '~1 Billion (1 GB)', note: 'Gigabyte' },
  { power: '2^40', exact: '1,099,511,627,776', approx: '~1 Trillion (1 TB)', note: 'Terabyte' },
  { power: '2^50', exact: '1,125,899,906,842,624', approx: '~1 Quadrillion (1 PB)', note: 'Petabyte' }
];
