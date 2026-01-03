import { useEffect, useRef } from "react";
import type { SpectrogramData } from "@/types/analysis";

interface SpectrogramProps {
  data: SpectrogramData;
}

export function Spectrogram({ data }: SpectrogramProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.fillStyle = 'hsl(222, 47%, 8%)';
    ctx.fillRect(0, 0, width, height);

    // Draw spectrogram
    const freqBins = data.frequencies.length;
    const timeBins = data.timeSteps.length;
    const binWidth = width / timeBins;
    const binHeight = height / freqBins;

    for (let t = 0; t < timeBins; t++) {
      for (let f = 0; f < freqBins; f++) {
        const magnitude = data.magnitudes[f]?.[t] || 0;
        const normalizedMag = Math.min(magnitude / 100, 1);
        
        // Color mapping (cool to hot)
        const hue = 280 - normalizedMag * 240; // Purple to red
        const saturation = 80 + normalizedMag * 20;
        const lightness = 20 + normalizedMag * 50;
        
        ctx.fillStyle = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
        ctx.fillRect(
          t * binWidth,
          height - (f + 1) * binHeight,
          binWidth + 1,
          binHeight + 1
        );
      }
    }

    // Highlight suspicious regions
    data.suspiciousRegions.forEach(region => {
      const startX = (region.start / data.timeSteps.length) * width;
      const endX = (region.end / data.timeSteps.length) * width;
      
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.8)';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(startX, 0, endX - startX, height);
      ctx.setLineDash([]);
      
      // Label
      ctx.fillStyle = 'rgba(239, 68, 68, 0.9)';
      ctx.font = '10px JetBrains Mono';
      ctx.fillText(region.reason, startX + 4, 14);
    });

    // Draw axes labels
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = '10px JetBrains Mono';
    ctx.fillText('Freq (Hz)', 5, height - 5);
    ctx.fillText('Time (s)', width - 50, height - 5);

  }, [data]);

  return (
    <div className="glass-panel p-4">
      <h3 className="text-sm font-semibold mb-3 text-foreground flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
        Mel-Spectrogram Analysis
      </h3>
      <div className="relative rounded-lg overflow-hidden border border-border">
        <canvas
          ref={canvasRef}
          width={600}
          height={200}
          className="w-full"
        />
        <div className="absolute left-0 top-0 bottom-0 w-8 flex flex-col justify-between py-2 text-[8px] font-mono text-muted-foreground">
          <span>8kHz</span>
          <span>4kHz</span>
          <span>0Hz</span>
        </div>
      </div>
      {data.suspiciousRegions.length > 0 && (
        <div className="mt-3 p-3 rounded-lg bg-destructive/10 border border-destructive/30">
          <p className="text-xs font-semibold text-destructive mb-2">Suspicious Regions Detected:</p>
          <ul className="space-y-1">
            {data.suspiciousRegions.map((region, i) => (
              <li key={i} className="text-xs text-foreground/80">
                • {region.start.toFixed(1)}s - {region.end.toFixed(1)}s: {region.reason}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
