-- Add retrieval code and user email columns to video_generation_jobs
ALTER TABLE video_generation_jobs 
ADD COLUMN retrieval_code TEXT UNIQUE,
ADD COLUMN user_email TEXT;

-- Create storage bucket for generated videos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'generated-videos',
  'generated-videos',
  true,
  104857600, -- 100MB limit
  ARRAY['video/mp4', 'video/quicktime', 'video/x-msvideo']
);

-- Allow public access to generated videos
CREATE POLICY "Public read access to generated videos"
ON storage.objects FOR SELECT
USING (bucket_id = 'generated-videos');

-- Allow authenticated inserts to generated videos bucket
CREATE POLICY "Allow video uploads"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'generated-videos');