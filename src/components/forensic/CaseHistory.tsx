import { useState } from "react";
import { History, Image, Music, Video, Shield, AlertTriangle, XOctagon, Trash2 } from "lucide-react";
import type { AnalysisResult, VerdictLevel } from "@/types/analysis";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";

interface CaseHistoryProps {
  cases: AnalysisResult[];
  onSelectCase: (caseId: string) => void;
  onDeleteCase: (caseId: string) => Promise<boolean>;
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

export function CaseHistory({ cases, onSelectCase, onDeleteCase, selectedCaseId }: CaseHistoryProps) {
  const [deleteTarget, setDeleteTarget] = useState<AnalysisResult | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    
    setIsDeleting(true);
    const success = await onDeleteCase(deleteTarget.id);
    setIsDeleting(false);
    setDeleteTarget(null);
    
    if (success) {
      toast({
        title: "Deletion Complete",
        description: "All media, analysis results, and metadata have been permanently erased.",
      });
    } else {
      toast({
        title: "Deletion Failed",
        description: "Unable to delete the case. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
    <div className="glass-panel p-4 h-full flex flex-col">
      <h3 className="text-sm font-semibold mb-4 text-foreground flex items-center gap-2">
        <History className="w-4 h-4 text-primary" />
        History
        <span className="ml-auto text-xs font-mono text-muted-foreground">
          {cases.length} cases
        </span>
      </h3>

      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {cases.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <History className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Not analyzed yet</p>
          </div>
        ) : (
          cases.map((caseItem) => (
              <div
                key={caseItem.id}
                className={cn(
                  "w-full p-3 rounded-lg text-left transition-all group",
                  "border hover:border-primary/50",
                  selectedCaseId === caseItem.id
                    ? "bg-primary/10 border-primary/50"
                    : "bg-secondary/30 border-transparent"
                )}
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => onSelectCase(caseItem.id)}
                    className="p-2 rounded-lg bg-secondary"
                  >
                    {getFileIcon(caseItem.fileType)}
                  </button>
                  <button
                    onClick={() => onSelectCase(caseItem.id)}
                    className="flex-1 min-w-0 text-left"
                  >
                    <p className="text-sm font-medium truncate text-foreground">
                      {caseItem.fileName}
                    </p>
                    <p className="text-xs text-muted-foreground font-mono">
                      {new Date(caseItem.timestamp).toLocaleString('en-IN', {
                        dateStyle: 'short',
                        timeStyle: 'short'
                      })}
                    </p>
                  </button>
                  {getVerdictIcon(caseItem.verdict)}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteTarget(caseItem);
                    }}
                    className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/20 text-muted-foreground hover:text-destructive"
                    title="Delete case"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
          ))
        )}
      </div>
    </div>

    <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Analysis Case</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete all data associated with this case:
            <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
              <li>Uploaded media file</li>
              <li>Analysis results and confidence scores</li>
              <li>All logs and metadata</li>
            </ul>
            <p className="mt-3 font-medium">This action cannot be undone. No data will be retained or sent to third parties.</p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleDelete} 
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? "Deleting..." : "Delete Permanently"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
