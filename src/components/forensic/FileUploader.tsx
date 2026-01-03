import { useState, useCallback } from "react";
import { Upload, Image, Music, Video, FileWarning, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { MediaType } from "@/types/analysis";

interface FileUploaderProps {
  onFileSelect: (file: File, type: MediaType) => void;
  isAnalyzing: boolean;
}

const ACCEPTED_TYPES: Record<MediaType, string[]> = {
  image: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  audio: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp3'],
  video: ['video/mp4', 'video/webm', 'video/quicktime', 'video/avi'],
};

function getMediaType(mimeType: string): MediaType | null {
  for (const [type, mimes] of Object.entries(ACCEPTED_TYPES)) {
    if (mimes.some(m => mimeType.startsWith(m.split('/')[0]))) {
      return type as MediaType;
    }
  }
  return null;
}

export function FileUploader({ onFileSelect, isAnalyzing }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const processFile = useCallback((file: File) => {
    setError(null);
    const mediaType = getMediaType(file.type);
    
    if (!mediaType) {
      setError(`Unsupported file type: ${file.type}`);
      return;
    }

    if (file.size > 100 * 1024 * 1024) {
      setError("File size exceeds 100MB limit");
      return;
    }

    setSelectedFile(file);
    
    if (mediaType === 'image') {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }

    onFileSelect(file, mediaType);
  }, [onFileSelect]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      processFile(file);
    }
  }, [processFile]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  }, [processFile]);

  const clearFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setError(null);
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image')) return <Image className="w-8 h-8" />;
    if (type.startsWith('audio')) return <Music className="w-8 h-8" />;
    if (type.startsWith('video')) return <Video className="w-8 h-8" />;
    return <FileWarning className="w-8 h-8" />;
  };

  return (
    <div className="glass-panel p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Evidence Upload</h2>
        {selectedFile && (
          <Button variant="ghost" size="sm" onClick={clearFile} disabled={isAnalyzing}>
            <X className="w-4 h-4 mr-1" /> Clear
          </Button>
        )}
      </div>

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "relative border-2 border-dashed rounded-xl p-8 transition-all duration-300",
          "flex flex-col items-center justify-center min-h-[200px]",
          isDragging && "border-primary bg-primary/5 scale-[1.02]",
          !isDragging && "border-border/50 hover:border-primary/50",
          isAnalyzing && "pointer-events-none opacity-60"
        )}
      >
        {isAnalyzing && (
          <div className="scan-line" />
        )}

        {selectedFile ? (
          <div className="flex flex-col items-center gap-4 animate-fade-in">
            {previewUrl ? (
              <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-border">
                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-20 h-20 rounded-xl bg-secondary flex items-center justify-center text-primary">
                {getFileIcon(selectedFile.type)}
              </div>
            )}
            <div className="text-center">
              <p className="font-medium text-foreground truncate max-w-[200px]">
                {selectedFile.name}
              </p>
              <p className="text-sm text-muted-foreground">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mb-4">
              <Upload className="w-8 h-8 text-primary" />
            </div>
            <p className="text-lg font-medium text-foreground mb-2">
              Drag & drop evidence file
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Supports images, audio, and video files up to 100MB
            </p>
            <label htmlFor="file-input">
              <Button variant="outline" asChild className="cursor-pointer">
                <span>Browse Files</span>
              </Button>
            </label>
            <input
              id="file-input"
              type="file"
              accept="image/*,audio/*,video/*"
              onChange={handleFileInput}
              className="hidden"
            />
          </>
        )}

        {error && (
          <div className="mt-4 px-4 py-2 bg-destructive/10 border border-destructive/30 rounded-lg">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}
      </div>

      <div className="flex gap-2 text-xs text-muted-foreground">
        <span className="px-2 py-1 rounded bg-secondary">JPG</span>
        <span className="px-2 py-1 rounded bg-secondary">PNG</span>
        <span className="px-2 py-1 rounded bg-secondary">MP3</span>
        <span className="px-2 py-1 rounded bg-secondary">WAV</span>
        <span className="px-2 py-1 rounded bg-secondary">MP4</span>
        <span className="px-2 py-1 rounded bg-secondary">WEBM</span>
      </div>
    </div>
  );
}
