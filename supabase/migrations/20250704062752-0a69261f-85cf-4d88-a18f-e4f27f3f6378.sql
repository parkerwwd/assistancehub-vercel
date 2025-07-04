
-- Add missing columns to pha_agencies table for HUD CSV import
ALTER TABLE public.pha_agencies 
ADD COLUMN IF NOT EXISTS fax text,
ADD COLUMN IF NOT EXISTS exec_dir_phone text,
ADD COLUMN IF NOT EXISTS exec_dir_fax text,
ADD COLUMN IF NOT EXISTS exec_dir_email text,
ADD COLUMN IF NOT EXISTS performance_status text,
ADD COLUMN IF NOT EXISTS program_type text,
ADD COLUMN IF NOT EXISTS low_rent_size_category text,
ADD COLUMN IF NOT EXISTS section8_size_category text,
ADD COLUMN IF NOT EXISTS combined_size_category text,
ADD COLUMN IF NOT EXISTS fiscal_year_end text,
ADD COLUMN IF NOT EXISTS total_units integer,
ADD COLUMN IF NOT EXISTS total_dwelling_units integer,
ADD COLUMN IF NOT EXISTS ph_occupied integer,
ADD COLUMN IF NOT EXISTS section8_units_count integer,
ADD COLUMN IF NOT EXISTS section8_occupied integer;

-- Add comment to document the table structure
COMMENT ON TABLE public.pha_agencies IS 'Public Housing Authority agencies with complete HUD CSV data fields';
