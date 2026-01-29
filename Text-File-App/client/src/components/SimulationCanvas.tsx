import { useEffect, useRef } from "react";
import { type SimulationState } from "@/lib/acoLogic";
const Y_OFFSET = 150;

interface SimulationCanvasProps {
  simulationState: SimulationState;
  showPheromones: boolean;
  showAnts: boolean;
  width: number;
  height: number;
}

export function SimulationCanvas({ 
  simulationState, 
  showPheromones, 
  showAnts,
  width, 
  height 
}: SimulationCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, width, height);

    const { network, ants, infectionWaves } = simulationState;

    // 1. Draw Pheromone Paths (ACO Highways)
    network.edges.forEach(edge => {
      const source = network.nodes[edge.source];
      const target = network.nodes[edge.target];

      ctx.beginPath();
      ctx.moveTo(source.x, source.y + Y_OFFSET);
      ctx.lineTo(target.x, target.y + Y_OFFSET);

      if (showPheromones) {
        const intensity = Math.min(1, edge.pheromone / 20);
        const widthVal = 3 + intensity * 35;
        
        // Color shifts toward red (threat) with higher pheromone, blue/cyan for low
        const r = Math.floor(0 + intensity * 255);
        const g = Math.floor(180 * (1 - intensity) + 40);
        const b = Math.floor(255 * (1 - intensity));
        
        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${0.1 + intensity * 0.8})`;
        ctx.lineWidth = widthVal;
        ctx.stroke();

        // Glow for highways
        if (intensity > 0.3) {
          ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${intensity * 0.25})`;
          ctx.lineWidth = widthVal + 12;
          ctx.stroke();
        }
      } else {
        ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    });

    // 2. Draw Path-Based Infection Waves (Flowing segments)
    infectionWaves.forEach(wave => {
      const source = network.nodes[wave.sourceId];
      const target = network.nodes[wave.targetId];
      const dx = target.x - source.x;
      const dy = target.y - source.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      const waveX = source.x + dx * wave.progress;
      const waveY = source.y + dy * wave.progress;

      // Draw a flowing segment instead of just a dot
      const segmentLen = 20;
      const startP = Math.max(0, wave.progress - segmentLen/dist);
      const endP = wave.progress;
      
      ctx.beginPath();
      ctx.moveTo(
        source.x + dx * startP,
        source.y + dy * startP + Y_OFFSET
      );
      ctx.lineTo(
        source.x + dx * endP,
        source.y + dy * endP + Y_OFFSET
      );
      ctx.strokeStyle = "#ef4444";
      ctx.lineWidth = 4;
      ctx.lineCap = "round";
      ctx.shadowBlur = 10;
      ctx.shadowColor = "#ef4444";
      ctx.stroke();
      ctx.shadowBlur = 0;
    });

    // 3. Draw Files (Nodes)
    network.nodes.forEach(node => {
      if (node.type === 'infected') {
        const time = Date.now() / 400;
        const radius = 10 + (time % 1) * 40;
        ctx.beginPath();
        ctx.arc(node.x, node.y + Y_OFFSET, radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(239, 68, 68, ${1 - (time % 1)})`;
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      ctx.beginPath();
      ctx.arc(node.x, node.y + Y_OFFSET, 11, 0, Math.PI * 2);
      ctx.fillStyle = node.type === 'infected' ? "#ef4444" : (node.type === 'suspicious' ? "#f59e0b" : "#10b981");
      ctx.fill();
      
      if (node.health < 100) {
        ctx.beginPath();
        ctx.arc(node.x, node.y + Y_OFFSET, 15, -Math.PI/2, (Math.PI * 2 * (node.health / 100)) - Math.PI/2);
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 3;
        ctx.stroke();
      }

      ctx.fillStyle = "white";
      ctx.font = "bold 10px monospace";
      ctx.textAlign = "center";
      ctx.fillText(
        `F-${node.id.toString(16)}`,
        node.x,
        node.y + Y_OFFSET + 28
      );
    });

    // 4. Draw Ants with Decision Highlights
    if (showAnts) {
      ants.forEach(ant => {
        // Ant Body
        ctx.fillStyle = "#ffffff";
        ctx.shadowBlur = 8;
        ctx.shadowColor = "#ffffff";
        ctx.beginPath();
        ctx.arc(ant.x, ant.y + Y_OFFSET, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Visual Decision Indicator
        if (ant.decisionHighlightTimer > 0) {
          ctx.beginPath();
          ctx.arc(
            ant.x,
            ant.y + Y_OFFSET,
            10 * (1 - ant.decisionHighlightTimer),
            0,
            Math.PI * 2
          );
          ctx.strokeStyle = `rgba(255, 255, 255, ${ant.decisionHighlightTimer * 2})`;
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      });
    }

  }, [simulationState, showPheromones, showAnts, width, height]);

  return (
    <div className="relative w-full flex flex-col">
      <div
        className="relative"
        style={{ height: height }}
      >
        <canvas 
          ref={canvasRef} 
          width={width} 
          height={height} 
          className="w-full h-full block bg-black"
        />
      </div>
      
      {/* Enhanced Cyber-Security Visual Legend */}
      <div className="bg-black/95 border-t border-primary/20 p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-[10px] font-mono">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full bg-[#10b981] shadow-[0_0_8px_#10b981]" />
            <span className="text-white font-bold">CLEAN RESOURCE</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full bg-[#f59e0b] shadow-[0_0_8px_#f59e0b]" />
            <span className="text-white font-bold">SUSPICIOUS ANOMALY</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full bg-[#ef4444] shadow-[0_0_8px_#ef4444]" />
            <span className="text-white font-bold">INFECTED NODE</span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-2 w-8 bg-red-500 shadow-[0_0_8px_red] rounded-full" />
            <span className="text-white font-bold">INFECTION WAVE (MALWARE)</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-white shadow-[0_0_8px_white]" />
            <span className="text-white font-bold">SECURITY AGENT (ANT)</span>
          </div>
          <div className="flex items-center gap-3 text-muted-foreground leading-tight italic">
            <span>Agents reorganize paths in real-time based on shared intelligence (Pheromones).</span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-1 w-8 bg-cyan-500/50" />
            <span className="text-white font-bold">THIN PATH: LOW THREAT</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-3 w-8 bg-red-600 shadow-[0_0_10px_red]" />
            <span className="text-white font-bold">THICK PATH: HIGH THREAT CONFIDENCE</span>
          </div>
          <div className="flex items-center gap-3 text-muted-foreground leading-tight italic">
            <span>Alpha (α) scales memory; Beta (β) scales response urgency.</span>
          </div>
        </div>

        <div className="border-l border-white/10 pl-6 space-y-2">
          <h4 className="text-primary font-bold uppercase tracking-widest text-[9px]">Cyber-Defense mapping</h4>
          <p className="text-white/60 leading-relaxed">
            <span className="text-primary font-bold">Ants:</span> Decentralized security agents.<br/>
            <span className="text-primary font-bold">Pheromones:</span> Shared threat intelligence.<br/>
            <span className="text-primary font-bold">Path Reinforcement:</span> Correlated threat confidence.
          </p>
        </div>
      </div>
    </div>
  );
}
