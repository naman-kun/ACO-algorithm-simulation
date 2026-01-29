import { type Node, type Edge, type Network } from "./networkGenerator";

export interface Ant {
  id: number;
  x: number;
  y: number;
  currentNode: number;
  targetNode: number | null;
  progress: number;
  pathHistory: number[];
  decisionHighlightTimer: number; 
}

export interface InfectionWave {
  id: number;
  sourceId: number;
  targetId: number;
  progress: number;
}

export interface SimulationState {
  network: Network;
  ants: Ant[];
  infectionWaves: InfectionWave[];
  stats: {
    infectedNodes: number;
    totalPheromones: number;
    systemHealth: number;
    infectionRate: number; // New: Percentage of nodes infected
    agentEfficiency: number; // New: Successful detections vs total moves
  };
}

export class ACOSimulation {
  state: SimulationState;
  alpha: number = 1.0;
  beta: number = 2.0;
  rho: number = 0.1;
  simulationSpeed: number = 1.0;
  malwareSpreadRate: number = 0.05;

  private nextWaveId = 0;
  private totalMoves = 0;
  private detections = 0;
  // --- Cooperative repair tracking ---
  private repairContributors: Map<number, Set<number>> = new Map();
  private repairThreshold = 4; // minimum ants required to repair a node
  constructor(network: Network, antCount: number) {
    this.state = {
      network,
      ants: this.initializeAnts(antCount, network.nodes),
      infectionWaves: [],
      stats: {
        infectedNodes: 0,
        totalPheromones: 0,
        systemHealth: 100,
        infectionRate: 0,
        agentEfficiency: 0,
      }
    };
  }

  setPopulation(count: number) {
    const currentCount = this.state.ants.length;
    if (count > currentCount) {
      const newAnts = this.initializeAnts(count - currentCount, this.state.network.nodes);
      this.state.ants.push(...newAnts);
    } else if (count < currentCount) {
      this.state.ants = this.state.ants.slice(0, count);
    }
  }

  initializeAnts(count: number, nodes: Node[]): Ant[] {
    return Array.from({ length: count }, () => {
      const nodeIndex = Math.floor(Math.random() * nodes.length);
      const node = nodes[nodeIndex];
      return {
        id: Math.random(),
        x: node.x,
        y: node.y,
        currentNode: nodeIndex,
        targetNode: null,
        progress: 0,
        pathHistory: [],
        decisionHighlightTimer: 0,
      };
    });
  }

  update(dt: number) {
    const adjustedDt = dt * this.simulationSpeed;
    this.evaporatePheromones(adjustedDt);
    this.moveAnts(adjustedDt);
    this.processInfectionWaves(adjustedDt);
    this.spreadMalware(adjustedDt);
    this.applyAntivirus(adjustedDt);
    this.updateStats();
  }

  private evaporatePheromones(dt: number) {
    const evaporation = Math.exp(-this.rho * dt);
    let total = 0;
  
    this.state.network.edges.forEach(edge => {
      edge.pheromone = Math.max(0.1, edge.pheromone * evaporation);
      total += edge.pheromone;
    });
  
    this.state.stats.totalPheromones = total;
  }
  

  private moveAnts(dt: number) {
    const baseSpeed = 160; 

    this.state.ants.forEach(ant => {
      if (ant.decisionHighlightTimer > 0) {
        ant.decisionHighlightTimer -= dt;
      }

      if (ant.targetNode === null) {
        const nextNode = this.chooseNextNode(ant);
        if (nextNode !== null) {
          ant.targetNode = nextNode;
          ant.progress = 0;
          ant.decisionHighlightTimer = 0.5;
          this.totalMoves++;
        }
      } else {
        const source = this.state.network.nodes[ant.currentNode];
        const target = this.state.network.nodes[ant.targetNode];
        const dx = target.x - source.x;
        const dy = target.y - source.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        ant.progress += (baseSpeed * dt) / dist;
        
        ant.x = source.x + dx * Math.min(1, ant.progress);
        ant.y = source.y + dy * Math.min(1, ant.progress);

        if (ant.progress >= 1) {
          const edgeIndex = this.findEdgeIndex(ant.currentNode, ant.targetNode);
          if (edgeIndex !== -1) {
            const targetNode = this.state.network.nodes[ant.targetNode];
            const anomalyScore = targetNode.type === 'infected' ? 12 : (targetNode.type === 'suspicious' ? 4 : 0.1);
            
            if (targetNode.type !== 'normal') {
              this.detections++;
            }

            const deposit =
  targetNode.type === 'infected' ? 12 :
  targetNode.type === 'suspicious' ? 5 :
  0.2;

this.state.network.edges[edgeIndex].pheromone += deposit;

          }

          ant.pathHistory.push(ant.currentNode);
          if (ant.pathHistory.length > 8) ant.pathHistory.shift();
          ant.currentNode = ant.targetNode;
          ant.targetNode = null;
          ant.progress = 0;
          ant.x = target.x;
          ant.y = target.y;
        }
      }
    });
  }

