-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create operator controls table for managing guest selections
CREATE TABLE public.operator_controls (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  push_sensitivity DECIMAL DEFAULT 0.30,
  auto_cycle_speed INTEGER DEFAULT 6000,
  manual_selection_headset_id TEXT,
  manual_selection_image_id INTEGER,
  manual_selection_level INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.operator_controls ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read and write (operator interface is public for this use case)
CREATE POLICY "Anyone can view operator controls"
ON public.operator_controls
FOR SELECT
USING (true);

CREATE POLICY "Anyone can insert operator controls"
ON public.operator_controls
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can update operator controls"
ON public.operator_controls
FOR UPDATE
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_operator_controls_updated_at
BEFORE UPDATE ON public.operator_controls
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();