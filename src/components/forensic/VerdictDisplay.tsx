import { Shield, AlertTriangle, XOctagon, Loader2 } from "lucide-react";
import type { VerdictLevel, AnalysisResult } from "@/types/analysis";
import { cn } from "@/lib/utils";

interface VerdictDisplayProps {
  result: AnalysisResult | null;
  isAnalyzing: boolean;
}

const verdictConfig: Record<VerdictLevel, {
  icon: typeof Shield;
  label: string;
  description: string;
  className: string;
}> = {
  safe: {
    icon: Shield,
    label: "AUTHENTIC",
    description: "No manipulation detected",
    className: "verdict-safe",
  },
  warning: {
    icon: AlertTriangle,
    label: "SUSPICIOUS",
    description: "Potential manipulation detected",
    className: "verdict-warning",
  },
  danger: {
    icon: XOctagon,
    label: "DEEPFAKE DETECTED",
    description: "High probability of manipulation",
    className: "verdict-danger",
  },
};

export function VerdictDisplay({ result, isAnalyzing }: VerdictDisplayProps) {
  if (isAnalyzing) {
    return (
      <div className="glass-panel p-8 flex flex-col items-center justify-center min-h-[200px]">
        <div className="relative">
          <div className="w-20 h-20 rounded-full border-4 border-primary/30 flex items-center justify-center">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
          </div>
          <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" style={{ animationDuration: '1.5s' }} />
        </div>
        <p className="mt-6 text-lg font-semibold text-foreground">Analyzing ...</p>
        <p className="text-sm text-muted-foreground mt-1">Running detection algorithms</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="glass-panel p-8 flex flex-col items-center justify-center min-h-[200px]">
        <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
          <Shield className="w-8 h-8 text-muted-foreground" />
        </div>
        <p className="text-lg font-medium text-muted-foreground">Awaiting</p>
        <p className="text-sm text-muted-foreground mt-1">Upload a file to begin analysis</p>
      </div>
    );
  }

  const config = verdictConfig[result.verdict];
  const Icon = config.icon;

  return (
    <div className={cn("glass-panel p-8 border-2 animate-fade-in", config.className)}>
      <div className="flex items-start gap-6">
        <div className="w-20 h-20 rounded-2xl bg-current/10 flex items-center justify-center flex-shrink-0">
          <Icon className="w-10 h-10" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-2xl font-bold tracking-wide">{config.label}</h3>
            <span className="px-3 py-1 rounded-full bg-current/10 text-sm font-mono font-semibold">
              {(result.confidenceScore * 100).toFixed(1)}% confidence
            </span>
          </div>
          
          <p className="text-foreground/80 mb-4">{config.description}</p>
          
          <div className="p-4 rounded-lg bg-background/50 border border-current/20">
            <h4 className="text-sm font-semibold mb-2 text-foreground">Explanation:</h4>
            <p className="text-sm text-foreground/80 leading-relaxed">
              {result.explanation}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-current/20">
        <div className="grid grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-xs text-foreground/60 mb-1">File Hash (SHA-256)</p>
            <p className="font-mono text-xs text-foreground/80 truncate">{result.fileHash.slice(0, 16)}...</p>
          </div>
          <div>
            <p className="text-xs text-foreground/60 mb-1">Processing Time</p>
            <p className="font-mono text-sm text-foreground/80">{result.technicalDetails.processingTime}ms</p>
          </div>
          <div>
            <p className="text-xs text-foreground/60 mb-1">Model</p>
            <p className="font-mono text-sm text-foreground/80">{result.technicalDetails.modelUsed}</p>
          </div>
          <div>
            <p className="text-xs text-foreground/60 mb-1">Anomalies Found</p>
            <p className="font-mono text-sm text-foreground/80">{result.technicalDetails.anomalies.length}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
