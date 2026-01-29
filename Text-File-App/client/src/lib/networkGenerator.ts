import { forceSimulation, forceManyBody, forceCenter, forceLink } from "d3-force";

export interface Node {
  id: number;
  x: number;
  y: number;
  type: "normal" | "suspicious" | "infected";
  health: number;
  connections: number[];
}

export interface Edge {
  source: number;
  target: number;
  pheromone: number;
}

export interface Network {
  nodes: Node[];
  edges: Edge[];
}

export function generateNetwork(nodeCount: number, width: number, height: number): Promise<Network> {
  return new Promise((resolve) => {
    const padding = 80;
    const usableWidth = width - padding * 2;
    const usableHeight = height - padding * 2;
    const minDistance = 60;

    const nodes: any[] = [];
    
    for (let i = 0; i < nodeCount; i++) {
      let x: number, y: number;
      let attempts = 0;
      const maxAttempts = 100;
      
      do {
        x = padding + Math.random() * usableWidth;
        y = padding + Math.random() * usableHeight;
        attempts++;
      } while (
        attempts < maxAttempts &&
        nodes.some(n => {
          const dx = n.x - x;
          const dy = n.y - y;
          return Math.sqrt(dx * dx + dy * dy) < minDistance;
        })
      );

      nodes.push({
        id: i,
        x,
        y,
        type: "normal",
        health: 100,
      });
    }

    const links: { source: number; target: number }[] = [];
    for (let i = 1; i < nodeCount; i++) {
      links.push({ source: i, target: Math.floor(Math.random() * i) });
    }

    for (let i = 0; i < nodeCount * 0.5; i++) {
      const a = Math.floor(Math.random() * nodeCount);
      const b = Math.floor(Math.random() * nodeCount);
      if (a !== b && !links.some(l => (l.source === a && l.target === b) || (l.source === b && l.target === a))) {
        links.push({ source: a, target: b });
      }
    }

    const simulation = forceSimulation(nodes)
      .force("charge", forceManyBody().strength(-400))
      .force("center", forceCenter(width / 2, height / 2))
      .force("link", forceLink(links).id((d: any) => d.id).distance(80))
      .stop();

    for (let i = 0; i < 300; ++i) simulation.tick();

    const finalNodes: Node[] = nodes.map((n: any) => ({
      id: n.id,
      x: Math.max(padding, Math.min(width - padding, n.x)),
      y: Math.max(padding, Math.min(height - padding, n.y)),
      type: "normal",
      health: 100,
      connections: [],
    }));

    links.forEach((l: any) => {
      const s = typeof l.source === 'object' ? l.source.id : l.source;
      const t = typeof l.target === 'object' ? l.target.id : l.target;
      finalNodes[s].connections.push(t);
      finalNodes[t].connections.push(s);
    });

    const finalEdges: Edge[] = links.map((l: any) => ({
      source: typeof l.source === 'object' ? l.source.id : l.source,
      target: typeof l.target === 'object' ? l.target.id : l.target,
      pheromone: 1.0,
    }));

    resolve({ nodes: finalNodes, edges: finalEdges });
  });
}
