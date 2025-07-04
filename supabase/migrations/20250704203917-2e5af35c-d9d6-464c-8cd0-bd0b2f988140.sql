
-- Remove all PHA data and reset the database
DROP TABLE IF EXISTS public.pha_audit_log CASCADE;
DROP TABLE IF EXISTS public.pha_agencies CASCADE;

-- Drop any functions that were created for PHA management
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS public.log_pha_changes() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
