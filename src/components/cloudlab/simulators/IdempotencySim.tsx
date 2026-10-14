import React, { useState } from 'react';
import { 
  CreditCard, 
  Database, 
  RotateCcw, 
  CheckCircle2, 
  AlertTriangle, 
  WifiOff, 
  Key, 
  ArrowRight
} from 'lucide-react';

interface OrderRecord {
  id: string;
  orderNumber: number;
  idempotencyKey: string;
  amount: number;
  item: string;
  createdAt: string;
}

interface RedisKeyRecord {
  key: string;
  status: 'IN_PROGRESS' | 'COMPLETED';
  responsePayload: string;
  requestPayloadHash: string;
  ttlSeconds: number;
}

export const IdempotencySim: React.FC = () => {
  const [currentKey, setCurrentKey] = useState<string>('uuid-f47ac10b-58cc');
  const [orderAmount] = useState<number>(49.99);
  const [itemName] = useState<string>('Cloud Architecture Pro Course');
  const [simulateDrop, setSimulateDrop] = useState<boolean>(true);
  
  // State representations
  const [ordersDb, setOrdersDb] = useState<OrderRecord[]>([]);
  const [redisKeys, setRedisKeys] = useState<Record<string, RedisKeyRecord>>({});
  
  // Simulation step
  const [activeStep, setActiveStep] = useState<number>(0);
  const [stepMessage, setStepMessage] = useState<string>(
    'Ready. Click "Send Order" to simulate a mutating POST payment request.'
  );
  const [clientStatus, setClientStatus] = useState<{ status: 'idle' | 'success' | 'dropped' | 'rejected'; text: string }>({
    status: 'idle',
    text: 'Client awaiting action.'
  });

  const generateNewKey = () => {
    const randomHex = Math.random().toString(36).substring(2, 8);
    const newKey = `uuid-${randomHex}-${Date.now().toString().slice(-4)}`;
    setCurrentKey(newKey);
    setActiveStep(0);
    setStepMessage(`Generated brand new Idempotency-Key: ${newKey}`);
    setClientStatus({ status: 'idle', text: 'New client transaction intent prepared.' });
  };

  const handleExecuteRequest = (tampered = false) => {
    const payloadHash = tampered ? 'hash_tampered_9999' : `hash_${orderAmount}_${itemName}`;
    setActiveStep(1);
    setStepMessage(`[Step 1]: Client sends HTTP POST /orders with header "Idempotency-Key: ${currentKey}"`);

    setTimeout(() => {
      // Step 2: Gateway checks Redis
      setActiveStep(2);
      const existing = redisKeys[currentKey];

      if (existing) {
        // Key exists! Check for tampering
        if (existing.requestPayloadHash !== payloadHash) {
          setActiveStep(2);
          setStepMessage(`🚨 [409 CONFLICT]: Key "${currentKey}" exists, but request payload does NOT match previous hash! Tampering rejected.`);
          setClientStatus({ status: 'rejected', text: 'HTTP 409: Idempotency Key payload mismatch!' });
          return;
        }

        // Key already completed! Return cached response
        setActiveStep(4);
        setStepMessage(`⚡ [CACHE HIT]: Key "${currentKey}" was already executed. Returning cached 201 Created instantly without re-billing!`);
        setClientStatus({ status: 'success', text: `HTTP 201 Created (Returned from Redis Dedup Cache! Orders count unchanged: ${ordersDb.length})` });
        return;
      }

      // Step 3: Key does NOT exist -> Atomic Lock & Write DB
      setActiveStep(3);
      setStepMessage(`[Step 3]: First time seen! Gateway acquires atomic Redis lock: SET ${currentKey} IN_PROGRESS NX EX 86400. Writing to Orders DB...`);

      setTimeout(() => {
        // Insert into database
        const newOrder: OrderRecord = {
          id: Math.random().toString(36).substring(2, 9),
          orderNumber: ordersDb.length + 1001,
          idempotencyKey: currentKey,
          amount: orderAmount,
          item: itemName,
          createdAt: new Date().toLocaleTimeString()
        };
        const updatedDb = [...ordersDb, newOrder];
        setOrdersDb(updatedDb);

        // Update Redis with completed state and response payload
        const updatedRedis = {
          ...redisKeys,
          [currentKey]: {
            key: currentKey,
            status: 'COMPLETED' as const,
            responsePayload: JSON.stringify({ orderId: newOrder.id, status: 'paid', amount: newOrder.amount }),
            requestPayloadHash: payloadHash,
            ttlSeconds: 86400
          }
        };
        setRedisKeys(updatedRedis);

        // Step 4: Returning response
        if (simulateDrop) {
          setActiveStep(4);
          setStepMessage('⚠️ [NETWORK FAULT]: Server completed DB insert and cached response, BUT network cable/carrier dropped response before client received it!');
          setClientStatus({ 
            status: 'dropped', 
            text: 'Network Timeout / Connection Dropped! Client received NO confirmation (Thinks transaction failed!).' 
          });
        } else {
          setActiveStep(4);
          setStepMessage('✅ [SUCCESS]: HTTP 201 Created response received by client! Transaction finalized.');
          setClientStatus({ status: 'success', text: 'HTTP 201 Created: Order placed successfully.' });
        }
      }, 700);
    }, 700);
  };

  const handleReset = () => {
    setOrdersDb([]);
    setRedisKeys({});
    setActiveStep(0);
    setStepMessage('Simulator reset to initial clean state.');
    setClientStatus({ status: 'idle', text: 'Ready.' });
  };

  return (
    <div className="bg-[#0b101d] border border-slate-800 rounded-2xl p-5 shadow-2xl flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h3 className="text-lg font-bold text-white tracking-tight">Idempotency & Exactly-Once Flow</h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-400 border border-indigo-500/40">
              CRUD Resilience
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Simulate what happens when network failures drop the server's reply. Watch the client retry safely without duplicate charges.
          </p>
        </div>

        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition cursor-pointer self-start sm:self-auto border border-slate-700"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset All State</span>
        </button>
      </div>

      {/* Visual Step-by-Step Architecture Pipeline */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 relative">
        {/* Step Node 1: Client */}
        <div className={`p-4 rounded-xl border flex flex-col gap-2 transition-all duration-200 ${
          activeStep === 1 ? 'bg-indigo-950/60 border-indigo-500 ring-2 ring-indigo-500/30' : 'bg-[#070b14] border-slate-800'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase text-slate-400">Step 1: Origin</span>
            <CreditCard className="w-4 h-4 text-indigo-400" />
          </div>
          <span className="text-sm font-bold text-white">Client App</span>
          <div className="bg-slate-950/80 p-2 rounded border border-slate-800 text-[10px] font-mono text-slate-300">
            <div>Idempotency-Key:</div>
            <div className="text-indigo-400 truncate">{currentKey}</div>
          </div>
        </div>

        {/* Step Node 2: Gateway + Redis Lock */}
        <div className={`p-4 rounded-xl border flex flex-col gap-2 transition-all duration-200 ${
          activeStep === 2 ? 'bg-violet-950/60 border-violet-500 ring-2 ring-violet-500/30' : 'bg-[#070b14] border-slate-800'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase text-slate-400">Step 2: Dedup Check</span>
            <Key className="w-4 h-4 text-violet-400" />
          </div>
          <span className="text-sm font-bold text-white">Redis Dedup Lock</span>
          <div className="bg-slate-950/80 p-2 rounded border border-slate-800 text-[10px] font-mono text-slate-300">
            <div>Atomic Command:</div>
            <div className="text-violet-400">SET key NX EX 86400</div>
          </div>
        </div>

        {/* Step Node 3: Primary Database */}
        <div className={`p-4 rounded-xl border flex flex-col gap-2 transition-all duration-200 ${
          activeStep === 3 ? 'bg-emerald-950/60 border-emerald-500 ring-2 ring-emerald-500/30' : 'bg-[#070b14] border-slate-800'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase text-slate-400">Step 3: Mutating Op</span>
            <Database className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-sm font-bold text-white">Orders Database</span>
          <div className="bg-slate-950/80 p-2 rounded border border-slate-800 text-[10px] font-mono text-slate-300">
            <div>Total Committed Rows:</div>
            <div className="text-emerald-400 font-bold text-sm">{ordersDb.length} Orders</div>
          </div>
        </div>

        {/* Step Node 4: Network Response */}
        <div className={`p-4 rounded-xl border flex flex-col gap-2 transition-all duration-200 ${
          activeStep === 4 ? 'bg-cyan-950/60 border-cyan-500 ring-2 ring-cyan-500/30' : 'bg-[#070b14] border-slate-800'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase text-slate-400">Step 4: Response</span>
            {simulateDrop ? <WifiOff className="w-4 h-4 text-rose-400" /> : <CheckCircle2 className="w-4 h-4 text-cyan-400" />}
          </div>
          <span className="text-sm font-bold text-white">Network Return</span>
          <div className="bg-slate-950/80 p-2 rounded border border-slate-800 text-[10px] font-mono text-slate-300">
            <div>Result:</div>
            <div className={simulateDrop && activeStep === 4 ? 'text-rose-400 font-bold' : 'text-cyan-400'}>
              {simulateDrop && activeStep === 4 ? 'DROP IN TRANSIT' : 'HTTP 201 Delivered'}
            </div>
          </div>
        </div>
      </div>

      {/* Live Step Explanation Callout */}
      <div className={`p-3.5 rounded-xl border flex items-start gap-3 text-xs leading-relaxed transition-all duration-200 ${
        clientStatus.status === 'dropped' ? 'bg-rose-950/40 border-rose-500/40 text-rose-200' :
        clientStatus.status === 'success' ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200' :
        clientStatus.status === 'rejected' ? 'bg-amber-950/40 border-amber-500/40 text-amber-200' :
        'bg-slate-900 border-slate-800 text-slate-300'
      }`}>
        <ArrowRight className="w-4 h-4 shrink-0 mt-0.5 text-indigo-400" />
        <div>
          <strong className="text-white block mb-0.5">Workflow Execution Telemetry:</strong>
          <span>{stepMessage}</span>
        </div>
      </div>

      {/* Controls & Scenarios */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <button
          onClick={() => handleExecuteRequest(false)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-md shadow-indigo-950 transition cursor-pointer active:scale-95"
        >
          <CreditCard className="w-4 h-4" />
          <span>Execute POST /orders</span>
        </button>

        <button
          onClick={() => handleExecuteRequest(false)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600/90 hover:bg-amber-500 text-white font-medium text-xs shadow-md shadow-amber-950 transition cursor-pointer active:scale-95"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Client Retry (Same Key)</span>
        </button>

        <button
          onClick={() => handleExecuteRequest(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600/90 hover:bg-purple-500 text-white font-medium text-xs shadow-md shadow-purple-950 transition cursor-pointer active:scale-95"
          title="Send same UUID key with tampered amount to trigger 409 Conflict"
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Tamper Payload (Same Key)</span>
        </button>

        <button
          onClick={generateNewKey}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs border border-slate-700 transition cursor-pointer active:scale-95"
        >
          <Key className="w-4 h-4" />
          <span>New UUID Key</span>
        </button>
      </div>

      {/* Options: Drop Response Toggle */}
      <div className="flex items-center gap-3 bg-slate-900/50 p-3 rounded-xl border border-slate-800 text-xs">
        <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
          <input
            type="checkbox"
            checked={simulateDrop}
            onChange={(e) => setSimulateDrop(e.target.checked)}
            className="rounded accent-indigo-500 w-4 h-4 cursor-pointer"
          />
          <span>Simulate Network Packet Drop on Server's Response (Triggers Client Retry)</span>
        </label>
      </div>

      {/* Side-by-Side Data State: Redis Keys vs DB Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Box A: Redis Deduplication Table */}
        <div className="bg-[#070b14] border border-slate-800 rounded-xl p-3 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-2">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-violet-400" />
              Redis Deduplication Store (In-Memory)
            </span>
            <span className="font-mono text-slate-500">{Object.keys(redisKeys).length} Keys</span>
          </div>

          <div className="max-h-40 overflow-y-auto pr-1 flex flex-col gap-1.5 text-xs font-mono scrollbar-thin">
            {Object.keys(redisKeys).length === 0 ? (
              <span className="text-slate-600 text-center py-4">No deduplication keys registered yet.</span>
            ) : (
              Object.values(redisKeys).map((rec) => (
                <div key={rec.key} className="bg-slate-900/80 p-2 rounded border border-slate-800 flex flex-col gap-1 text-[11px]">
                  <div className="flex items-center justify-between">
                    <span className="text-indigo-400 font-bold truncate max-w-[200px]">{rec.key}</span>
                    <span className="text-emerald-400 px-1.5 py-0.2 bg-emerald-950/40 rounded border border-emerald-500/30 text-[10px]">
                      {rec.status}
                    </span>
                  </div>
                  <span className="text-slate-400 truncate">Payload Hash: {rec.requestPayloadHash}</span>
                  <span className="text-slate-500 text-[10px]">TTL: {rec.ttlSeconds}s (Auto-deleted after expiry)</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Box B: Database Orders Table */}
        <div className="bg-[#070b14] border border-slate-800 rounded-xl p-3 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-2">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              Orders Database (Committed Records)
            </span>
            <span className="font-mono text-emerald-400 font-bold">{ordersDb.length} Total Orders</span>
          </div>

          <div className="max-h-40 overflow-y-auto pr-1 flex flex-col gap-1.5 text-xs font-mono scrollbar-thin">
            {ordersDb.length === 0 ? (
              <span className="text-slate-600 text-center py-4">Database table is empty.</span>
            ) : (
              ordersDb.map((order) => (
                <div key={order.id} className="bg-slate-900/80 p-2 rounded border border-slate-800 flex items-center justify-between text-[11px]">
                  <div>
                    <span className="text-white font-bold">Order #{order.orderNumber}</span>
                    <span className="text-slate-400 block text-[10px]">{order.item} (${order.amount})</span>
                  </div>
                  <div className="text-right">
                    <span className="text-emerald-400 font-bold">COMMITTED</span>
                    <span className="text-slate-500 block text-[10px]">{order.createdAt}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
