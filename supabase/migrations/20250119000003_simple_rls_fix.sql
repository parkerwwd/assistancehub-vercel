-- Simple RLS fix for flow_steps and flow_fields

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read access to flow_steps" ON public.flow_steps;
DROP POLICY IF EXISTS "Allow public read access to flow_fields" ON public.flow_fields;

-- Enable RLS on the tables
ALTER TABLE public.flow_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flow_fields ENABLE ROW LEVEL SECURITY;

-- Create policies that allow everyone to read
CREATE POLICY "Allow public read access to flow_steps" 
  ON public.flow_steps 
  FOR SELECT 
  USING (true);

CREATE POLICY "Allow public read access to flow_fields" 
  ON public.flow_fields 
  FOR SELECT 
  USING (true);

-- Verify the policies were created
DO $$
BEGIN
  RAISE NOTICE 'RLS policies created successfully for public read access';
END $$;