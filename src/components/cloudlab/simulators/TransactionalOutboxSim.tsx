import React, { useState } from 'react';
import { 
  Database, 
  Layers, 
  Send, 
  Flame, 
  RotateCcw, 
  ArrowRight, 
  Server, 
  Radio
} from 'lucide-react';

interface OutboxRow {
  id: string;
  aggregateType: string;
  aggregateId: string;
  eventType: string;
  payload: string;
  processed: boolean;
  createdAt: string;
}

interface KafkaMessage {
  offset: number;
  topic: string;
  key: string;
  value: string;
  timestamp: string;
}

export const TransactionalOutboxSim: React.FC = () => {
  const [mode, setMode] = useState<'naive' | 'outbox'>('outbox');
  const [willCrash, setWillCrash] = useState<boolean>(true);
  
  // App state
  const [ordersDb, setOrdersDb] = useState<{ id: string; item: string; price: number; status: string }[]>([]);
  const [outboxTable, setOutboxTable] = useState<OutboxRow[]>([]);
  const [kafkaTopic, setKafkaTopic] = useState<KafkaMessage[]>([]);
  
  // Active animation state
  const [executingStep, setExecutingStep] = useState<number>(0);
  const [statusLog, setStatusLog] = useState<{ type: 'info' | 'success' | 'danger' | 'warning'; text: string }>({
    type: 'info',
    text: 'Select mode and click "Submit Order" to compare atomic consistency behaviors.'
  });

  const handleRunSimulation = () => {
    const orderId = `ord-${Math.floor(100 + Math.random() * 900)}`;
    const item = 'Cloud Compute Cluster Pass';
    const price = 89;

    setExecutingStep(1);
    setStatusLog({ type: 'info', text: `[Step 1]: Order Service receives order "${orderId}". Beginning execution...` });

    if (mode === 'naive') {
      // NAIVE DUAL-WRITE
      setTimeout(() => {
        // Substep 1: Write to SQL
        setOrdersDb((prev) => [...prev, { id: orderId, item, price, status: 'COMMITTED' }]);
        setExecutingStep(2);
        setStatusLog({ type: 'info', text: `[Step 2]: SQL DB INSERT into "orders" SUCCESSFUL! Committing transaction.` });

        setTimeout(() => {
          if (willCrash) {
            // CRASH BEFORE KAFKA!
            setExecutingStep(3);
            setStatusLog({
              type: 'danger',
              text: `🚨 [CATASTROPHIC DUAL-WRITE CRASH]: Node crashed or network failed BEFORE calling Kafka! DB has the order, but Kafka topic NEVER received the event! Inventory & Shipping will never ship the product!`
            });
          } else {
            // Kafka success
            setExecutingStep(4);
            setKafkaTopic((prev) => [
              ...prev,
              {
                offset: prev.length,
                topic: 'orders.v1',
                key: orderId,
                value: JSON.stringify({ event: 'OrderCreated', orderId, price }),
                timestamp: new Date().toLocaleTimeString()
              }
            ]);
            setStatusLog({
              type: 'success',
              text: `✅ [LUCKY EXECUTION]: Both DB insert and Kafka publish succeeded. (Warning: This was luck! In distributed systems, power cuts or OOM kills can happen at Step 3!)`
            });
          }
        }, 800);
      }, 700);

    } else {
      // TRANSACTIONAL OUTBOX PATTERN
      setTimeout(() => {
        setExecutingStep(2);
        setStatusLog({
          type: 'info',
          text: `[Step 2]: Opening SQL ACID Transaction: Inserting into "orders" AND "outbox" tables ATOMICALLY in a single commit!`
        });

        setTimeout(() => {
          const newOutboxRow: OutboxRow = {
            id: `out-${Date.now().toString().slice(-4)}`,
            aggregateType: 'Order',
            aggregateId: orderId,
            eventType: 'OrderCreated',
            payload: JSON.stringify({ orderId, item, price }),
            processed: false,
            createdAt: new Date().toLocaleTimeString()
          };

          // Atomic commit of BOTH tables
          setOrdersDb((prev) => [...prev, { id: orderId, item, price, status: 'COMMITTED' }]);
          setOutboxTable((prev) => [...prev, newOutboxRow]);

          if (willCrash) {
            setExecutingStep(3);
            setStatusLog({
              type: 'warning',
              text: `⚠️ [SERVICE CRASH OCCURRED]: Order Service died right after DB commit! BUT wait... the event is safely recorded in the "outbox" table! Watch CDC tailer recover it!`
            });

            // CDC Tailer / Debezium picks it up asynchronously!
            setTimeout(() => {
              setExecutingStep(4);
              setKafkaTopic((prev) => [
                ...prev,
                {
                  offset: prev.length,
                  topic: 'orders.v1',
                  key: orderId,
                  value: newOutboxRow.payload,
                  timestamp: new Date().toLocaleTimeString()
                }
              ]);
              setOutboxTable((prev) =>
                prev.map((r) => (r.id === newOutboxRow.id ? { ...r, processed: true } : r))
              );
              setStatusLog({
                type: 'success',
                text: `🎉 [GUARANTEED DELIVERY]: Debezium CDC read the PostgreSQL Write-Ahead Log (WAL), streamed to Kafka, and marked outbox row as processed! Zero data desynchronization!`
              });
            }, 1200);

          } else {
            // Normal CDC streaming
            setExecutingStep(4);
            setKafkaTopic((prev) => [
              ...prev,
              {
                offset: prev.length,
                topic: 'orders.v1',
                key: orderId,
                value: newOutboxRow.payload,
                timestamp: new Date().toLocaleTimeString()
              }
            ]);
            setOutboxTable((prev) =>
              prev.map((r) => (r.id === newOutboxRow.id ? { ...r, processed: true } : r))
            );
            setStatusLog({
              type: 'success',
              text: `✅ [OUTBOX SUCCESS]: Transaction committed atomically, Debezium streamed to Kafka topic seamlessly!`
            });
          }
        }, 800);
      }, 700);
    }
  };

  const handleReset = () => {
    setOrdersDb([]);
    setOutboxTable([]);
    setKafkaTopic([]);
    setExecutingStep(0);
    setStatusLog({ type: 'info', text: 'All database tables and Kafka topics cleared.' });
  };

  return (
    <div className="bg-[#0b101d] border border-slate-800 rounded-2xl p-5 shadow-2xl flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h3 className="text-lg font-bold text-white tracking-tight">Transactional Outbox Pattern vs. Dual-Write Trap</h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-violet-500/20 text-violet-400 border border-violet-500/40">
              Modern 2026 Core
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            See why calling Kafka right after a SQL DB commit is a catastrophic distributed anti-pattern, and how Outbox solves it.
          </p>
        </div>

        {/* Mode Selector Toggle */}
        <div className="flex items-center p-1 bg-slate-900 border border-slate-800 rounded-xl">
          <button
            onClick={() => { setMode('naive'); setExecutingStep(0); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              mode === 'naive' ? 'bg-rose-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            ❌ Naive Dual-Write
          </button>
          <button
            onClick={() => { setMode('outbox'); setExecutingStep(0); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              mode === 'outbox' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            ✅ Transactional Outbox + CDC
          </button>
        </div>
      </div>

      {/* Live Visual Flow Diagram */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {/* Component 1: Order Service */}
        <div className={`p-4 rounded-xl border flex flex-col gap-2 transition-all ${
          executingStep === 1 ? 'bg-indigo-950/60 border-indigo-500' : 'bg-[#070b14] border-slate-800'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase text-slate-400">Component 1</span>
            <Server className="w-4 h-4 text-indigo-400" />
          </div>
          <span className="text-sm font-bold text-white">Order Microservice</span>
          <span className="text-[11px] text-slate-400">
            {mode === 'naive' ? 'Attempts 2 separate network writes' : 'Atomic ACID commit to 2 tables'}
          </span>
        </div>

        {/* Component 2: Primary DB (Orders Table) */}
        <div className={`p-4 rounded-xl border flex flex-col gap-2 transition-all ${
          executingStep === 2 ? 'bg-emerald-950/60 border-emerald-500' : 'bg-[#070b14] border-slate-800'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase text-slate-400">Database 1</span>
            <Database className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-sm font-bold text-white">orders Table (SQL)</span>
          <span className="text-[11px] text-emerald-400 font-bold font-mono">{ordersDb.length} Orders Committed</span>
        </div>

        {/* Component 3: Outbox Table / CDC */}
        <div className={`p-4 rounded-xl border flex flex-col gap-2 transition-all ${
          mode === 'naive' ? 'opacity-30 border-dashed border-slate-800 bg-[#070b14]' :
          executingStep === 3 ? 'bg-amber-950/60 border-amber-500' : 'bg-[#070b14] border-slate-800'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase text-slate-400">Pattern Component</span>
            <Layers className="w-4 h-4 text-amber-400" />
          </div>
          <span className="text-sm font-bold text-white">outbox Table + Debezium</span>
          <span className="text-[11px] text-slate-400">
            {mode === 'naive' ? 'Not used in Naive mode' : `${outboxTable.length} Events captured in WAL`}
          </span>
        </div>

        {/* Component 4: Kafka Topic */}
        <div className={`p-4 rounded-xl border flex flex-col gap-2 transition-all ${
          executingStep === 4 ? 'bg-cyan-950/60 border-cyan-500' : 'bg-[#070b14] border-slate-800'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase text-slate-400">Event Stream</span>
            <Radio className="w-4 h-4 text-cyan-400" />
          </div>
          <span className="text-sm font-bold text-white">Kafka orders.v1 Topic</span>
          <span className="text-[11px] text-cyan-400 font-mono font-bold">{kafkaTopic.length} Messages Published</span>
        </div>
      </div>

      {/* Status Log Box */}
      <div className={`p-3.5 rounded-xl border flex items-start gap-3 text-xs leading-relaxed ${
        statusLog.type === 'danger' ? 'bg-rose-950/40 border-rose-500/50 text-rose-200' :
        statusLog.type === 'warning' ? 'bg-amber-950/40 border-amber-500/50 text-amber-200' :
        statusLog.type === 'success' ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200' :
        'bg-slate-900 border-slate-800 text-slate-300'
      }`}>
        <ArrowRight className="w-4 h-4 shrink-0 mt-0.5 text-indigo-400" />
        <div>
          <strong className="text-white block mb-0.5">Execution Step Telemetry:</strong>
          <span>{statusLog.text}</span>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={handleRunSimulation}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-md transition cursor-pointer active:scale-95"
        >
          <Send className="w-4 h-4" />
          <span>Submit New Order ($89.00)</span>
        </button>

        <label className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl text-xs text-slate-300 cursor-pointer">
          <input
            type="checkbox"
            checked={willCrash}
            onChange={(e) => setWillCrash(e.target.checked)}
            className="rounded accent-rose-500 w-4 h-4 cursor-pointer"
          />
          <span className="flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-rose-400" />
            Inject Service Crash / Network Failure Mid-Operation
          </span>
        </label>

        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700 transition cursor-pointer ml-auto"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Tables</span>
        </button>
      </div>

      {/* Data Inspections: Orders Table vs Outbox vs Kafka */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Table 1: SQL orders */}
        <div className="bg-[#070b14] border border-slate-800 rounded-xl p-3 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-2">
            <span className="font-semibold text-emerald-400 flex items-center gap-1">
              <Database className="w-3.5 h-3.5" /> orders Table
            </span>
            <span className="font-mono text-slate-500 text-[10px]">{ordersDb.length} rows</span>
          </div>
          <div className="max-h-36 overflow-y-auto flex flex-col gap-1 text-[11px] font-mono scrollbar-thin">
            {ordersDb.length === 0 ? (
              <span className="text-slate-600 text-center py-4">No rows</span>
            ) : (
              ordersDb.map((o) => (
                <div key={o.id} className="p-1.5 bg-slate-900 rounded border border-slate-800 flex justify-between">
                  <span className="text-white font-bold">{o.id}</span>
                  <span className="text-emerald-400">${o.price} ({o.status})</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Table 2: SQL outbox */}
        <div className="bg-[#070b14] border border-slate-800 rounded-xl p-3 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-2">
            <span className="font-semibold text-amber-400 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5" /> outbox Table
            </span>
            <span className="font-mono text-slate-500 text-[10px]">{outboxTable.length} rows</span>
          </div>
          <div className="max-h-36 overflow-y-auto flex flex-col gap-1 text-[11px] font-mono scrollbar-thin">
            {outboxTable.length === 0 ? (
              <span className="text-slate-600 text-center py-4">
                {mode === 'naive' ? 'N/A in Naive mode' : 'No rows'}
              </span>
            ) : (
              outboxTable.map((ob) => (
                <div key={ob.id} className="p-1.5 bg-slate-900 rounded border border-slate-800 flex justify-between">
                  <span className="text-amber-300 font-bold">{ob.eventType}</span>
                  <span className={ob.processed ? 'text-emerald-400 text-[10px]' : 'text-rose-400 text-[10px]'}>
                    {ob.processed ? 'PROCESSED' : 'PENDING WAL'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Table 3: Kafka Topic */}
        <div className="bg-[#070b14] border border-slate-800 rounded-xl p-3 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-2">
            <span className="font-semibold text-cyan-400 flex items-center gap-1">
              <Radio className="w-3.5 h-3.5" /> Kafka Topic (orders.v1)
            </span>
            <span className="font-mono text-slate-500 text-[10px]">{kafkaTopic.length} msgs</span>
          </div>
          <div className="max-h-36 overflow-y-auto flex flex-col gap-1 text-[11px] font-mono scrollbar-thin">
            {kafkaTopic.length === 0 ? (
              <span className="text-slate-600 text-center py-4">Topic is empty</span>
            ) : (
              kafkaTopic.map((msg) => (
                <div key={msg.offset} className="p-1.5 bg-slate-900 rounded border border-slate-800 flex justify-between">
                  <span className="text-cyan-300 font-bold">Offset #{msg.offset}</span>
                  <span className="text-slate-400 text-[10px]">{msg.key}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
