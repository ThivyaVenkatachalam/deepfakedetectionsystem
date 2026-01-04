-- Create storage bucket for media files
INSERT INTO storage.buckets (id, name, public) 
VALUES ('media-uploads', 'media-uploads', true);

-- Storage policies for media uploads (public read, anyone can upload for now)
CREATE POLICY "Anyone can view media files"
ON storage.objects FOR SELECT
USING (bucket_id = 'media-uploads');

CREATE POLICY "Anyone can upload media files"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'media-uploads');

CREATE POLICY "Anyone can delete their uploads"
ON storage.objects FOR DELETE
USING (bucket_id = 'media-uploads');

-- Create analysis_cases table to store analysis history
CREATE TABLE public.analysis_cases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_url TEXT,
  verdict TEXT NOT NULL,
  confidence INTEGER NOT NULL,
  explanation TEXT,
  file_hash TEXT,
  anomalies JSONB DEFAULT '[]'::jsonb,
  heatmap_data JSONB,
  spectrogram_data JSONB,
  frame_analysis JSONB,
  exif_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.analysis_cases ENABLE ROW LEVEL SECURITY;

-- Public read/write policies (no auth required for now)
CREATE POLICY "Anyone can view analysis cases"
ON public.analysis_cases FOR SELECT
USING (true);

CREATE POLICY "Anyone can create analysis cases"
ON public.analysis_cases FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can delete analysis cases"
ON public.analysis_cases FOR DELETE
USING (true);