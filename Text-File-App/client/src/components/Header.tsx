import { Link } from "wouter";
import { Activity, Share2, Save, Github } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Header({ onSave }: { onSave?: () => void }) {
  return (
    <header className="h-16 border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-50 px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center border border-primary/30">
          <Activity className="w-6 h-6 text-primary animate-pulse" />
        </div>
        <div>
          <h1 className="text-xl font-bold font-display tracking-tight leading-none text-foreground">
            Cyber<span className="text-primary">Ant</span> Defense
          </h1>
          <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest">
            ACO Threat Simulation v1.0
          </p>
        </div>
      </div>

      <nav className="flex items-center gap-4">
        <Button 
          variant="outline" 
          size="sm" 
          className="hidden md:flex gap-2 font-mono text-xs border-primary/30 hover:bg-primary/10 hover:text-primary"
          onClick={onSave}
        >
          <Save className="w-4 h-4" />
          SAVE PRESET
        </Button>
        <a href="https://github.com" target="_blank" rel="noopener noreferrer">
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
            <Github className="w-5 h-5" />
          </Button>
        </a>
      </nav>
    </header>
  );
}
