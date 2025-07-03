
-- Add unique constraint on pha_code column to support ON CONFLICT
ALTER TABLE public.pha_agencies ADD CONSTRAINT pha_agencies_pha_code_unique UNIQUE (pha_code);
