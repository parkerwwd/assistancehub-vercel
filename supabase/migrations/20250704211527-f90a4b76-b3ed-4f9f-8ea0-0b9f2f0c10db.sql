
-- Create the pha_agencies table with the specified fields
CREATE TABLE IF NOT EXISTS public.pha_agencies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pha_code TEXT,
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  email TEXT,
  exec_dir_email TEXT,
  program_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS)
ALTER TABLE public.pha_agencies ENABLE ROW LEVEL SECURITY;

-- Create policy that allows authenticated users to view all PHA data
CREATE POLICY "Authenticated users can view PHA data" 
  ON public.pha_agencies 
  FOR SELECT 
  TO authenticated
  USING (true);

-- Create policy that allows authenticated users to insert PHA data
CREATE POLICY "Authenticated users can insert PHA data" 
  ON public.pha_agencies 
  FOR INSERT 
  TO authenticated
  WITH CHECK (true);

-- Create policy that allows authenticated users to update PHA data
CREATE POLICY "Authenticated users can update PHA data" 
  ON public.pha_agencies 
  FOR UPDATE 
  TO authenticated
  USING (true);

-- Create policy that allows authenticated users to delete PHA data
CREATE POLICY "Authenticated users can delete PHA data" 
  ON public.pha_agencies 
  FOR DELETE 
  TO authenticated
  USING (true);

-- Create an index on pha_code for better performance during upserts
CREATE UNIQUE INDEX IF NOT EXISTS idx_pha_agencies_pha_code ON public.pha_agencies(pha_code) WHERE pha_code IS NOT NULL;
