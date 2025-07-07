-- Add missing location fields to pha_agencies table
-- These fields exist in the original migration but seem to be missing from the current schema

-- Add city column if it doesn't exist
ALTER TABLE public.pha_agencies 
ADD COLUMN IF NOT EXISTS city TEXT;

-- Add state column if it doesn't exist
ALTER TABLE public.pha_agencies 
ADD COLUMN IF NOT EXISTS state CHAR(2);

-- Add zip column if it doesn't exist
ALTER TABLE public.pha_agencies 
ADD COLUMN IF NOT EXISTS zip VARCHAR(10);

-- Add latitude column if it doesn't exist
ALTER TABLE public.pha_agencies 
ADD COLUMN IF NOT EXISTS latitude NUMERIC(10,8);

-- Add longitude column if it doesn't exist
ALTER TABLE public.pha_agencies 
ADD COLUMN IF NOT EXISTS longitude NUMERIC(11,8);

-- Add website column if it doesn't exist
ALTER TABLE public.pha_agencies 
ADD COLUMN IF NOT EXISTS website TEXT;

-- Add supports_hcv column if it doesn't exist
ALTER TABLE public.pha_agencies 
ADD COLUMN IF NOT EXISTS supports_hcv BOOLEAN DEFAULT false;

-- Add waitlist_open column if it doesn't exist
ALTER TABLE public.pha_agencies 
ADD COLUMN IF NOT EXISTS waitlist_open BOOLEAN;

-- Add waitlist_status column if it doesn't exist
ALTER TABLE public.pha_agencies 
ADD COLUMN IF NOT EXISTS waitlist_status TEXT DEFAULT 'Unknown';

-- Add jurisdictions column if it doesn't exist
ALTER TABLE public.pha_agencies 
ADD COLUMN IF NOT EXISTS jurisdictions TEXT[];

-- Add last_updated column if it doesn't exist
ALTER TABLE public.pha_agencies 
ADD COLUMN IF NOT EXISTS last_updated TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Create indexes for the new columns if they don't exist
CREATE INDEX IF NOT EXISTS idx_pha_agencies_state ON public.pha_agencies(state);
CREATE INDEX IF NOT EXISTS idx_pha_agencies_city ON public.pha_agencies(city);
CREATE INDEX IF NOT EXISTS idx_pha_agencies_zip ON public.pha_agencies(zip);
CREATE INDEX IF NOT EXISTS idx_pha_agencies_location ON public.pha_agencies(latitude, longitude);

-- Update the last_updated trigger to include these new fields
CREATE OR REPLACE FUNCTION public.update_pha_agencies_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_updated = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Make sure the trigger exists
DROP TRIGGER IF EXISTS update_pha_agencies_updated_at ON public.pha_agencies;
CREATE TRIGGER update_pha_agencies_updated_at
BEFORE UPDATE ON public.pha_agencies
FOR EACH ROW
EXECUTE FUNCTION public.update_pha_agencies_updated_at(); 