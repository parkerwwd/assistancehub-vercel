-- Create the PHA agencies table
CREATE TABLE public.pha_agencies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  pha_code TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  latitude DECIMAL,
  longitude DECIMAL,
  supports_hcv BOOLEAN DEFAULT false,
  waitlist_open BOOLEAN DEFAULT false,
  waitlist_status TEXT,
  jurisdictions TEXT[],
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create the PHA audit log table
CREATE TABLE public.pha_audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  table_name TEXT DEFAULT 'pha_agencies',
  action TEXT NOT NULL,
  record_id TEXT,
  old_data JSONB,
  new_data JSONB,
  user_id UUID,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.pha_agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pha_audit_log ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access to PHA agencies
CREATE POLICY "Anyone can read PHA agencies" 
ON public.pha_agencies 
FOR SELECT 
USING (true);

-- Create policies for authenticated users to manage data
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

-- Audit log policies - only authenticated users can read/write
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

-- Create indexes for better performance
CREATE INDEX idx_pha_agencies_name ON public.pha_agencies(name);
CREATE INDEX idx_pha_agencies_state ON public.pha_agencies(state);
CREATE INDEX idx_pha_agencies_city ON public.pha_agencies(city);
CREATE INDEX idx_pha_agencies_location ON public.pha_agencies(latitude, longitude);
CREATE INDEX idx_pha_agencies_waitlist_status ON public.pha_agencies(waitlist_status);

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