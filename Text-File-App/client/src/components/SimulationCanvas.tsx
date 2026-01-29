import { useEffect, useRef } from "react";
import { type SimulationState } from "@/lib/acoLogic";

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

    network.edges.forEach(edge => {
      const source = network.nodes[edge.source];
      const target = network.nodes[edge.target];

      ctx.beginPath();
      ctx.moveTo(source.x, source.y);
      ctx.lineTo(target.x, target.y);

      if (showPheromones) {
        const intensity = Math.min(1, edge.pheromone / 20);
        const widthVal = 3 + intensity * 35;
        
        const r = Math.floor(0 + intensity * 255);
        const g = Math.floor(180 * (1 - intensity) + 40);
        const b = Math.floor(255 * (1 - intensity));
        
        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${0.1 + intensity * 0.8})`;
        ctx.lineWidth = widthVal;
        ctx.stroke();

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

    infectionWaves.forEach(wave => {
      const source = network.nodes[wave.sourceId];
      const target = network.nodes[wave.targetId];
      const dx = target.x - source.x;
      const dy = target.y - source.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      const segmentLen = 20;
      const startP = Math.max(0, wave.progress - segmentLen/dist);
      const endP = wave.progress;
      
      ctx.beginPath();
      ctx.moveTo(
        source.x + dx * startP,
        source.y + dy * startP
      );
      ctx.lineTo(
        source.x + dx * endP,
        source.y + dy * endP
      );
      ctx.strokeStyle = "#ef4444";
      ctx.lineWidth = 4;
      ctx.lineCap = "round";
      ctx.shadowBlur = 10;
      ctx.shadowColor = "#ef4444";
      ctx.stroke();
      ctx.shadowBlur = 0;
    });

    network.nodes.forEach(node => {
      if (node.type === 'infected') {
        const time = Date.now() / 400;
        const radius = 10 + (time % 1) * 40;
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(239, 68, 68, ${1 - (time % 1)})`;
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      ctx.beginPath();
      ctx.arc(node.x, node.y, 11, 0, Math.PI * 2);
      ctx.fillStyle = node.type === 'infected' ? "#ef4444" : (node.type === 'suspicious' ? "#f59e0b" : "#10b981");
      ctx.fill();
      
      if (node.health < 100) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, 15, -Math.PI/2, (Math.PI * 2 * (node.health / 100)) - Math.PI/2);
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
        node.y + 28
      );
    });

    if (showAnts) {
      ants.forEach(ant => {
        ctx.fillStyle = "#ffffff";
        ctx.shadowBlur = 8;
        ctx.shadowColor = "#ffffff";
        ctx.beginPath();
        ctx.arc(ant.x, ant.y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        if (ant.decisionHighlightTimer > 0) {
          ctx.beginPath();
          ctx.arc(
            ant.x,
            ant.y,
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
    <canvas 
      ref={canvasRef} 
      width={width} 
      height={height} 
      className="w-full h-full block bg-black"
    />
  );
}
