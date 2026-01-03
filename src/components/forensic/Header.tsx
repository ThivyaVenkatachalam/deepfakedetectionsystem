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
    <header className="glass-panel border-b border-border/50 px-4 py-3 md:px-6 md:py-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        {/* Logo and Title */}
        <div className="flex items-center gap-3 md:gap-4">
          <div className="relative">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-primary to-cyan-400 flex items-center justify-center shadow-glow-primary">
              <Shield className="w-5 h-5 md:w-6 md:h-6 text-primary-foreground" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-3 h-3 md:w-4 md:h-4 bg-success rounded-full border-2 border-background animate-pulse" />
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-bold text-gradient-primary">
              AI DeepFake Detection
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground hidden sm:block">
              Detect Manipulated Images, Videos and URLs
            </p>
          </div>
        </div>

        {/* Mode Tabs - Full width on mobile */}
        <div className="flex items-center justify-center gap-1 p-1 rounded-lg bg-muted/50 w-full md:w-auto">
          <Button
            variant={activeMode === 'forensic' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onModeChange('forensic')}
            className="gap-2 flex-1 md:flex-none"
          >
            <FlaskConical className="w-4 h-4" />
            <span className="text-sm">QuickScan</span>
          </Button>
          <Button
            variant={activeMode === 'webwatch' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onModeChange('webwatch')}
            className="gap-2 flex-1 md:flex-none"
          >
            <Globe className="w-4 h-4" />
            <span className="text-sm">Web Watch</span>
          </Button>
        </div>

        {/* Status bar - Hidden on mobile, visible on larger screens */}
        <div className="hidden lg:flex items-center gap-4">
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

        {/* Mobile status bar */}
        <div className="flex lg:hidden items-center justify-between">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span className="text-xs font-mono">{currentTime}</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-success/10 border border-success/30">
              <div className="w-1.5 h-1.5 bg-success rounded-full animate-pulse" />
              <span className="text-xs font-medium text-success">Online</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
