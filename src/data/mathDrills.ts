import type { MathDrillQuestion } from '../types/study';

export const MATH_DRILLS: MathDrillQuestion[] = [
  {
    id: 'drill-1',
    title: 'Storage Calculation for Photo Sharing Service',
    scenario: 'You are designing an Instagram-like service with 300 Million Daily Active Users (DAU).',
    question: 'If 10% of users upload 2 photos per day and each photo averages 2 MB, what is the annual storage required for raw photos?',
    options: [
      {
        label: 'A. ~43.8 Petabytes / year',
        value: '43.8 PB',
        isCorrect: true,
        explanation: '30M uploading users * 2 photos = 60M photos/day. 60M * 2 MB = 120,000,000 MB = 120 TB/day. 120 TB * 365 days = 43,800 TB = 43.8 PB/year.'
      },
      {
        label: 'B. ~4.38 Petabytes / year',
        value: '4.38 PB',
        isCorrect: false,
        explanation: 'Missing a factor of 10! Remember that 60M photos at 2 MB is 120 TB per day, not 12 TB.'
      },
      {
        label: 'C. ~219 Terabytes / year',
        value: '219 TB',
        isCorrect: false,
        explanation: 'Far too low. At 120 TB per day, one year requires over 43,000 TB.'
      },
      {
        label: 'D. ~438 Petabytes / year',
        value: '438 PB',
        isCorrect: false,
        explanation: 'Off by an order of magnitude.'
      }
    ],
    stepsFormula: [
      'Active uploaders: 300,000,000 * 10% = 30,000,000 users',
      'Daily photos uploaded: 30,000,000 * 2 = 60,000,000 photos / day',
      'Daily storage in MB: 60,000,000 * 2 MB = 120,000,000 MB',
      'Convert to TB: 120,000,000 MB ÷ 1,000,000 = 120 TB / day',
      'Yearly storage: 120 TB/day * 365 days = 43,800 TB ≈ 43.8 PB / year'
    ]
  },
  {
    id: 'drill-2',
    title: 'Average & Peak QPS for Global Messaging App',
    scenario: 'A chat service handles 5 Billion messages delivered per day worldwide.',
    question: 'What is the average messages-per-second (QPS) and the recommended capacity for peak traffic (assuming peak = 2.5x average)?',
    options: [
      {
        label: 'A. ~58,000 avg QPS | ~145,000 peak QPS',
        value: '58k / 145k',
        isCorrect: true,
        explanation: '5,000,000,000 messages ÷ 86,400 seconds ≈ 57,870 avg QPS. At 2.5x peak factor: 57,870 * 2.5 ≈ 144,675 peak QPS.'
      },
      {
        label: 'B. ~580,000 avg QPS | ~1,450,000 peak QPS',
        value: '580k / 1.45M',
        isCorrect: false,
        explanation: 'Remember: 1 day has roughly 86,400 seconds (or estimate ~100,000 seconds for quick mental math).'
      },
      {
        label: 'C. ~12,500 avg QPS | ~31,000 peak QPS',
        value: '12.5k / 31k',
        isCorrect: false,
        explanation: 'Underestimated. 5B / 86.4k is roughly 58k.'
      },
      {
        label: 'D. ~5,800 avg QPS | ~14,500 peak QPS',
        value: '5.8k / 14.5k',
        isCorrect: false,
        explanation: 'Divided by too many zeros. 5,000,000,000 / 86,400 ≈ 58,000.'
      }
    ],
    stepsFormula: [
      'Seconds in 1 day: 24 * 60 * 60 = 86,400 seconds (rule of thumb: ~8.6 * 10^4 s)',
      'Average QPS = 5,000,000,000 ÷ 86,400 ≈ 57,870 QPS',
      'Peak factor multiplier (typical interview standard: 2x - 3x)',
      'Peak QPS = 57,870 * 2.5 ≈ 144,675 QPS'
    ]
  },
  {
    id: 'drill-3',
    title: 'RAM Sizing with the 80/20 Pareto Principle',
    scenario: 'Your system receives 100 Million read requests per day. The total dataset is 50 TB, and each read query accesses a 1 KB record.',
    question: 'Using the 80/20 rule (20% of the daily read requests generate 80% of the traffic), how much RAM should you allocate to cache the hot data in Redis?',
    options: [
      {
        label: 'A. ~20 GB of RAM',
        value: '20 GB',
        isCorrect: true,
        explanation: 'Daily reads = 100M. 20% hot data = 20M unique records. 20M records * 1 KB = 20,000,000 KB = 20 GB of RAM.'
      },
      {
        label: 'B. ~10 TB of RAM',
        value: '10 TB',
        isCorrect: false,
        explanation: 'Do not take 20% of the total 50 TB database! The 80/20 rule caches 20% of daily accessed queries, not 20% of the entire historical database.'
      },
      {
        label: 'C. ~200 GB of RAM',
        value: '200 GB',
        isCorrect: false,
        explanation: '20M * 1KB is 20 GB, not 200 GB.'
      },
      {
        label: 'D. ~2 GB of RAM',
        value: '2 GB',
        isCorrect: false,
        explanation: '20M * 1KB is 20,000 MB = 20 GB.'
      }
    ],
    stepsFormula: [
      'Total daily read volume = 100,000,000 requests',
      'Pareto hot subset = 20% * 100M = 20,000,000 records',
      'Record size = 1 KB = 1,024 bytes',
      'Cache memory = 20,000,000 * 1 KB = 20,000,000 KB',
      'Convert to GB: 20,000,000 KB ÷ 1,000,000 = 20 GB RAM'
    ]
  }
];
