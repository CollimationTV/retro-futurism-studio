-- Add progress tracking columns to video_generation_jobs table
ALTER TABLE public.video_generation_jobs 
ADD COLUMN poll_attempts integer DEFAULT 0,
ADD COLUMN max_attempts integer DEFAULT 60,
ADD COLUMN sora_status text,
ADD COLUMN prompt_used text;