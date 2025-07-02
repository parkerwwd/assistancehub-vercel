
-- Create table for PHA agencies with comprehensive data structure
CREATE TABLE public.pha_agencies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pha_code VARCHAR(20) UNIQUE,
  name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  state CHAR(2),
  zip VARCHAR(10),
  phone TEXT,
  email TEXT,
  website TEXT,
  supports_hcv BOOLEAN DEFAULT false,
  waitlist_open BOOLEAN,
  waitlist_status TEXT DEFAULT 'Unknown',
  jurisdictions TEXT[], -- array of city/state combos or ZIPs
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for efficient querying
CREATE INDEX idx_pha_agencies_state ON public.pha_agencies(state);
CREATE INDEX idx_pha_agencies_city ON public.pha_agencies(city);
CREATE INDEX idx_pha_agencies_zip ON public.pha_agencies(zip);
CREATE INDEX idx_pha_agencies_pha_code ON public.pha_agencies(pha_code);
CREATE INDEX idx_pha_agencies_location ON public.pha_agencies(latitude, longitude);

-- Enable Row Level Security (make data publicly readable for this use case)
ALTER TABLE public.pha_agencies ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access to PHA data
CREATE POLICY "Allow public read access to PHA agencies" 
  ON public.pha_agencies 
  FOR SELECT 
  TO public
  USING (true);

-- Create policy to allow authenticated users to insert/update (for data import)
CREATE POLICY "Allow authenticated users to manage PHA data" 
  ON public.pha_agencies 
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create a function to update the last_updated timestamp
CREATE OR REPLACE FUNCTION public.update_pha_agencies_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_updated = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update the timestamp
CREATE TRIGGER update_pha_agencies_updated_at
  BEFORE UPDATE ON public.pha_agencies
  FOR EACH ROW
  EXECUTE FUNCTION public.update_pha_agencies_updated_at();
