-- Create table for managing images across all levels
CREATE TABLE public.images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  level INTEGER NOT NULL CHECK (level IN (1, 2, 3)),
  position INTEGER NOT NULL,
  url TEXT NOT NULL,
  metadata_tag_1 TEXT NOT NULL,
  metadata_tag_2 TEXT NOT NULL,
  metadata_tag_3 TEXT NOT NULL,
  UNIQUE(level, position)
);

-- Create table for managing videos
CREATE TABLE public.videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  metadata_tag_1 TEXT NOT NULL,
  metadata_tag_2 TEXT NOT NULL,
  metadata_tag_3 TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true
);

-- Enable RLS
ALTER TABLE public.images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Anyone can view images"
  ON public.images FOR SELECT
  USING (true);

CREATE POLICY "Anyone can view videos"
  ON public.videos FOR SELECT
  USING (true);

-- Admin access (for now, anyone can manage - you can restrict later)
CREATE POLICY "Anyone can insert images"
  ON public.images FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update images"
  ON public.images FOR UPDATE
  USING (true);

CREATE POLICY "Anyone can delete images"
  ON public.images FOR DELETE
  USING (true);

CREATE POLICY "Anyone can insert videos"
  ON public.videos FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update videos"
  ON public.videos FOR UPDATE
  USING (true);

CREATE POLICY "Anyone can delete videos"
  ON public.videos FOR DELETE
  USING (true);

-- Add trigger for updated_at
CREATE TRIGGER update_images_updated_at
  BEFORE UPDATE ON public.images
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_videos_updated_at
  BEFORE UPDATE ON public.videos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();