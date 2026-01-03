import { useState, useCallback } from "react";
import type { AnalysisResult, MediaType, VerdictLevel, HeatmapPoint, SpectrogramData, FrameAnalysis, ExifData, Anomaly } from "@/types/analysis";

// Generate a random hash for demo purposes
function generateHash(): string {
  return Array.from({ length: 64 }, () => 
    Math.floor(Math.random() * 16).toString(16)
  ).join('');
}

// Generate random heatmap points
function generateHeatmapPoints(verdict: VerdictLevel): HeatmapPoint[] {
  const count = verdict === 'safe' ? 3 : verdict === 'warning' ? 6 : 10;
  return Array.from({ length: count }, () => ({
    x: Math.random(),
    y: Math.random(),
    intensity: verdict === 'safe' ? Math.random() * 0.3 : 
               verdict === 'warning' ? 0.3 + Math.random() * 0.4 : 
               0.6 + Math.random() * 0.4
  }));
}

// Generate spectrogram data
function generateSpectrogramData(verdict: VerdictLevel): SpectrogramData {
  const frequencies = Array.from({ length: 64 }, (_, i) => i * 125);
  const timeSteps = Array.from({ length: 100 }, (_, i) => i * 0.05);
  
  const magnitudes = frequencies.map((_, f) => 
    timeSteps.map((_, t) => {
      const base = Math.sin(f * 0.1 + t * 0.3) * 30 + 50;
      const noise = Math.random() * 20;
      return base + noise;
    })
  );

  const suspiciousRegions = verdict === 'safe' ? [] :
    verdict === 'warning' ? [
      { start: 2.0, end: 2.5, reason: 'Slight pitch anomaly' }
    ] : [
      { start: 1.2, end: 1.8, reason: 'Synthetic voice signature' },
      { start: 3.0, end: 3.5, reason: 'Unnatural formant transition' }
    ];

  return { frequencies, timeSteps, magnitudes, suspiciousRegions };
}

// Generate frame analysis data
function generateFrameAnalysis(verdict: VerdictLevel): FrameAnalysis[] {
  const frameCount = 30;
  return Array.from({ length: frameCount }, (_, i) => {
    const frameVerdict: VerdictLevel = verdict === 'danger' && i > 10 && i < 20 
      ? 'danger' 
      : verdict === 'warning' && i > 15 && i < 22 
        ? 'warning' 
        : 'safe';
    
    return {
      frameNumber: i + 1,
      timestamp: i * 0.033,
      verdict: frameVerdict,
      anomalies: frameVerdict === 'danger' 
        ? ['Inconsistent blinking pattern', 'Face boundary artifacts'] 
        : frameVerdict === 'warning' 
          ? ['Slight lighting inconsistency'] 
          : [],
      blinkingPattern: 12 + Math.random() * 8,
      facialConsistency: frameVerdict === 'safe' ? 0.95 + Math.random() * 0.05 :
                         frameVerdict === 'warning' ? 0.75 + Math.random() * 0.15 :
                         0.4 + Math.random() * 0.3
    };
  });
}

// Generate EXIF data
function generateExifData(verdict: VerdictLevel): ExifData {
  if (verdict === 'danger') {
    return {
      software: 'Unknown AI Generator',
      modified: true,
      colorSpace: 'sRGB',
      compression: 'JPEG'
    };
  }
  
  if (verdict === 'warning') {
    return {
      camera: 'Apple iPhone 14 Pro',
      software: 'Adobe Photoshop 2024',
      dateCreated: '2024-01-15 14:32:00',
      modified: true,
      originalDimensions: '4032 x 3024',
      colorSpace: 'Display P3',
      compression: 'HEIC'
    };
  }

  return {
    camera: 'Canon EOS R5',
    software: 'Digital Photo Professional',
    dateCreated: '2024-02-20 09:15:33',
    gpsLocation: '11.4°N 76.7°E',
    modified: false,
    originalDimensions: '8192 x 5464',
    colorSpace: 'Adobe RGB',
    compression: 'RAW + JPEG'
  };
}

