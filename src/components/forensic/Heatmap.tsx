import { useEffect, useRef, useState } from "react";
import type { HeatmapPoint } from "@/types/analysis";

interface HeatmapProps {
  imageUrl: string;
  points: HeatmapPoint[];
}

export function Heatmap({ imageUrl, points }: HeatmapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      const container = containerRef.current;
      if (!container) return;
      
      const containerWidth = container.clientWidth;
      const scale = containerWidth / img.width;
      const height = img.height * scale;
      
      setDimensions({ width: containerWidth, height });
    };
    img.src = imageUrl;
  }, [imageUrl]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || dimensions.width === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      // Draw base image
      ctx.drawImage(img, 0, 0, dimensions.width, dimensions.height);

      // Draw heatmap overlay
      points.forEach(point => {
        const x = point.x * dimensions.width;
        const y = point.y * dimensions.height;
        const radius = 40 + point.intensity * 30;
        
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
        
        if (point.intensity > 0.7) {
          gradient.addColorStop(0, 'rgba(239, 68, 68, 0.7)');
          gradient.addColorStop(0.5, 'rgba(239, 68, 68, 0.3)');
          gradient.addColorStop(1, 'rgba(239, 68, 68, 0)');
        } else if (point.intensity > 0.4) {
          gradient.addColorStop(0, 'rgba(245, 158, 11, 0.6)');
          gradient.addColorStop(0.5, 'rgba(245, 158, 11, 0.25)');
          gradient.addColorStop(1, 'rgba(245, 158, 11, 0)');
        } else {
          gradient.addColorStop(0, 'rgba(34, 197, 94, 0.4)');
          gradient.addColorStop(0.5, 'rgba(34, 197, 94, 0.15)');
          gradient.addColorStop(1, 'rgba(34, 197, 94, 0)');
        }
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      });
    };
    img.src = imageUrl;
  }, [imageUrl, points, dimensions]);

  return (
    <div className="glass-panel p-4">
      <h3 className="text-sm font-semibold mb-3 text-foreground flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
        Grad-CAM Heatmap Analysis
      </h3>
      <div ref={containerRef} className="relative rounded-lg overflow-hidden border border-border">
        <canvas
          ref={canvasRef}
          width={dimensions.width}
          height={dimensions.height}
          className="w-full"
        />
      </div>
      <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-success" /> Low suspicion
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-warning" /> Medium
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-destructive" /> High suspicion
          </span>
        </div>
      </div>
    </div>
  );
}
