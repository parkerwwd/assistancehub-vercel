
-- Drop all existing tables and their dependencies
DROP TABLE IF EXISTS public.pha_audit_log CASCADE;
DROP TABLE IF EXISTS public.pha_agencies CASCADE;

-- Drop any existing functions and triggers
DROP FUNCTION IF EXISTS public.log_pha_changes() CASCADE;
DROP FUNCTION IF EXISTS public.update_pha_agencies_updated_at() CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;

-- Create the main PHA agencies table with correct structure matching CSV
CREATE TABLE public.pha_agencies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Basic PHA Information
  pha_code TEXT,
  name TEXT NOT NULL,
  address TEXT,
  
  -- Contact Information
  phone TEXT,
  fax TEXT,
  email TEXT,
  
  -- Executive Director Information
  exec_dir_phone TEXT,
  exec_dir_fax TEXT,
  exec_dir_email TEXT,
  
  -- Program Information
  phas_designation TEXT,
  program_type TEXT,
  
  -- Size Categories
  low_rent_size_category TEXT,
  section8_size_category TEXT,
  combined_size_category TEXT,
  
  -- Financial Information
  fiscal_year_end TEXT,
  
  -- Unit Counts (integers)
  total_units INTEGER,
  total_dwelling_units INTEGER,
  acc_units INTEGER,
  ph_occupied INTEGER,
  section8_units_count INTEGER,
  section8_occupied INTEGER,
  total_occupied INTEGER,
  regular_vacant INTEGER,
  pha_total_units INTEGER,
  number_reported INTEGER,
  
  -- Percentages (decimals)
  pct_occupied DECIMAL(8,4),
  pct_reported DECIMAL(8,4),
  
  -- Financial Amounts (decimals)
  opfund_amount DECIMAL(20,2),
  opfund_amount_prev_yr DECIMAL(20,2),
  capfund_amount DECIMAL(20,2),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create audit log table
CREATE TABLE public.pha_audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  action TEXT NOT NULL,
  table_name TEXT NOT NULL DEFAULT 'pha_agencies',
  record_id UUID,
  old_data JSONB,
  new_data JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX idx_pha_agencies_name ON public.pha_agencies(name);
CREATE INDEX idx_pha_agencies_pha_code ON public.pha_agencies(pha_code);
CREATE UNIQUE INDEX idx_pha_agencies_pha_code_unique ON public.pha_agencies(pha_code) WHERE pha_code IS NOT NULL;

-- Enable Row Level Security
ALTER TABLE public.pha_agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pha_audit_log ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for pha_agencies
CREATE POLICY "Anyone can read PHA agencies" 
ON public.pha_agencies 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can insert PHA agencies" 
ON public.pha_agencies 
FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update PHA agencies" 
ON public.pha_agencies 
FOR UPDATE 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete PHA agencies" 
ON public.pha_agencies 
FOR DELETE 
TO authenticated
USING (true);

-- Create RLS policies for audit log
CREATE POLICY "Authenticated users can read audit log" 
ON public.pha_audit_log 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert audit log" 
ON public.pha_audit_log 
FOR INSERT 
TO authenticated
WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_updated = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_pha_agencies_updated_at
BEFORE UPDATE ON public.pha_agencies
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
