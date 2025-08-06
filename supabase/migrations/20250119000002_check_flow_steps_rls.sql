-- Check if RLS is enabled on flow_steps table
DO $$
BEGIN
  -- Log current RLS status
  RAISE NOTICE 'Checking RLS status for flow_steps table...';
  
  -- Check if RLS is enabled
  IF EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'flow_steps' 
    AND rowsecurity = true
  ) THEN
    RAISE NOTICE 'RLS is ENABLED on flow_steps table';
  ELSE
    RAISE NOTICE 'RLS is DISABLED on flow_steps table';
  END IF;
END $$;

-- List all policies on flow_steps table
SELECT 
  pol.polname as policy_name,
  pol.polcmd as command,
  pol.polroles::regrole[] as roles,
  pg_get_expr(pol.polqual, pol.polrelid) as using_expression,
  pg_get_expr(pol.polwithcheck, pol.polrelid) as with_check_expression
FROM pg_policy pol
JOIN pg_class cls ON pol.polrelid = cls.oid
JOIN pg_namespace nsp ON cls.relnamespace = nsp.oid
WHERE nsp.nspname = 'public' AND cls.relname = 'flow_steps';

-- Temporarily disable RLS to allow all access (for debugging)
-- IMPORTANT: Only uncomment if you want to disable RLS
-- ALTER TABLE public.flow_steps DISABLE ROW LEVEL SECURITY;

-- Or create a policy that allows all reads (safer option)
-- This creates a policy that allows anyone to read flow_steps
CREATE POLICY IF NOT EXISTS "Allow public read access to flow_steps" 
  ON public.flow_steps 
  FOR SELECT 
  TO anon, authenticated
  USING (true);

-- Also check flow_fields
CREATE POLICY IF NOT EXISTS "Allow public read access to flow_fields" 
  ON public.flow_fields 
  FOR SELECT 
  TO anon, authenticated
  USING (true);

-- Ensure the policies are enabled
ALTER TABLE public.flow_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flow_fields ENABLE ROW LEVEL SECURITY;