import React, { useState, useEffect, useRef } from 'react';
import type { CanvasNode, CanvasConnection, NodeType } from '../../types/canvas';
import { CANVAS_TEMPLATES } from '../../data/canvasTemplates';
import { 
  Play, 
  Pause, 
  Plus, 
  Trash2, 
  Activity, 
  Layers, 
  Flame, 
  Zap, 
  Link2
} from 'lucide-react';

const NODE_DEFAULTS: Record<NodeType, { label: string; sublabel: string; color: string }> = {
  client: { label: 'Client Device', sublabel: 'Web / Mobile', color: 'from-cyan-500/20 to-blue-500/10 border-cyan-500/40 text-cyan-300' },
  dns: { label: 'Route 53 DNS', sublabel: 'Geo Anycast', color: 'from-sky-500/20 to-indigo-500/10 border-sky-500/40 text-sky-300' },
  cdn: { label: 'Edge CDN', sublabel: 'Cloudflare Edge', color: 'from-amber-500/20 to-orange-500/10 border-amber-500/40 text-amber-300' },
  lb: { label: 'L7 Load Balancer', sublabel: 'Envoy / ALB', color: 'from-violet-500/20 to-purple-500/10 border-violet-500/40 text-violet-300' },
  gateway: { label: 'API Gateway', sublabel: 'Rate Limiter & Auth', color: 'from-purple-500/20 to-pink-500/10 border-purple-500/40 text-purple-300' },
  service: { label: 'App Service', sublabel: 'Stateless Node', color: 'from-indigo-500/20 to-blue-500/10 border-indigo-500/40 text-indigo-300' },
  cache: { label: 'Redis Cluster', sublabel: 'In-Memory Cache', color: 'from-rose-500/20 to-red-500/10 border-rose-500/40 text-rose-300' },
  database: { label: 'Primary DB', sublabel: 'Postgres / SQL', color: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/40 text-emerald-300' },
  replica: { label: 'Read Replica', sublabel: 'Read Scaler', color: 'from-teal-500/20 to-emerald-500/10 border-teal-500/40 text-teal-300' },
  queue: { label: 'Kafka Broker', sublabel: 'Message Stream', color: 'from-orange-500/20 to-amber-500/10 border-orange-500/40 text-orange-300' },
  worker: { label: 'Worker Pool', sublabel: 'Async Consumer', color: 'from-blue-500/20 to-indigo-500/10 border-blue-500/40 text-blue-300' },
  storage: { label: 'Object Store', sublabel: 'AWS S3 Bucket', color: 'from-yellow-500/20 to-amber-500/10 border-yellow-500/40 text-yellow-300' },
};

export const ArchitectureCanvas: React.FC = () => {
  const [nodes, setNodes] = useState<CanvasNode[]>(CANVAS_TEMPLATES[0].nodes);
  const [connections, setConnections] = useState<CanvasConnection[]>(CANVAS_TEMPLATES[0].connections);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [connectSourceId, setConnectSourceId] = useState<string | null>(null);
  
  // Simulation states
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simMode, setSimMode] = useState<'normal' | 'spike' | 'chaos'>('normal');
  const [packetOffset, setPacketOffset] = useState<number>(0);

  // Dragging state
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);

  // Animation frame loop for packet animation
  useEffect(() => {
    let animationFrame: number;
    if (isSimulating) {
      const step = () => {
        setPacketOffset((prev) => (prev + (simMode === 'spike' ? 3 : 1.5)) % 100);
        animationFrame = requestAnimationFrame(step);
      };
      animationFrame = requestAnimationFrame(step);
    }
    return () => cancelAnimationFrame(animationFrame);
  }, [isSimulating, simMode]);

  // Load Template
  const handleLoadTemplate = (templateId: string) => {
    const tmpl = CANVAS_TEMPLATES.find((t) => t.id === templateId);
    if (tmpl) {
      setNodes(tmpl.nodes);
      setConnections(tmpl.connections);
      setSelectedNodeId(null);
      setConnectSourceId(null);
    }
  };

  // Add a new node
  const handleAddNode = (type: NodeType) => {
    const config = NODE_DEFAULTS[type];
    const newNode: CanvasNode = {
      id: `node-${Date.now()}`,
      type,
      label: config.label,
      sublabel: config.sublabel,
      x: 60 + Math.random() * 200,
      y: 60 + Math.random() * 150,
      status: 'healthy',
      customConfig: { qps: 500, latencyMs: 5, cacheHitRatio: 85 }
    };
    setNodes((prev) => [...prev, newNode]);
    setSelectedNodeId(newNode.id);
  };

  // Delete node
  const handleDeleteSelected = () => {
    if (!selectedNodeId) return;
    setNodes((prev) => prev.filter((n) => n.id !== selectedNodeId));
    setConnections((prev) => prev.filter((c) => c.from !== selectedNodeId && c.to !== selectedNodeId));
    setSelectedNodeId(null);
    setConnectSourceId(null);
  };

  // Connect Nodes
  const handleStartConnect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!connectSourceId) {
      setConnectSourceId(id);
    } else if (connectSourceId !== id) {
      // Create connection
      const newConn: CanvasConnection = {
        id: `conn-${Date.now()}`,
        from: connectSourceId,
        to: id,
        label: 'HTTP / RPC'
      };
      setConnections((prev) => [...prev, newConn]);
      setConnectSourceId(null);
    } else {
      setConnectSourceId(null);
    }
  };

  // Node Drag handlers (Touch + Mouse support for iPad & Android)
  const handlePointerDown = (id: string, e: React.PointerEvent) => {
    e.stopPropagation();
    setSelectedNodeId(id);
    setDraggingNodeId(id);

    const node = nodes.find((n) => n.id === id);
    if (node && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left - node.x,
        y: e.clientY - rect.top - node.y
      });
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!draggingNodeId || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const newX = Math.max(10, Math.min(rect.width - 150, e.clientX - rect.left - dragOffset.x));
    const newY = Math.max(10, Math.min(rect.height - 90, e.clientY - rect.top - dragOffset.y));

    setNodes((prev) =>
      prev.map((n) => (n.id === draggingNodeId ? { ...n, x: newX, y: newY } : n))
    );
  };

  const handlePointerUp = () => {
    setDraggingNodeId(null);
  };

  // Compute live simulation telemetry
  const telemetry = {
    qps: isSimulating ? (simMode === 'spike' ? 12500 : 2400) : 0,
    latency: isSimulating ? (simMode === 'spike' ? 48 : simMode === 'chaos' ? 240 : 12) : 0,
    cacheHit: isSimulating ? (simMode === 'chaos' ? 42 : 91) : 0,
    errorRate: isSimulating ? (simMode === 'chaos' ? 14.8 : 0.02) : 0
  };

  return (
    <div className="space-y-4 select-none">
      {/* Canvas Controls Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
        {/* Left: Templates & Clear */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider mr-1">Templates:</span>
          {CANVAS_TEMPLATES.map((tmpl) => (
            <button
              key={tmpl.id}
              onClick={() => handleLoadTemplate(tmpl.id)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer"
            >
              {tmpl.name}
            </button>
          ))}
          <button
            onClick={() => { setNodes([]); setConnections([]); }}
            className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-950/20 border border-transparent transition cursor-pointer ml-2"
          >
            Clear Canvas
          </button>
        </div>

        {/* Right: Simulation Controller */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setSimMode('normal')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                simMode === 'normal' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Normal (1x)
            </button>
            <button
              onClick={() => setSimMode('spike')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                simMode === 'spike' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              10x Spike
            </button>
            <button
              onClick={() => setSimMode('chaos')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                simMode === 'chaos' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Chaos Mode
            </button>
          </div>

          <button
            onClick={() => setIsSimulating(!isSimulating)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-lg active:scale-95 cursor-pointer ${
              isSimulating
                ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30'
                : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-600/30'
            }`}
          >
            {isSimulating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isSimulating ? 'Stop Traffic' : 'Simulate Traffic'}</span>
          </button>
        </div>
      </div>

      {/* Live Simulation Stats HUD */}
      {isSimulating && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-900/60 border border-slate-800/80 p-3 rounded-2xl animate-fadeIn">
          <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 flex items-center gap-3">
            <Activity className="w-5 h-5 text-cyan-400 animate-pulse" />
            <div>
              <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Simulated Traffic</div>
              <div className="text-sm font-bold text-white">{telemetry.qps.toLocaleString()} QPS</div>
            </div>
          </div>
          <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 flex items-center gap-3">
            <Zap className={`w-5 h-5 ${telemetry.latency > 100 ? 'text-rose-400' : 'text-emerald-400'}`} />
            <div>
              <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">End-to-End Latency</div>
              <div className={`text-sm font-bold ${telemetry.latency > 100 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {telemetry.latency} ms
              </div>
            </div>
          </div>
          <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 flex items-center gap-3">
            <Layers className="w-5 h-5 text-purple-400" />
            <div>
              <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Cache Hit Rate</div>
              <div className="text-sm font-bold text-purple-300">{telemetry.cacheHit}%</div>
            </div>
          </div>
          <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 flex items-center gap-3">
            <Flame className={`w-5 h-5 ${telemetry.errorRate > 5 ? 'text-rose-500 animate-bounce' : 'text-slate-400'}`} />
            <div>
              <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Failure Rate</div>
              <div className={`text-sm font-bold ${telemetry.errorRate > 5 ? 'text-rose-400' : 'text-slate-300'}`}>
                {telemetry.errorRate}%
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Component Palette (Touch draggable or tap to add) */}
      <div className="bg-slate-900/60 border border-slate-800/80 p-3 rounded-2xl flex items-center gap-2 overflow-x-auto scrollbar-none">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
          <Plus className="w-3.5 h-3.5 text-indigo-400" />
          <span>Add Block:</span>
        </span>
        {(Object.keys(NODE_DEFAULTS) as NodeType[]).map((type) => (
          <button
            key={type}
            onClick={() => handleAddNode(type)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800/70 hover:bg-slate-700 text-slate-300 border border-slate-700 whitespace-nowrap transition cursor-pointer active:scale-95"
          >
            <span>+</span>
            <span>{NODE_DEFAULTS[type].label}</span>
          </button>
        ))}
      </div>

      {/* Main Canvas Work Area */}
      <div
        ref={canvasRef}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onClick={() => { setSelectedNodeId(null); setConnectSourceId(null); }}
        className="w-full h-[520px] bg-[#070b13] border border-slate-800/90 rounded-2xl relative overflow-hidden shadow-inner cursor-crosshair touch-none"
        style={{
          backgroundImage: `radial-gradient(circle, #1e293b 1px, transparent 1px)`,
          backgroundSize: '24px 24px'
        }}
      >
        {/* SVG for drawing connection lines and animated packets */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {connections.map((conn) => {
            const sourceNode = nodes.find((n) => n.id === conn.from);
            const targetNode = nodes.find((n) => n.id === conn.to);
            if (!sourceNode || !targetNode) return null;

            // Compute center coords
            const sx = sourceNode.x + 70;
            const sy = sourceNode.y + 35;
            const tx = targetNode.x + 70;
            const ty = targetNode.y + 35;

            // Control points for bezier curve
            const dx = tx - sx;
            const cx1 = sx + dx * 0.5;
            const cy1 = sy;
            const cx2 = sx + dx * 0.5;
            const cy2 = ty;
            const pathD = `M ${sx} ${sy} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${tx} ${ty}`;

            return (
              <g key={conn.id}>
                {/* Background line */}
                <path
                  d={pathD}
                  fill="none"
                  stroke="#334155"
                  strokeWidth="2.5"
                  strokeDasharray="4 4"
                />

                {/* Animated flowing data packets */}
                {isSimulating && (
                  <path
                    d={pathD}
                    fill="none"
                    stroke={simMode === 'chaos' ? '#f43f5e' : '#38bdf8'}
                    strokeWidth="3.5"
                    strokeDasharray="8 24"
                    strokeDashoffset={-packetOffset * 1.5}
                    className="opacity-80"
                  />
                )}

                {/* Label on connection */}
                {conn.label && (
                  <text
                    x={(sx + tx) / 2}
                    y={(sy + ty) / 2 - 8}
                    fill="#94a3b8"
                    fontSize="10"
                    fontFamily="monospace"
                    textAnchor="middle"
                    className="select-none bg-slate-900"
                  >
                    {conn.label}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Nodes Layer */}
        {nodes.map((node) => {
          const isSelected = selectedNodeId === node.id;
          const isConnectSource = connectSourceId === node.id;
          const config = NODE_DEFAULTS[node.type];

          return (
            <div
              key={node.id}
              onPointerDown={(e) => handlePointerDown(node.id, e)}
              onClick={(e) => e.stopPropagation()}
              style={{
                transform: `translate3d(${node.x}px, ${node.y}px, 0)`,
                touchAction: 'none'
              }}
              className={`absolute w-36 p-2.5 rounded-xl border bg-slate-900/95 backdrop-blur shadow-lg transition-shadow cursor-grab active:cursor-grabbing select-none ${
                isSelected
                  ? 'ring-2 ring-indigo-500 border-indigo-400 shadow-indigo-500/30'
                  : isConnectSource
                  ? 'ring-2 ring-cyan-400 border-cyan-400 animate-pulse'
                  : 'border-slate-700/80 hover:border-slate-600'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-gradient-to-r ${config.color}`}>
                  {node.type}
                </div>

                {/* Connection button */}
                <button
                  onClick={(e) => handleStartConnect(node.id, e)}
                  title="Connect to another node"
                  className={`p-1 rounded text-[10px] transition cursor-pointer ${
                    isConnectSource
                      ? 'bg-cyan-500 text-black font-bold'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Link2 className="w-3 h-3" />
                </button>
              </div>

              <div className="text-xs font-bold text-white truncate">{node.label}</div>
              <div className="text-[10px] text-slate-400 truncate">{node.sublabel}</div>

              {isSimulating && (
                <div className="mt-1.5 pt-1 border-t border-slate-800 flex items-center justify-between text-[9px] font-mono text-slate-400">
                  <span>{node.customConfig?.latencyMs ?? 5}ms</span>
                  <span className="text-cyan-400">{node.customConfig?.qps ?? 800} QPS</span>
                </div>
              )}
            </div>
          );
        })}

        {/* Selected Node Actions HUD inside canvas */}
        {selectedNodeId && (
          <div className="absolute bottom-4 right-4 bg-slate-900/95 border border-slate-700 p-2 rounded-xl flex items-center gap-2 shadow-xl z-20">
            <span className="text-xs text-slate-300 font-medium px-1">Selected Block</span>
            <button
              onClick={handleDeleteSelected}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-600/20 text-rose-300 hover:bg-rose-600 hover:text-white border border-rose-500/30 text-xs font-medium transition cursor-pointer"
            >
              <Trash2 className="w-3 h-3" />
              <span>Delete</span>
            </button>
          </div>
        )}

        {/* Instruction overlay watermark */}
        <div className="absolute bottom-3 left-4 text-[11px] text-slate-500 pointer-events-none">
          Drag cards to arrange • Tap <Link2 className="w-3 h-3 inline text-slate-400" /> to link nodes • Works with touch & pencil
        </div>
      </div>
    </div>
  );
};
