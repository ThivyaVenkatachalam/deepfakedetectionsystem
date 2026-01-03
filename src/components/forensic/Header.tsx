import { Shield, Clock, FlaskConical, Globe } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  activeMode: 'forensic' | 'webwatch';
  onModeChange: (mode: 'forensic' | 'webwatch') => void;
}

export function Header({ activeMode, onModeChange }: HeaderProps) {
  const currentTime = new Date().toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    dateStyle: 'medium',
    timeStyle: 'short'
  });

  return (
    <header className="glass-panel border-b border-border/50 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-cyan-400 flex items-center justify-center shadow-glow-primary">
              <Shield className="w-6 h-6 text-primary-foreground" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-success rounded-full border-2 border-background animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gradient-primary">
              AI DeepFake Detection System
            </h1>
            <p className="text-sm text-muted-foreground">
              Detect Manipulated Images, Videos and URLs
            </p>
          </div>
        </div>

        {/* Mode Tabs */}
        <div className="flex items-center gap-1 p-1 rounded-lg bg-muted/50">
          <Button
            variant={activeMode === 'forensic' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onModeChange('forensic')}
            className="gap-2"
          >
            <FlaskConical className="w-4 h-4" />
            Forensic Lab
          </Button>
          <Button
            variant={activeMode === 'webwatch' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onModeChange('webwatch')}
            className="gap-2"
          >
            <Globe className="w-4 h-4" />
            Web Watch
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span className="text-sm font-mono">{currentTime}</span>
          </div>
          <ThemeToggle />
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-success/10 border border-success/30">
            <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
            <span className="text-sm font-medium text-success">System Online</span>
          </div>
        </div>
      </div>
    </header>
  );
}
