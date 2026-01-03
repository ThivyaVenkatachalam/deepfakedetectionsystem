import { useState, useEffect } from "react";
import { Header } from "@/components/forensic/Header";
import { FileUploader } from "@/components/forensic/FileUploader";
import { VerdictDisplay } from "@/components/forensic/VerdictDisplay";
import { Heatmap } from "@/components/forensic/Heatmap";
import { Spectrogram } from "@/components/forensic/Spectrogram";
import { FrameTimeline } from "@/components/forensic/FrameTimeline";
import { ExifPanel } from "@/components/forensic/ExifPanel";
import { CaseHistory } from "@/components/forensic/CaseHistory";
import { ReportGenerator } from "@/components/forensic/ReportGenerator";
import { useAnalysis } from "@/hooks/useAnalysis";
import type { MediaType } from "@/types/analysis";

export default function Index() {
  const { result, history, isAnalyzing, analyzeFile, selectCase } = useAnalysis();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileSelect = async (file: File, type: MediaType) => {
    if (type === 'image') {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl(null);
    }
    await analyzeFile(file, type);
  };

  // Cleanup preview URL
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return (
    <div className="min-h-screen bg-background forensic-grid">
      <Header />
      
      <main className="p-6">
        <div className="max-w-[1800px] mx-auto">
          <div className="grid grid-cols-12 gap-6">
            {/* Left Sidebar - Case History */}
            <aside className="col-span-12 lg:col-span-2 order-2 lg:order-1">
              <CaseHistory 
                cases={history} 
                onSelectCase={selectCase}
                selectedCaseId={result?.id}
              />
            </aside>

            {/* Main Content Area */}
            <div className="col-span-12 lg:col-span-7 order-1 lg:order-2 space-y-6">
              {/* Upload Section */}
              <FileUploader 
                onFileSelect={handleFileSelect} 
                isAnalyzing={isAnalyzing} 
              />

              {/* Verdict Display */}
              <VerdictDisplay result={result} isAnalyzing={isAnalyzing} />

              {/* Analysis Visualizations */}
              {result && !isAnalyzing && (
                <div className="space-y-6 animate-slide-up">
                  {/* Image Analysis */}
                  {result.fileType === 'image' && result.heatmapData && previewUrl && (
                    <Heatmap imageUrl={previewUrl} points={result.heatmapData} />
                  )}

                  {/* Audio Analysis */}
                  {result.fileType === 'audio' && result.spectrogramData && (
                    <Spectrogram data={result.spectrogramData} />
                  )}

                  {/* Video Analysis */}
                  {result.fileType === 'video' && result.frameAnalysis && (
                    <FrameTimeline frames={result.frameAnalysis} />
                  )}
                </div>
              )}
            </div>

            {/* Right Sidebar - Details & Report */}
            <aside className="col-span-12 lg:col-span-3 order-3 space-y-6">
              {/* EXIF Data */}
              {result && result.exifData && !isAnalyzing && (
                <ExifPanel data={result.exifData} />
              )}

              {/* Report Generator */}
              {result && !isAnalyzing && (
                <ReportGenerator result={result} />
              )}

              {/* Anomalies List */}
              {result && result.technicalDetails.anomalies.length > 0 && !isAnalyzing && (
                <div className="glass-panel p-4">
                  <h3 className="text-sm font-semibold mb-4 text-foreground">
                    Detected Anomalies ({result.technicalDetails.anomalies.length})
                  </h3>
                  <div className="space-y-3">
                    {result.technicalDetails.anomalies.map((anomaly, i) => (
                      <div 
                        key={i}
                        className={`p-3 rounded-lg border ${
                          anomaly.severity === 'danger' 
                            ? 'bg-destructive/10 border-destructive/30' 
                            : 'bg-warning/10 border-warning/30'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-sm font-semibold ${
                            anomaly.severity === 'danger' ? 'text-destructive' : 'text-warning'
                          }`}>
                            {anomaly.type}
                          </span>
                          <span className="text-xs font-mono text-muted-foreground">
                            {(anomaly.confidence * 100).toFixed(0)}%
                          </span>
                        </div>
                        {anomaly.location && (
                          <p className="text-xs text-muted-foreground mb-1">
                            Location: {anomaly.location}
                          </p>
                        )}
                        <p className="text-xs text-foreground/70">
                          {anomaly.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}
