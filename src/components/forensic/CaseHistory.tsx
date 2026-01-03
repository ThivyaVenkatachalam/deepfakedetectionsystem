import { History, Image, Music, Video, Shield, AlertTriangle, XOctagon } from "lucide-react";
import type { AnalysisResult, VerdictLevel } from "@/types/analysis";
import { cn } from "@/lib/utils";

interface CaseHistoryProps {
  cases: AnalysisResult[];
  onSelectCase: (caseId: string) => void;
  selectedCaseId?: string;
}

const getVerdictIcon = (verdict: VerdictLevel) => {
  switch (verdict) {
    case 'safe': return <Shield className="w-4 h-4 text-success" />;
    case 'warning': return <AlertTriangle className="w-4 h-4 text-warning" />;
    case 'danger': return <XOctagon className="w-4 h-4 text-destructive" />;
  }
};

const getFileIcon = (type: string) => {
  switch (type) {
    case 'image': return <Image className="w-4 h-4" />;
    case 'audio': return <Music className="w-4 h-4" />;
    case 'video': return <Video className="w-4 h-4" />;
    default: return null;
  }
};

export function CaseHistory({ cases, onSelectCase, selectedCaseId }: CaseHistoryProps) {
  return (
    <div className="glass-panel p-4 h-full flex flex-col">
      <h3 className="text-sm font-semibold mb-4 text-foreground flex items-center gap-2">
        <History className="w-4 h-4 text-primary" />
        Case History
        <span className="ml-auto text-xs font-mono text-muted-foreground">
          {cases.length} cases
        </span>
      </h3>

      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {cases.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <History className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No cases analyzed yet</p>
          </div>
        ) : (
          cases.map((caseItem) => (
            <button
              key={caseItem.id}
              onClick={() => onSelectCase(caseItem.id)}
              className={cn(
                "w-full p-3 rounded-lg text-left transition-all",
                "border hover:border-primary/50",
                selectedCaseId === caseItem.id
                  ? "bg-primary/10 border-primary/50"
                  : "bg-secondary/30 border-transparent"
              )}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-secondary">
                  {getFileIcon(caseItem.fileType)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate text-foreground">
                    {caseItem.fileName}
                  </p>
                  <p className="text-xs text-muted-foreground font-mono">
                    {new Date(caseItem.timestamp).toLocaleString('en-IN', {
                      dateStyle: 'short',
                      timeStyle: 'short'
                    })}
                  </p>
                </div>
                {getVerdictIcon(caseItem.verdict)}
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