// Generate anomalies
function generateAnomalies(verdict: VerdictLevel, fileType: MediaType): Anomaly[] {
  if (verdict === 'safe') return [];
  
  const imageAnomalies: Anomaly[] = [
    { type: 'Face Boundary', severity: 'danger', location: 'Face region', description: 'Visible blending artifacts at facial boundary', confidence: 0.89 },
    { type: 'Lighting', severity: 'warning', location: 'Shadow areas', description: 'Inconsistent shadow direction', confidence: 0.72 },
    { type: 'Texture', severity: 'danger', location: 'Skin areas', description: 'Unnatural skin texture smoothing', confidence: 0.85 }
  ];

  const audioAnomalies: Anomaly[] = [
    { type: 'Voice Synthesis', severity: 'danger', description: 'Detected synthetic voice patterns in frequency analysis', confidence: 0.91 },
    { type: 'Pitch Variation', severity: 'warning', description: 'Unnatural pitch consistency indicating voice cloning', confidence: 0.76 }
  ];

  const videoAnomalies: Anomaly[] = [
    { type: 'Temporal Inconsistency', severity: 'danger', location: 'Frames 12-18', description: 'Face swap artifacts visible during motion', confidence: 0.88 },
    { type: 'Blinking Pattern', severity: 'danger', description: 'Abnormal blink frequency (0.3 per minute)', confidence: 0.94 },
    { type: 'Audio-Video Sync', severity: 'warning', description: 'Lip movement slightly misaligned with audio', confidence: 0.67 }
  ];

  const anomalies = fileType === 'image' ? imageAnomalies :
                    fileType === 'audio' ? audioAnomalies :
                    videoAnomalies;

  return verdict === 'danger' 
    ? anomalies 
    : anomalies.slice(0, 1).map(a => ({ ...a, severity: 'warning' as VerdictLevel }));
}

// Generate explanation
function generateExplanation(verdict: VerdictLevel, fileType: MediaType): string {
  const explanations: Record<VerdictLevel, Record<MediaType, string>> = {
    safe: {
      image: "This image shows consistent lighting, natural skin textures, and authentic EXIF metadata from a verified camera source. No manipulation indicators detected.",
      audio: "Voice analysis reveals natural speech patterns, consistent formant frequencies, and no synthetic voice signatures. Recording appears authentic.",
      video: "Frame-by-frame analysis shows natural blinking patterns (14.2/min), consistent facial movements, and proper audio-visual synchronization."
    },
    warning: {
      image: "Minor editing detected - possibly color correction or cropping. Some metadata indicates post-processing, but no deepfake signatures found.",
      audio: "Slight audio processing detected. Some frequency patterns suggest minor pitch correction, but no clear voice synthesis indicators.",
      video: "Some frames show minor inconsistencies that could indicate editing. Recommend manual review of flagged segments."
    },
    danger: {
      image: "This image is flagged due to visible face-swap artifacts at the jawline and unnatural skin texture patterns consistent with GAN-generated content.",
      audio: "This audio contains synthetic voice signatures with unnatural formant transitions and robotic undertones typical of text-to-speech or voice cloning systems.",
      video: "This video is flagged due to unnatural blinking patterns (only 0.3 blinks/minute), face boundary artifacts, and temporal inconsistencies during head movement."
    }
  };

  return explanations[verdict][fileType];
}

export function useAnalysis() {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [history, setHistory] = useState<AnalysisResult[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeFile = useCallback(async (file: File, fileType: MediaType) => {
    setIsAnalyzing(true);
    setResult(null);

    // Simulate analysis time
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 2000));

    // Randomly determine verdict (weighted towards safe for demo)
    const random = Math.random();
    const verdict: VerdictLevel = random < 0.4 ? 'safe' : random < 0.7 ? 'warning' : 'danger';
    
    const analysisResult: AnalysisResult = {
      id: `DG-${Date.now().toString(36).toUpperCase()}`,
      fileName: file.name,
      fileType,
      fileSize: file.size,
      fileHash: generateHash(),
      timestamp: new Date(),
      verdict,
      confidenceScore: 0.7 + Math.random() * 0.25,
      explanation: generateExplanation(verdict, fileType),
      technicalDetails: {
        anomalies: generateAnomalies(verdict, fileType),
        modelUsed: 'EfficientNet-B4 + Custom CNN',
        processingTime: Math.floor(1500 + Math.random() * 2500),
        checksPerformed: [
          'Face boundary analysis',
          'Texture consistency check',
          'EXIF metadata verification',
          'Lighting consistency analysis',
          fileType === 'video' ? 'Blink rate detection' : 'Color histogram analysis',
          fileType === 'audio' ? 'Spectral signature analysis' : 'Temporal consistency check'
        ]
      },
      heatmapData: fileType === 'image' ? generateHeatmapPoints(verdict) : undefined,
      spectrogramData: fileType === 'audio' ? generateSpectrogramData(verdict) : undefined,
      frameAnalysis: fileType === 'video' ? generateFrameAnalysis(verdict) : undefined,
      exifData: fileType === 'image' ? generateExifData(verdict) : undefined
    };

    setResult(analysisResult);
    setHistory(prev => [analysisResult, ...prev].slice(0, 50));
    setIsAnalyzing(false);

    return analysisResult;
  }, []);

  const selectCase = useCallback((caseId: string) => {
    const found = history.find(c => c.id === caseId);
    if (found) {
      setResult(found);
    }
  }, [history]);

  return {
    result,
    history,
    isAnalyzing,
    analyzeFile,
    selectCase
  };
}
