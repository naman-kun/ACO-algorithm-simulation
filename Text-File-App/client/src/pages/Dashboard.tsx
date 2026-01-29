import { useState, useEffect, useRef, useCallback } from "react";
import { generateNetwork } from "@/lib/networkGenerator";
import { ACOSimulation, type SimulationState } from "@/lib/acoLogic";
import { SimulationCanvas } from "@/components/SimulationCanvas";
import { ParameterSlider } from "@/components/ParameterSlider";
import { MetricCard } from "@/components/MetricCard";
import { Header } from "@/components/Header";
import { usePresets, useCreatePreset, useDeletePreset } from "@/hooks/use-presets";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, Pause, RefreshCw, Trash2, Activity } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { InsertSimulationPreset } from "@shared/schema";

interface CycleAnalytics {
  totalInfections: number;
  threatsNeutralized: number;
  efficiency: number;
}

export default function Dashboard() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showPheromones, setShowPheromones] = useState(true);
  const [showAnts, setShowAnts] = useState(true);
  
  const [antCount, setAntCount] = useState(50);
  const [alpha, setAlpha] = useState(1.0);
  const [beta, setBeta] = useState(2.0);
  const [rho, setRho] = useState(0.1);
  const [simSpeed, setSimSpeed] = useState(1.0);
  const [malwareRate, setMalwareRate] = useState(0.05);

  const simRef = useRef<ACOSimulation | null>(null);
  const frameRef = useRef<number>(0);
  const [simState, setSimState] = useState<SimulationState | null>(null);
  const [cycleAnalytics, setCycleAnalytics] = useState<CycleAnalytics | null>(null);
  const wasPlayingRef = useRef(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ w: 800, h: 500 });

  const { data: presets } = usePresets();
  const createPreset = useCreatePreset();
  const deletePreset = useDeletePreset();
  const [presetName, setPresetName] = useState("");
  const [isSaveOpen, setIsSaveOpen] = useState(false);
  const { toast } = useToast();

  const initSimulation = useCallback(() => {
    if (!containerRef.current) return;
  
    const w = containerRef.current.clientWidth;
    const h = 500;
  
    setDims({ w, h });
    setCycleAnalytics(null);
  }, []);

  useEffect(() => {
    initSimulation();
    const handleResize = () => initSimulation();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [initSimulation]);

  useEffect(() => {
    if (dims.w === 0 || dims.h === 0) return;
  
    let cancelled = false;
  
    const setup = async () => {
      const network = await generateNetwork(30, dims.w, dims.h);
      if (cancelled) return;
  
      const sim = new ACOSimulation(network, antCount);
  
      sim.alpha = alpha;
      sim.beta = beta;
      sim.rho = rho;
      sim.simulationSpeed = simSpeed;
      sim.malwareSpreadRate = malwareRate;
  
      simRef.current = sim;
      setSimState({ ...sim.state });
    };
  
    setup();
  
    return () => {
      cancelled = true;
    };
  }, [dims]);

  useEffect(() => {
    if (simRef.current) {
      simRef.current.alpha = alpha;
      simRef.current.beta = beta;
      simRef.current.rho = rho;
      simRef.current.simulationSpeed = simSpeed;
      simRef.current.malwareSpreadRate = malwareRate;
      simRef.current.setPopulation(antCount);
    }
  }, [alpha, beta, rho, simSpeed, malwareRate, antCount]);

  useEffect(() => {
    if (wasPlayingRef.current && !isPlaying && simRef.current) {
      const analytics = simRef.current.getCycleAnalytics();
      setCycleAnalytics(analytics);
    }
    wasPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    let lastTime = performance.now();
    const loop = (time: number) => {
      const dt = (time - lastTime) / 1000;
      lastTime = time;

      if (isPlaying && simRef.current) {
        simRef.current.update(Math.min(dt, 0.1));
        setSimState({ ...simRef.current.state });
      }
      frameRef.current = requestAnimationFrame(loop);
    };
    
    frameRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameRef.current);
  }, [isPlaying]);

  const handleSavePreset = () => {
    const preset: InsertSimulationPreset = {
      name: presetName || `Preset ${new Date().toLocaleTimeString()}`,
      description: `α:${alpha}, β:${beta}, ρ:${rho}`,
      alpha,
      beta,
      rho,
      antCount,
      simulationSpeed: simSpeed,
      malwareSpreadRate: malwareRate,
      antivirusAggressiveness: 0.5
    };
    createPreset.mutate(preset, {
      onSuccess: () => {
        setIsSaveOpen(false);
        setPresetName("");
      }
    });
  };

  const loadPreset = (p: any) => {
    setAlpha(p.alpha);
    setBeta(p.beta);
    setRho(p.rho);  
    setAntCount(p.antCount);
    setSimSpeed(p.simulationSpeed);
    setMalwareRate(p.malwareSpreadRate);
    toast({ title: "Config Loaded", description: p.name });
    setTimeout(initSimulation, 100);
  };

  const handleStartStop = () => {
    if (!isPlaying && simRef.current) {
      simRef.current.resetCycleAnalytics();
      setCycleAnalytics(null);
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="h-screen bg-[#020617] text-white flex flex-col overflow-hidden font-sans">
      <Header onSave={() => setIsSaveOpen(true)} />
      
      <div className="flex-1 flex overflow-hidden">
        <aside className="w-80 border-r border-white/10 bg-black/40 flex flex-col shrink-0">
          <div className="p-4 border-b border-white/10">
            <h2 className="text-xs font-mono uppercase tracking-widest text-primary font-bold mb-4">Command Center</h2>
            <div className="flex gap-2">
              <Button 
                onClick={handleStartStop} 
                className={`flex-1 font-bold ${isPlaying ? "bg-amber-500 hover:bg-amber-600" : "bg-primary hover:bg-primary/90"} text-black`}
                size="sm"
              >
                {isPlaying ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                {isPlaying ? "HALT" : "ENGAGE"}
              </Button>
              <Button onClick={initSimulation} variant="outline" size="sm" className="border-white/10 hover:bg-white/5">
                <RefreshCw className="w-4 h-4 mr-2" /> RESET
              </Button>
            </div>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-4 space-y-6">
              <section className="space-y-4">
                <h3 className="text-[10px] font-mono uppercase text-muted-foreground tracking-[0.2em]">ACO Coefficients</h3>
                <ParameterSlider label="Alpha (History)" value={alpha} min={0} max={5} step={0.1} onChange={setAlpha} />
                <ParameterSlider label="Beta (Insight)" value={beta} min={0} max={5} step={0.1} onChange={setBeta} />
                <ParameterSlider label="Rho (Evaporation)" value={rho} min={0.01} max={1} step={0.01} onChange={setRho} />
              </section>

              <section className="space-y-4">
                <h3 className="text-[10px] font-mono uppercase text-muted-foreground tracking-[0.2em]">Environment</h3>
                <ParameterSlider label="Malware Velocity" value={malwareRate} min={0} max={0.5} step={0.01} onChange={setMalwareRate} />
                <ParameterSlider label="Agent Population" value={antCount} min={10} max={300} step={10} onChange={setAntCount} />
                <ParameterSlider label="Clock Speed" value={simSpeed} min={0.1} max={5} step={0.1} onChange={setSimSpeed} />
              </section>

              <section className="space-y-3 pt-2">
                <h3 className="text-[10px] font-mono uppercase text-muted-foreground tracking-[0.2em]">Visualization</h3>
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-mono">Pheromone Trails</Label>
                  <Switch checked={showPheromones} onCheckedChange={setShowPheromones} />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-mono">Security Agents</Label>
                  <Switch checked={showAnts} onCheckedChange={setShowAnts} />
                </div>
              </section>
            </div>
          </ScrollArea>
        </aside>

        <div className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden bg-black">
          <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4 shrink-0">
            <MetricCard label="Threat Vectors" value={simState?.stats.infectedNodes || 0} unit="ACTIVE" color={simState?.stats.infectedNodes ? "destructive" : "primary"} />
            <MetricCard label="Signal" value={simState?.stats.totalPheromones.toFixed(0) || 0} unit="INT" color="secondary" />
            <MetricCard label="Infection Rate" value={simState?.stats.infectionRate || 0} unit="%" color={(simState?.stats.infectionRate ?? 0) > 30 ? "destructive" : "warning"} />
            <MetricCard label="Cycle" value={Math.floor(frameRef.current / 60)} unit="SEC" color="warning" />
          </div>

          <div
            ref={containerRef}
            className="relative bg-black shrink-0"
            style={{ height: dims.h }}
          >
            {simState && (
              <SimulationCanvas 
                simulationState={simState}
                showPheromones={showPheromones}
                showAnts={showAnts}
                width={dims.w}
                height={dims.h}
              />
            )}
            
            {!isPlaying && !simState && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-30">
                <div className="text-center p-8 border border-primary/20 bg-black/40 rounded-lg max-w-sm">
                  <Activity className="w-12 h-12 text-primary mx-auto mb-4 animate-pulse" />
                  <h2 className="text-xl font-display font-bold uppercase tracking-widest text-white mb-2">Initialize Core</h2>
                  <p className="text-xs text-muted-foreground leading-relaxed">System ready for deployment. Configure parameters and engage the simulation to begin detection.</p>
                </div>
              </div>
            )}
          </div>

          {cycleAnalytics && !isPlaying && (
            <div className="p-4 border-t border-primary/20 bg-black/80 shrink-0">
              <h3 className="text-xs font-mono uppercase tracking-widest text-primary font-bold mb-4">Cycle Analytics Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="border border-white/10 bg-white/5 rounded p-4">
                  <div className="text-[10px] font-mono uppercase text-muted-foreground">Total Infections</div>
                  <div className="text-2xl font-bold text-red-500">{cycleAnalytics.totalInfections}</div>
                </div>
                <div className="border border-white/10 bg-white/5 rounded p-4">
                  <div className="text-[10px] font-mono uppercase text-muted-foreground">Threats Neutralized</div>
                  <div className="text-2xl font-bold text-green-500">{cycleAnalytics.threatsNeutralized}</div>
                </div>
                <div className="border border-white/10 bg-white/5 rounded p-4">
                  <div className="text-[10px] font-mono uppercase text-muted-foreground">Algorithm Efficiency</div>
                  <div className="text-2xl font-bold text-primary">{cycleAnalytics.efficiency.toFixed(1)}%</div>
                </div>
              </div>
              <div className="text-[10px] font-mono text-muted-foreground border border-white/10 bg-white/5 rounded p-3">
                <span className="text-primary font-bold">Efficiency Formula:</span> Efficiency = (Threats Neutralized / Total Threat Events) × 100
              </div>
            </div>
          )}

          <div className="bg-black/95 border-t border-primary/20 p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-[10px] font-mono shrink-0">
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

          <div className="border-t border-white/10 bg-black/60 shrink-0">
            <Tabs defaultValue="theory" className="flex flex-col">
              <TabsList className="bg-transparent border-b border-white/5 rounded-none h-10 px-4">
                <TabsTrigger value="presets" className="text-[10px] uppercase font-mono tracking-widest data-[state=active]:text-primary">Registry</TabsTrigger>
                <TabsTrigger value="theory" className="text-[10px] uppercase font-mono tracking-widest data-[state=active]:text-primary">Operational Logic</TabsTrigger>
              </TabsList>
              <TabsContent value="presets" className="p-4 m-0 grid grid-cols-1 md:grid-cols-3 gap-3">
                {presets?.map((p: any) => (
                  <div key={p.id} className="group flex items-center justify-between p-3 border border-white/5 bg-white/5 rounded hover:border-primary/40 cursor-pointer transition-all" onClick={() => loadPreset(p)}>
                    <div>
                      <div className="text-[10px] font-bold text-primary uppercase">{p.name}</div>
                      <div className="text-[9px] text-muted-foreground mt-1">α:{p.alpha} β:{p.beta} ρ:{p.rho}</div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 text-destructive" onClick={(e) => { e.stopPropagation(); deletePreset.mutate(p.id); }}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </TabsContent>
              <TabsContent value="theory" className="p-4 m-0">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-[11px] leading-relaxed text-muted-foreground">
                  <div>
                    <span className="text-primary font-bold block mb-1">STIGMERGY (α)</span>
                    Ants communicate indirectly via pheromone trails. High Alpha forces agents to reinforce discovered paths, leading to rapid system-wide consensus on threat locations.
                  </div>
                  <div>
                    <span className="text-secondary font-bold block mb-1">LOCAL SEARCH (β)</span>
                    Heuristic visibility. High Beta allows agents to prioritize immediate node-level anomalies, effectively acting as high-sensitivity local sensors.
                  </div>
                  <div>
                    <span className="text-white font-bold block mb-1">DECAY (ρ)</span>
                    Evaporation prevents permanent bias. It allows the system to "forget" old threats and false positives, ensuring detection remains adaptive and current.
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      <Dialog open={isSaveOpen} onOpenChange={setIsSaveOpen}>
        <DialogContent className="bg-[#020617] border-white/10 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xs font-mono uppercase tracking-widest text-primary">Archive Configuration</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <Input 
              placeholder="Preset Designation" 
              value={presetName}
              onChange={(e) => setPresetName(e.target.value)}
              className="bg-white/5 border-white/10 h-9 text-xs"
            />
            <Button className="w-full bg-primary text-black font-bold h-9" onClick={handleSavePreset} disabled={!presetName || createPreset.isPending}>
              COMMIT TO REGISTRY
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
