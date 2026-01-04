export type MediaType = 'image' | 'audio' | 'video';

export type VerdictLevel = 'safe' | 'warning' | 'danger';

export interface AnalysisResult {
  id: string;
  fileName: string;
  fileType: MediaType;
  fileSize: number;
  fileUrl?: string;
  fileHash: string;
  timestamp: Date;
  verdict: VerdictLevel;
  confidenceScore: number;
  explanation: string;
  technicalDetails: TechnicalDetails;
  heatmapData?: HeatmapPoint[];
  spectrogramData?: SpectrogramData;
  frameAnalysis?: FrameAnalysis[];
  exifData?: ExifData;
}

export interface TechnicalDetails {
  anomalies: Anomaly[];
  modelUsed: string;
  processingTime: number;
  checksPerformed: string[];
}

export interface Anomaly {
  type: string;
  severity: VerdictLevel;
  location?: string;
  description: string;
  confidence: number;
}

export interface HeatmapPoint {
  x: number;
  y: number;
  intensity: number;
}

export interface SpectrogramData {
  frequencies: number[];
  timeSteps: number[];
  magnitudes: number[][];
  suspiciousRegions: { start: number; end: number; reason: string }[];
}

export interface FrameAnalysis {
  frameNumber: number;
  timestamp: number;
  verdict: VerdictLevel;
  anomalies: string[];
  blinkingPattern?: number;
  facialConsistency?: number;
}

export interface ExifData {
  camera?: string;
  software?: string;
  dateCreated?: string;
  gpsLocation?: string;
  modified?: boolean;
  originalDimensions?: string;
  compression?: string;
  colorSpace?: string;
  [key: string]: string | boolean | undefined;
}

export interface CaseReport {
  caseId: string;
  analysisResult: AnalysisResult;
  investigatorNotes?: string;
  generatedAt: Date;
}
