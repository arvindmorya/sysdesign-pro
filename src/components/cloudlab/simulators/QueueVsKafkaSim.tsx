import React, { useState } from 'react';
import { 
  Radio, 
  Layers, 
  Send, 
  Trash2, 
  History 
} from 'lucide-react';

interface QueueItem {
  id: string;
  payload: string;
  enqueuedAt: string;
}

interface KafkaEvent {
  offset: number;
  payload: string;
  timestamp: string;
}

export const QueueVsKafkaSim: React.FC = () => {
  // SQS / RabbitMQ state
  const [queueMessages, setQueueMessages] = useState<QueueItem[]>([
    { id: 'msg-1', payload: 'UserSignup: alice@work.com', enqueuedAt: '10:00:01' },
    { id: 'msg-2', payload: 'PaymentCharged: $49.00', enqueuedAt: '10:00:04' },
    { id: 'msg-3', payload: 'OrderPlaced: ord-101', enqueuedAt: '10:00:09' },
  ]);

  // Kafka Log state
  const [kafkaLog, setKafkaLog] = useState<KafkaEvent[]>([
    { offset: 0, payload: 'UserSignup: alice@work.com', timestamp: '10:00:01' },
    { offset: 1, payload: 'PaymentCharged: $49.00', timestamp: '10:00:04' },
    { offset: 2, payload: 'OrderPlaced: ord-101', timestamp: '10:00:09' },
    { offset: 3, payload: 'InvoiceGenerated: inv-55', timestamp: '10:00:15' },
    { offset: 4, payload: 'EmailDispatched: #209', timestamp: '10:00:20' }
  ]);
  const [paymentsOffset, setPaymentsOffset] = useState<number>(4);
  const [analyticsOffset, setAnalyticsOffset] = useState<number>(2);

  // Action: Ingest new event into BOTH
  const handleIngestEvent = () => {
    const id = `msg-${Math.floor(100 + Math.random() * 900)}`;
    const time = new Date().toLocaleTimeString();
    const eventName = `OrderPlaced: ord-${Math.floor(1000 + Math.random() * 9000)}`;

    // Add to SQS queue
    setQueueMessages((prev) => [...prev, { id, payload: eventName, enqueuedAt: time }]);

    // Append to Kafka commit log
    setKafkaLog((prev) => [...prev, { offset: prev.length, payload: eventName, timestamp: time }]);
  };

  // Action: Competing worker pops from SQS (Destructive!)
  const handleQueuePop = () => {
    if (queueMessages.length === 0) return;
    setQueueMessages((prev) => prev.slice(1));
  };

  // Action: Kafka consumer group advances offset
  const handleKafkaAdvance = (group: 'payments' | 'analytics') => {
    if (group === 'payments') {
      if (paymentsOffset < kafkaLog.length) {
        setPaymentsOffset((prev) => prev + 1);
      }
    } else {
      if (analyticsOffset < kafkaLog.length) {
        setAnalyticsOffset((prev) => prev + 1);
      }
    }
  };

  // Action: Replay Kafka history
  const handleKafkaRewind = () => {
    setAnalyticsOffset(0);
  };

  return (
    <div className="bg-[#0b101d] border border-slate-800 rounded-2xl p-5 shadow-2xl flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h3 className="text-lg font-bold text-white tracking-tight">Message Queue vs. Kafka Event Stream</h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-orange-500/20 text-orange-400 border border-orange-500/40">
              Video 12 & Streaming
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Compare ephemeral worker task queues (RabbitMQ / SQS) with append-only distributed commit logs (Apache Kafka).
          </p>
        </div>

        <button
          onClick={handleIngestEvent}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-md transition cursor-pointer active:scale-95 self-start sm:self-auto"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Ingest New Event ($100 Payment)</span>
        </button>
      </div>

      {/* Side-by-Side Visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SIDE A: Traditional Message Queue (RabbitMQ / SQS) */}
        <div className="bg-[#070b14] border border-slate-800 rounded-xl p-4 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div>
              <span className="font-bold text-sm text-amber-400 flex items-center gap-1.5">
                <Layers className="w-4 h-4" /> Message Queue (RabbitMQ / AWS SQS)
              </span>
              <span className="text-[11px] text-slate-400 block mt-0.5">
                Destructive Pop: Messages are permanently deleted once ACKed.
              </span>
            </div>
            <span className="text-xs font-mono text-slate-400">Depth: {queueMessages.length} msgs</span>
          </div>

          {/* Queue Visual Stack */}
          <div className="flex flex-col gap-1.5 min-h-[160px] bg-slate-950/80 p-3 rounded-lg border border-slate-800/80">
            <span className="text-[10px] uppercase font-bold text-slate-500">Queue Buffer (Head ➔ Tail):</span>
            {queueMessages.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-xs text-slate-600">
                Queue is empty (All messages processed & deleted).
              </div>
            ) : (
              queueMessages.map((msg, idx) => (
                <div
                  key={msg.id}
                  className={`p-2 rounded border flex items-center justify-between text-xs font-mono ${
                    idx === 0
                      ? 'bg-amber-950/40 border-amber-500/50 text-amber-200'
                      : 'bg-slate-900 border-slate-800 text-slate-300'
                  }`}
                >
                  <span className="truncate">{msg.payload}</span>
                  <span className="text-[10px] text-slate-500 shrink-0 ml-2">
                    {idx === 0 ? '👈 NEXT POP' : `#${idx + 1}`}
                  </span>
                </div>
              ))
            )}
          </div>

          {/* Competing Workers Action */}
          <div className="flex flex-col gap-2">
            <span className="text-xs text-slate-400 font-medium">Competing Consumers (Pull Model):</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                disabled={queueMessages.length === 0}
                onClick={() => handleQueuePop()}
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-amber-600/90 hover:bg-amber-500 disabled:opacity-30 disabled:cursor-not-allowed text-white text-xs font-medium transition cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Worker 1 Pop & ACK</span>
              </button>
              <button
                disabled={queueMessages.length === 0}
                onClick={() => handleQueuePop()}
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-amber-600/90 hover:bg-amber-500 disabled:opacity-30 disabled:cursor-not-allowed text-white text-xs font-medium transition cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Worker 2 Pop & ACK</span>
              </button>
            </div>
            <span className="text-[10px] text-slate-500 italic">
              Notice: Once consumed, the message is gone forever. Analytics cannot read past messages!
            </span>
          </div>
        </div>

        {/* SIDE B: Apache Kafka Distributed Commit Log */}
        <div className="bg-[#070b14] border border-slate-800 rounded-xl p-4 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div>
              <span className="font-bold text-sm text-cyan-400 flex items-center gap-1.5">
                <Radio className="w-4 h-4" /> Apache Kafka (Append-Only Log)
              </span>
              <span className="text-[11px] text-slate-400 block mt-0.5">
                Non-Destructive: Immutable log retained on disk with independent consumer offsets.
              </span>
            </div>
            <span className="text-xs font-mono text-cyan-400 font-bold">{kafkaLog.length} Records</span>
          </div>

          {/* Kafka Commit Log Visual Blocks */}
          <div className="flex flex-col gap-1.5 min-h-[160px] max-h-[190px] overflow-y-auto bg-slate-950/80 p-3 rounded-lg border border-slate-800/80 scrollbar-thin">
            <span className="text-[10px] uppercase font-bold text-slate-500">Partition 0 Log (Append-Only):</span>
            {kafkaLog.map((ev) => {
              const isPaymentsHere = paymentsOffset === ev.offset;
              const isAnalyticsHere = analyticsOffset === ev.offset;
              return (
                <div
                  key={ev.offset}
                  className="p-1.5 rounded bg-slate-900 border border-slate-800 flex items-center justify-between text-xs font-mono relative"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-400 font-bold text-[10px] border border-cyan-800/50">
                      [{ev.offset}]
                    </span>
                    <span className="text-slate-300 truncate text-[11px]">{ev.payload}</span>
                  </div>

                  {/* Offset Pointers */}
                  <div className="flex items-center gap-1 shrink-0">
                    {isPaymentsHere && (
                      <span className="px-1.5 py-0.2 rounded bg-indigo-600 text-white text-[9px] font-bold">
                        Payments Offset
                      </span>
                    )}
                    {isAnalyticsHere && (
                      <span className="px-1.5 py-0.2 rounded bg-emerald-600 text-white text-[9px] font-bold">
                        Analytics Offset
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Consumer Group Controls & Replay */}
          <div className="flex flex-col gap-2">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                disabled={paymentsOffset >= kafkaLog.length}
                onClick={() => handleKafkaAdvance('payments')}
                className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/90 hover:bg-indigo-500 disabled:opacity-30 disabled:cursor-not-allowed text-white font-medium transition cursor-pointer"
              >
                <span>Read Next (Payments)</span>
              </button>

              <button
                disabled={analyticsOffset >= kafkaLog.length}
                onClick={() => handleKafkaAdvance('analytics')}
                className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/90 hover:bg-emerald-500 disabled:opacity-30 disabled:cursor-not-allowed text-white font-medium transition cursor-pointer"
              >
                <span>Read Next (Analytics)</span>
              </button>
            </div>

            {/* Rewind & Replay Superpower */}
            <button
              onClick={handleKafkaRewind}
              className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-medium border border-cyan-500/30 transition cursor-pointer"
            >
              <History className="w-3.5 h-3.5 text-cyan-400" />
              <span>Rewind Analytics Offset to 0 (Replay Past Events!)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
