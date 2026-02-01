import { useState, useEffect, useRef, useCallback } from "react";
import { generateNetwork } from "@/lib/networkGenerator";
import { ACOSimulation, type SimulationState } from "@/lib/acoLogic";
import { SimulationCanvas } from "@/components/SimulationCanvas";
import { ParameterSlider } from "@/components/ParameterSlider";
import { MetricCard } from "@/components/MetricCard";
import { PresentationViewer } from "@/components/PresentationViewer";
import { ResearchSources } from "@/components/ResearchSources";
import { Header } from "@/components/Header";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, Pause, RefreshCw, Trash2, Activity, Monitor, FileText, BookOpen, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";


type ViewMode = "simulation" | "presentation" | "research" | "credits";

interface CycleAnalytics {
  totalInfections: number;
  threatsNeutralized: number;
  efficiency: number;
}

export default function Dashboard() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showPheromones, setShowPheromones] = useState(true);
  const [showAnts, setShowAnts] = useState(true);
  const [currentView, setCurrentView] = useState<ViewMode>("simulation");

  const [antCount, setAntCount] = useState(50);
  const [alpha, setAlpha] = useState(1.0);
  const [beta, setBeta] = useState(2.0);
  const [rho, setRho] = useState(0.1);
  const [simSpeed, setSimSpeed] = useState(1.0);
  const [malwareRate, setMalwareRate] = useState(0.20);

  const simRef = useRef<ACOSimulation | null>(null);
  const frameRef = useRef<number>(0);
  const [simState, setSimState] = useState<SimulationState | null>(null);
  const [cycleAnalytics, setCycleAnalytics] = useState<CycleAnalytics | null>(null);
  const wasPlayingRef = useRef(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ w: 800, h: 500 });

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
      const network = await generateNetwork(18, dims.w, dims.h);
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



  const handleStartStop = () => {
    if (!isPlaying && simRef.current) {
      simRef.current.resetCycleAnalytics();
      setCycleAnalytics(null);
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="h-screen bg-[#020617] text-white flex flex-col overflow-hidden font-sans">
      <Header />

      <div className="flex-1 overflow-hidden relative flex flex-col">
        {/* Chrome-like Tab Navigation */}
        <div className="flex items-end px-4 gap-2 border-b border-white/10 bg-black/40 pt-2 shrink-0 z-10">
          <button
            onClick={() => setCurrentView("simulation")}
            className={`
              relative px-6 py-2 rounded-t-lg text-sm font-bold font-mono tracking-wider transition-all
              flex items-center gap-2
              ${currentView === "simulation"
                ? "bg-primary/10 text-primary border-t border-x border-primary/20 after:absolute after:-bottom-[1px] after:left-0 after:right-0 after:h-[1px] after:bg-black"
                : "text-muted-foreground hover:bg-white/5 hover:text-white border-t border-x border-transparent"}
            `}
          >
            <Monitor className="w-4 h-4" />
            SIMULATION
          </button>

          <button
            onClick={() => setCurrentView("presentation")}
            className={`
              relative px-6 py-2 rounded-t-lg text-sm font-bold font-mono tracking-wider transition-all
              flex items-center gap-2
              ${currentView === "presentation"
                ? "bg-white/10 text-white border-t border-x border-white/20 after:absolute after:-bottom-[1px] after:left-0 after:right-0 after:h-[1px] after:bg-black"
                : "text-muted-foreground hover:bg-white/5 hover:text-white border-t border-x border-transparent"}
            `}
          >
            <FileText className="w-4 h-4" />
            PRESENTATION
          </button>

          <button
            onClick={() => setCurrentView("research")}
            className={`
              relative px-6 py-2 rounded-t-lg text-sm font-bold font-mono tracking-wider transition-all
              flex items-center gap-2
              ${currentView === "research"
                ? "bg-secondary/10 text-secondary border-t border-x border-secondary/20 after:absolute after:-bottom-[1px] after:left-0 after:right-0 after:h-[1px] after:bg-black"
                : "text-muted-foreground hover:bg-white/5 hover:text-white border-t border-x border-transparent"}
            `}
          >
            RESEARCH
          </button>

          <button
            onClick={() => setCurrentView("credits")}
            className={`
              relative px-6 py-2 rounded-t-lg text-sm font-bold font-mono tracking-wider transition-all
              flex items-center gap-2
              ${currentView === "credits"
                ? "bg-orange-500/10 text-orange-500 border-t border-x border-orange-500/20 after:absolute after:-bottom-[1px] after:left-0 after:right-0 after:h-[1px] after:bg-black"
                : "text-muted-foreground hover:bg-white/5 hover:text-white border-t border-x border-transparent"}
            `}
          >
            <Users className="w-4 h-4" />
            CREDITS
          </button>
        </div>

        {/* View Content Area */}
        <div className="flex-1 overflow-hidden relative">

          {/* SIMULATION VIEW */}
          {currentView === "simulation" && (
            <div className="absolute inset-0 flex overflow-hidden">
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

                {cycleAnalytics && (
                  <div className="p-4 border-t border-primary/20 bg-black/80 shrink-0">
                    <h3 className="text-xs font-mono uppercase tracking-widest text-primary font-bold mb-4">Cycle Analytics Summary</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="border border-white/10 bg-white/5 rounded p-4">
                        <div className="text-sm font-mono uppercase text-muted-foreground">Total Infections</div>
                        <div className="text-4xl font-bold text-red-500">{cycleAnalytics.totalInfections}</div>
                      </div>
                      <div className="border border-white/10 bg-white/5 rounded p-4">
                        <div className="text-sm font-mono uppercase text-muted-foreground">Threats Neutralized</div>
                        <div className="text-4xl font-bold text-green-500">{cycleAnalytics.threatsNeutralized}</div>
                      </div>
                      <div className="border border-white/10 bg-white/5 rounded p-4">
                        <div className="text-sm font-mono uppercase text-muted-foreground">Algorithm Efficiency</div>
                        <div className="text-4xl font-bold text-primary">{cycleAnalytics.efficiency.toFixed(1)}%</div>
                      </div>
                    </div>
                    <div className="text-[10px] font-mono text-muted-foreground border border-white/10 bg-white/5 rounded p-3">
                      <span className="text-primary font-bold">Efficiency Formula:</span> Efficiency = (Threats Neutralized / Total Threat Events) × 100
                    </div>
                  </div>
                )}

                <div className="bg-black/95 border-t border-primary/20 p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-[13px] font-mono shrink-0">
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

                  </div>

                  <div className="border-l border-white/10 pl-6 space-y-2">
                    <h4 className="text-primary font-bold uppercase tracking-widest text-xs">Cyber-Defense mapping</h4>
                    <p className="text-white/60 leading-relaxed">
                      <span className="text-primary font-bold">Ants:</span> Decentralized security agents.<br />
                      <span className="text-primary font-bold">Pheromones:</span> Shared threat intelligence.<br />
                      <span className="text-primary font-bold">Path Reinforcement:</span> Correlated threat confidence.
                    </p>
                  </div>
                </div>

                <div className="border-t border-white/10 bg-black/60 shrink-0">
                  <Tabs defaultValue="theory" className="flex flex-col">
                    <TabsList className="bg-transparent border-b border-white/5 rounded-none h-12 px-4 justify-start">
                      <TabsTrigger value="theory" className="text-[15px] uppercase font-mono tracking-widest data-[state=active]:text-primary">Operational Logic</TabsTrigger>
                    </TabsList>
                    <TabsContent value="theory" className="p-4 m-0">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm leading-relaxed text-muted-foreground">
                        <div>
                          <span className="text-primary font-bold block mb-2 text-base">HISTORY (α)</span>
                          Ants communicate indirectly via pheromone trails. High Alpha forces agents to reinforce discovered paths, leading to rapid system-wide consensus on threat locations.
                          <div className="mt-2 text-base italic opacity-80 border-l-2 border-primary/30 pl-2">
                            Alpha (α) scales memory; Beta (β) scales response urgency.
                          </div>
                        </div>
                        <div>
                          <span className="text-secondary font-bold block mb-2 text-base">LOCAL SEARCH (β)</span>
                          Heuristic visibility. High Beta allows agents to prioritize immediate node-level anomalies, effectively acting as high-sensitivity local sensors.
                          <div className="mt-2 text-base italic opacity-80 border-l-2 border-secondary/30 pl-2">
                            Agents reorganize paths in real-time based on shared intelligence (Pheromones).
                          </div>
                        </div>
                        <div>
                          <span className="text-white font-bold block mb-2 text-base">DECAY (ρ)</span>
                          Evaporation prevents permanent bias. It allows the system to "forget" old threats and false positives, ensuring detection remains adaptive and current.
                        </div>
                        <div className="col-span-1 md:col-span-3 mt-4 pt-6 border-t border-white/10">
                          <span className="text-white font-bold block mb-3 text-base uppercase tracking-widest text-[#f59e0b]">Simulation Overview</span>
                          <p className="mb-3 text-lg">
                            Think of this simulation as a digital immune system. Just as ants find the fastest route to food by leaving scent trails (pheromones), our "Cyber Ants" find the fastest route to security threats.
                          </p>
                          <p className="mb-3 text-lg">
                            When a node gets "infected" (turns red), ants that find it leave a digital signal. Other ants smell this signal and rush to help, creating a thick, glowing path that alerts the entire network to the danger instantly.
                          </p>
                          <p className="text-lg">
                            You are watching <strong>real-time emergent intelligence</strong>. No central computer is telling the ants where to go—they figure it out together, dynamically adapting to new threats as they appear on the screen. It's a powerful live demonstration of how decentralized systems can solve complex security problems faster than a single central controller.
                          </p>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>

                  {/* Credits section removed from here */}

                </div>
              </div>
            </div>
          )}

          {currentView === "presentation" && (
            <div className="h-full overflow-y-auto p-8 bg-black/40">
              <div className="w-full max-w-5xl mx-auto">
                <PresentationViewer />
              </div>
            </div>
          )}

          {/* RESEARCH VIEW */}
          {currentView === "research" && (
            <div className="h-full overflow-auto bg-black/40">
              <div className="max-w-4xl mx-auto py-8">
                <ResearchSources />
              </div>
            </div>
          )}

          {/* CREDITS VIEW */}
          {currentView === "credits" && (
            <div className="h-full overflow-auto bg-black/40">
              <div className="max-w-5xl mx-auto py-12 px-8">
                <div className="mt-8">
                  <h4 className="text-xl font-mono font-bold text-orange-500 mb-8 uppercase tracking-widest opacity-90">Credits</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 leading-relaxed">

                    <div className="p-6 rounded-2xl border border-white/10 bg-white/5 hover:border-orange-500/30 transition-all flex gap-5 items-start">
                      <div className="w-16 h-16 rounded-full bg-white/10 shrink-0 border border-white/10 flex items-center justify-center overflow-hidden">
                        <Users className="w-8 h-8 text-white/20" />
                      </div>
                      <div>
                        <span className="text-2xl text-white font-bold block mb-2">Naman Shah</span>
                        <span className="text-base text-muted-foreground block leading-relaxed">Tech Lead. End to End Development of ACO Simulation and Website. Made the ACO presentation and presented it.</span>
                      </div>
                    </div>

                    <div className="p-6 rounded-2xl border border-white/10 bg-white/5 hover:border-orange-500/30 transition-all flex gap-5 items-start">
                      <div className="w-16 h-16 rounded-full bg-white/10 shrink-0 border border-white/10 flex items-center justify-center overflow-hidden">
                        <Users className="w-8 h-8 text-white/20" />
                      </div>
                      <div>
                        <span className="text-2xl text-white font-bold block mb-2">Krish Mehta</span>
                        <span className="text-base text-muted-foreground block leading-relaxed">Overall Management and Research Lead. SMA presentation content and Research papers for ACO/SMA.</span>
                      </div>
                    </div>

                    <div className="p-6 rounded-2xl border border-white/10 bg-white/5 hover:border-orange-500/30 transition-all flex gap-5 items-start">
                      <div className="w-16 h-16 rounded-full bg-white/10 shrink-0 border border-white/10 flex items-center justify-center overflow-hidden">
                        <Users className="w-8 h-8 text-white/20" />
                      </div>
                      <div>
                        <span className="text-2xl text-white font-bold block mb-2">Tanish Shah</span>
                        <span className="text-base text-muted-foreground block leading-relaxed">Presentation Lead. Made the SMA presentation and presented it in collaboration with Krish Mehta.</span>
                      </div>
                    </div>

                    <div className="p-6 rounded-2xl border border-white/10 bg-white/5 hover:border-orange-500/30 transition-all flex gap-5 items-start">
                      <div className="w-16 h-16 rounded-full bg-white/10 shrink-0 border border-white/10 flex items-center justify-center overflow-hidden">
                        <Users className="w-8 h-8 text-white/20" />
                      </div>
                      <div>
                        <span className="text-2xl text-white font-bold block mb-2">Shriija Nagrale</span>
                        <span className="text-base text-muted-foreground block leading-relaxed">Video References for SMA and ACO.</span>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>


    </div >
  );
}
