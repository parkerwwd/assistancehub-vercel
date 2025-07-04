
-- Remove unused columns from pha_agencies table
ALTER TABLE public.pha_agencies 
DROP COLUMN IF EXISTS city,
DROP COLUMN IF EXISTS state,
DROP COLUMN IF EXISTS zip,
DROP COLUMN IF EXISTS website,
DROP COLUMN IF EXISTS latitude,
DROP COLUMN IF EXISTS longitude,
DROP COLUMN IF EXISTS supports_hcv,
DROP COLUMN IF EXISTS waitlist_open,
DROP COLUMN IF EXISTS waitlist_status,
DROP COLUMN IF EXISTS performance_status,
DROP COLUMN IF EXISTS jurisdictions;
