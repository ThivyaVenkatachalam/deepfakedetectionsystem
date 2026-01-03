import { FileCode, AlertTriangle, Check, X } from "lucide-react";
import type { ExifData } from "@/types/analysis";

interface ExifPanelProps {
  data: ExifData;
}

export function ExifPanel({ data }: ExifPanelProps) {
  const entries = Object.entries(data).filter(([_, value]) => value !== undefined);
  
  return (
    <div className="glass-panel p-4">
      <h3 className="text-sm font-semibold mb-4 text-foreground flex items-center gap-2">
        <FileCode className="w-4 h-4 text-primary" />
        EXIF Metadata Extraction
      </h3>

      <div className="space-y-2">
        {entries.map(([key, value]) => (
          <div 
            key={key}
            className="flex items-center justify-between py-2 px-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
          >
            <span className="text-xs text-muted-foreground uppercase tracking-wide">
              {key.replace(/([A-Z])/g, ' $1').trim()}
            </span>
            {typeof value === 'boolean' ? (
              <span className={`flex items-center gap-1 text-sm font-medium ${value ? 'text-warning' : 'text-success'}`}>
                {value ? <AlertTriangle className="w-3 h-3" /> : <Check className="w-3 h-3" />}
                {value ? 'Yes' : 'No'}
              </span>
            ) : (
              <span className="text-sm font-mono text-foreground">{value}</span>
            )}
          </div>
        ))}
      </div>

      {data.modified && (
        <div className="mt-4 p-3 rounded-lg bg-warning/10 border border-warning/30">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-warning">Modification Detected</p>
              <p className="text-xs text-foreground/70 mt-1">
                EXIF metadata indicates this file has been edited with software after original capture.
              </p>
            </div>
          </div>
        </div>
      )}

      {!data.camera && !data.dateCreated && (
        <div className="mt-4 p-3 rounded-lg bg-destructive/10 border border-destructive/30">
          <div className="flex items-start gap-2">
            <X className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-destructive">Stripped Metadata</p>
              <p className="text-xs text-foreground/70 mt-1">
                Critical EXIF data is missing. This is common in manipulated or AI-generated content.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
