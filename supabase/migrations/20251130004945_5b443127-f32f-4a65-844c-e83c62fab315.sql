-- Create table for video generation jobs
CREATE TABLE IF NOT EXISTS public.video_generation_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metadata TEXT[] NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  video_url TEXT,
  sora_job_id TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.video_generation_jobs ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read and insert (public app)
CREATE POLICY "Allow public read access" ON public.video_generation_jobs FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON public.video_generation_jobs FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON public.video_generation_jobs FOR UPDATE USING (true);