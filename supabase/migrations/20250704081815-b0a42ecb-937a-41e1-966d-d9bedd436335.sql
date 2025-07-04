
-- Remove the fields that don't match CSV data
ALTER TABLE public.pha_agencies 
DROP COLUMN IF EXISTS website,
DROP COLUMN IF EXISTS waitlist_status;
