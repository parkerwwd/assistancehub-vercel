-- Create table for housing properties
CREATE TABLE public.properties (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pha_id UUID REFERENCES public.pha_agencies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT,
  state CHAR(2),
  zip VARCHAR(10),
  property_type TEXT, -- 'public_housing', 'section_8', 'tax_credit', etc.
  units_total INTEGER,
  units_available INTEGER,
  bedroom_types TEXT[], -- ['studio', '1br', '2br', '3br', '4br+']
  rent_range_min DECIMAL(10,2),
  rent_range_max DECIMAL(10,2),
  waitlist_open BOOLEAN DEFAULT false,
  waitlist_status TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  accessibility_features TEXT[], -- ['wheelchair_accessible', 'hearing_impaired', etc.]
  amenities TEXT[], -- ['parking', 'laundry', 'playground', etc.]
  pet_policy TEXT,
  smoking_policy TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for efficient querying
CREATE INDEX idx_properties_pha_id ON public.properties(pha_id);
CREATE INDEX idx_properties_state ON public.properties(state);
CREATE INDEX idx_properties_city ON public.properties(city);
CREATE INDEX idx_properties_zip ON public.properties(zip);
CREATE INDEX idx_properties_property_type ON public.properties(property_type);
CREATE INDEX idx_properties_location ON public.properties(latitude, longitude);
CREATE INDEX idx_properties_units_available ON public.properties(units_available);
CREATE INDEX idx_properties_waitlist_open ON public.properties(waitlist_open);

-- Enable Row Level Security
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access
CREATE POLICY "Allow public read access to properties" 
  ON public.properties 
  FOR SELECT 
  TO public
  USING (true);

-- Create policy to allow authenticated users to manage property data
CREATE POLICY "Allow authenticated users to manage properties" 
  ON public.properties 
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create trigger to update timestamp
CREATE TRIGGER update_properties_updated_at
  BEFORE UPDATE ON public.properties
  FOR EACH ROW
  EXECUTE FUNCTION public.update_pha_agencies_updated_at(); 