  private chooseNextNode(ant: Ant): number | null {
    const node = this.state.network.nodes[ant.currentNode];
    const neighbors = node.connections;
    if (neighbors.length === 0) return null;
  
    let totalScore = 0;
  
    const scored = neighbors.map(neighborId => {
      const edge = this.findEdge(ant.currentNode, neighborId);
      if (!edge) return { neighborId, score: 0 };
  
      const neighbor = this.state.network.nodes[neighborId];
  
      // Heuristic: how "dangerous" this node is
      const anomaly =
        neighbor.type === "infected" ? 10 :
        neighbor.type === "suspicious" ? 4 :
        0.3;
  
      // ACO core formula (exaggerated for visibility)
      const pheromoneInfluence = Math.pow(edge.pheromone + 1, this.alpha * 1.5);
      const heuristicInfluence = Math.pow(anomaly + 1, this.beta * 1.2);
  
      let score = pheromoneInfluence * heuristicInfluence;
  
      // Discourage immediate backtracking (but don't forbid it)
      if (ant.pathHistory.includes(neighborId)) {
        score *= 0.05;
      }
  
      totalScore += score;
      return { neighborId, score };
    });
  
    // Pure exploration fallback
    if (totalScore === 0) {
      const randomChoice = neighbors[Math.floor(Math.random() * neighbors.length)];
      ant.decisionHighlightTimer = 0.4;
      return randomChoice;
    }
  
    // Probabilistic selection
    let r = Math.random() * totalScore;
    for (const s of scored) {
      r -= s.score;
      if (r <= 0) {
        ant.decisionHighlightTimer = 0.4; // 🔥 MARK DECISION
        return s.neighborId;
      }
    }
  
    // Fallback
    ant.decisionHighlightTimer = 0.4;
    return scored[0].neighborId;
  }
  
  

  private spreadMalware(dt: number) {
    if (this.state.network.nodes.every(n => n.type === 'normal')) {
      if (Math.random() < 0.2 * dt) {
        const idx = Math.floor(Math.random() * this.state.network.nodes.length);
        this.state.network.nodes[idx].type = 'infected';
        this.state.network.nodes[idx].health = 0;
      }
    }

    this.state.network.nodes.forEach(node => {
      if (node.type === 'infected') {
        const emitChance = this.malwareSpreadRate * dt * 8;
        if (Math.random() < emitChance) {
          node.connections.forEach(neighborId => {
            if (this.state.network.nodes[neighborId].type !== 'infected') {
              this.state.infectionWaves.push({
                id: this.nextWaveId++,
                sourceId: node.id,
                targetId: neighborId,
                progress: 0
              });
            }
          });
        }
      }
    });
  }

  private processInfectionWaves(dt: number) {
    const waveSpeed = 220 * this.simulationSpeed;
  
    this.state.infectionWaves = this.state.infectionWaves.filter(wave => {
      const source = this.state.network.nodes[wave.sourceId];
      const target = this.state.network.nodes[wave.targetId];
      const dx = target.x - source.x;
      const dy = target.y - source.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
  
      wave.progress += (waveSpeed * dt) / dist;
  
      if (wave.progress >= 1) {
        const targetNode = this.state.network.nodes[wave.targetId];
  
        // 🔴 Infection state change
        if (targetNode.type === 'normal') {
          targetNode.type = 'suspicious';
          targetNode.health = 60;
        } else if (targetNode.type === 'suspicious') {
          targetNode.type = 'infected';
          targetNode.health = 0;
        }
  
        // 🔥 FIX 4: Spike pheromones on all connected edges
        targetNode.connections.forEach(neighborId => {
          const edge = this.findEdge(targetNode.id, neighborId);
          if (edge) {
            edge.pheromone += targetNode.type === 'infected' ? 8 : 4;
          }
        });
  
        return false; // remove wave
      }
  
      return true;
    });
  }
  

  private applyAntivirus(dt: number) {
    this.state.network.nodes.forEach(node => {
      const pheromoneLoad = node.connections.reduce((sum, neighborId) => {
        const edge = this.findEdge(node.id, neighborId);
        return sum + (edge?.pheromone || 0);
      }, 0);

      if (pheromoneLoad > 15 && (node.type === 'infected' || node.type === 'suspicious')) {
        const repairRate = (pheromoneLoad * 2.5) * dt;
        node.health = Math.min(100, node.health + repairRate);
        if (node.health > 95) node.type = 'normal';
        else if (node.health > 0) node.type = 'suspicious';
      }
    });
  }

  private findEdge(a: number, b: number): Edge | undefined {
    return this.state.network.edges.find(e => 
      (e.source === a && e.target === b) || (e.source === b && e.target === a)
    );
  }

  private findEdgeIndex(a: number, b: number): number {
    return this.state.network.edges.findIndex(e => 
      (e.source === a && e.target === b) || (e.source === b && e.target === a)
    );
  }

  private updateStats() {
    const totalNodes = this.state.network.nodes.length;
    const infected = this.state.network.nodes.filter(n => n.type === 'infected').length;
    const suspicious = this.state.network.nodes.filter(n => n.type === 'suspicious').length;
    
    this.state.stats.infectedNodes = infected + suspicious;
    this.state.stats.systemHealth = Math.round((1 - infected / totalNodes) * 100);
    this.state.stats.infectionRate = Math.round(((infected + suspicious) / totalNodes) * 100);
    
    const efficiency = this.totalMoves > 0 ? (this.detections / this.totalMoves) * 100 : 0;
    this.state.stats.agentEfficiency = Math.round(efficiency);
  }
}
