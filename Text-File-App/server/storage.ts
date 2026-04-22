import { type SimulationPreset, type InsertSimulationPreset } from "@shared/schema";

export interface IStorage {
  getPresets(): Promise<SimulationPreset[]>;
  createPreset(preset: InsertSimulationPreset): Promise<SimulationPreset>;
  deletePreset(id: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private presets: Map<number, SimulationPreset>;
  private currentId: number;

  constructor() {
    this.presets = new Map();
    this.currentId = 1;
  }

  async getPresets(): Promise<SimulationPreset[]> {
    return Array.from(this.presets.values());
  }

  async createPreset(insertPreset: InsertSimulationPreset): Promise<SimulationPreset> {
    const id = this.currentId++;
    // Fallback default values for required DB schema columns just in case
    const preset: SimulationPreset = { 
      id,
      name: insertPreset.name,
      description: insertPreset.description ?? null,
      alpha: insertPreset.alpha ?? 1.0,
      beta: insertPreset.beta ?? 2.0,
      rho: insertPreset.rho ?? 0.1,
      antCount: insertPreset.antCount ?? 50,
      simulationSpeed: insertPreset.simulationSpeed ?? 1.0,
      malwareSpreadRate: insertPreset.malwareSpreadRate ?? 0.05,
      antivirusAggressiveness: insertPreset.antivirusAggressiveness ?? 0.5
    };
    this.presets.set(id, preset);
    return preset;
  }

  async deletePreset(id: number): Promise<void> {
    this.presets.delete(id);
  }
}

export const storage = new MemStorage();
