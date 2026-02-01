import { Link } from "wouter";
import { Activity, Link2, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export function Header() {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    toast({
      title: "Link Copied",
      description: "Simulation URL copied to clipboard.",
    });

    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="h-20 border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-50 px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center border border-primary/30">
          <Activity className="w-6 h-6 text-primary animate-pulse" />
        </div>
        <div>
          <h1 className="text-[28px] font-bold font-display tracking-tight leading-none text-foreground">
            Cyber<span className="text-primary">Ant</span> Defense
          </h1>

        </div>
      </div>

      <nav className="flex items-center gap-4">
        <span className="text-[14px] font-mono text-primary uppercase tracking-widest hidden md:block animate-pulse drop-shadow-[0_0_13px_rgba(16,185,129,0.8)]">
          Support our work by sharing!
        </span>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2 border-primary/20 hover:bg-primary/10 text-primary font-mono text-xs uppercase tracking-wider transition-all"
          onClick={handleCopyLink}
        >
          {copied ? <Check className="w-4 h-4" /> : <Link2 className="w-4 h-4" />}
          {copied ? "Copied" : "Copy Link"}
        </Button>
      </nav>
    </header>
  );
}

