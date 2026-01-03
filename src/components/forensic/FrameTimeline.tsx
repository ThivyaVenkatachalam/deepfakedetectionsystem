import { useState } from "react";
import { Play, Pause, ChevronLeft, ChevronRight, Eye, AlertTriangle, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { FrameAnalysis, VerdictLevel } from "@/types/analysis";
import { cn } from "@/lib/utils";

interface FrameTimelineProps {
  frames: FrameAnalysis[];
}

const getVerdictColor = (verdict: VerdictLevel) => {
  switch (verdict) {
    case 'safe': return 'bg-success';
    case 'warning': return 'bg-warning';
    case 'danger': return 'bg-destructive';
  }
};

const getVerdictIcon = (verdict: VerdictLevel) => {
  switch (verdict) {
    case 'safe': return <Check className="w-3 h-3" />;
    case 'warning': return <Eye className="w-3 h-3" />;
    case 'danger': return <AlertTriangle className="w-3 h-3" />;
  }
};

export function FrameTimeline({ frames }: FrameTimelineProps) {
  const [selectedFrame, setSelectedFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const currentFrame = frames[selectedFrame];

  const handlePrev = () => {
    setSelectedFrame(prev => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setSelectedFrame(prev => Math.min(frames.length - 1, prev + 1));
  };

  return (
    <div className="glass-panel p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          Frame-by-Frame Analysis
        </h3>
        <span className="text-xs font-mono text-muted-foreground">
          {frames.length} frames analyzed
        </span>
      </div>

      {/* Timeline visualization */}
      <div className="relative h-12 bg-secondary/50 rounded-lg overflow-hidden">
        <div className="absolute inset-0 flex">
          {frames.map((frame, idx) => (
            <div
              key={idx}
              onClick={() => setSelectedFrame(idx)}
              className={cn(
                "flex-1 cursor-pointer transition-all hover:opacity-100 border-r border-background/20 last:border-r-0",
                getVerdictColor(frame.verdict),
                idx === selectedFrame ? "opacity-100 ring-2 ring-primary ring-inset" : "opacity-60"
              )}
              title={`Frame ${frame.frameNumber}: ${frame.verdict}`}
            />
          ))}
        </div>
        {/* Playhead */}
        <div 
          className="absolute top-0 bottom-0 w-0.5 bg-foreground shadow-lg transition-all"
          style={{ left: `${(selectedFrame / frames.length) * 100}%` }}
        />
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-2">
        <Button variant="ghost" size="sm" onClick={handlePrev} disabled={selectedFrame === 0}>
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setIsPlaying(!isPlaying)}
          className="w-24"
        >
          {isPlaying ? <Pause className="w-4 h-4 mr-1" /> : <Play className="w-4 h-4 mr-1" />}
          {isPlaying ? 'Pause' : 'Play'}
        </Button>
        <Button variant="ghost" size="sm" onClick={handleNext} disabled={selectedFrame === frames.length - 1}>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Selected frame details */}
      {currentFrame && (
        <div className={cn(
          "p-4 rounded-lg border",
          currentFrame.verdict === 'safe' && "bg-success/10 border-success/30",
          currentFrame.verdict === 'warning' && "bg-warning/10 border-warning/30",
          currentFrame.verdict === 'danger' && "bg-destructive/10 border-destructive/30"
        )}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className={cn(
                "p-1.5 rounded-md",
                getVerdictColor(currentFrame.verdict)
              )}>
                {getVerdictIcon(currentFrame.verdict)}
              </span>
              <span className="font-mono text-sm">
                Frame #{currentFrame.frameNumber}
              </span>
            </div>
            <span className="text-xs text-muted-foreground font-mono">
              {currentFrame.timestamp.toFixed(2)}s
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            {currentFrame.blinkingPattern !== undefined && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Blink Rate</p>
                <p className="font-mono">{currentFrame.blinkingPattern.toFixed(1)} / min</p>
              </div>
            )}
            {currentFrame.facialConsistency !== undefined && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Facial Consistency</p>
                <p className="font-mono">{(currentFrame.facialConsistency * 100).toFixed(1)}%</p>
              </div>
            )}
          </div>

          {currentFrame.anomalies.length > 0 && (
            <div className="mt-3 pt-3 border-t border-current/20">
              <p className="text-xs font-semibold mb-2">Detected Anomalies:</p>
              <ul className="space-y-1">
                {currentFrame.anomalies.map((anomaly, i) => (
                  <li key={i} className="text-xs flex items-center gap-2">
                    <AlertTriangle className="w-3 h-3 text-warning" />
                    {anomaly}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
