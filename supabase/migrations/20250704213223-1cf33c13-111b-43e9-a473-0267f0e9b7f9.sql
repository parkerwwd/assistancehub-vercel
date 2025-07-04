
-- First, let's make sure we have a unique constraint on pha_code
-- We'll handle the case where it might already exist
DO $$ 
BEGIN
    -- Try to add the unique constraint if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'pha_agencies_pha_code_unique'
    ) THEN
        -- Add unique constraint on pha_code column, but only for non-null values
        ALTER TABLE public.pha_agencies 
        ADD CONSTRAINT pha_agencies_pha_code_unique 
        UNIQUE (pha_code);
    END IF;
END $$;

-- Also make sure we have a partial unique index for better performance
-- This will only enforce uniqueness on non-null pha_code values
CREATE UNIQUE INDEX IF NOT EXISTS idx_pha_agencies_pha_code_unique 
ON public.pha_agencies(pha_code) 
WHERE pha_code IS NOT NULL;
