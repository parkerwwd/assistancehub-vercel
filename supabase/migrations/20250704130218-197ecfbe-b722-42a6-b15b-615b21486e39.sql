
-- Remove unused location fields from pha_agencies table
ALTER TABLE public.pha_agencies 
DROP COLUMN IF EXISTS city,
DROP COLUMN IF EXISTS state,
DROP COLUMN IF EXISTS zip;
