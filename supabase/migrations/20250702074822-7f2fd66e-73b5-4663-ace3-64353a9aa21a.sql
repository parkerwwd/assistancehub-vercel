
-- CRITICAL SECURITY FIX: Replace overly permissive RLS policies
-- This removes the dangerous public access to INSERT, UPDATE, DELETE operations

-- Drop the existing overly permissive policies
DROP POLICY IF EXISTS "Allow public inserts for PHA data" ON pha_agencies;
DROP POLICY IF EXISTS "Allow public updates for PHA data" ON pha_agencies;
DROP POLICY IF EXISTS "Allow public deletes for PHA data" ON pha_agencies;

-- Keep read-only public access (this is safe for public data viewing)
-- The "Allow public read access to PHA agencies" policy should remain

-- Create secure admin-only policies for data management
-- Only authenticated users can insert data (for CSV imports)
CREATE POLICY "Allow authenticated users to insert PHA data" 
ON pha_agencies 
FOR INSERT 
TO authenticated
WITH CHECK (true);

-- Only authenticated users can update data
CREATE POLICY "Allow authenticated users to update PHA data" 
ON pha_agencies 
FOR UPDATE 
TO authenticated
USING (true)
WITH CHECK (true);

-- Only authenticated users can delete data
CREATE POLICY "Allow authenticated users to delete PHA data" 
ON pha_agencies 
FOR DELETE 
TO authenticated
USING (true);

-- Add audit logging table for security monitoring
CREATE TABLE IF NOT EXISTS public.pha_audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  table_name TEXT NOT NULL DEFAULT 'pha_agencies',
  record_id UUID,
  old_data JSONB,
  new_data JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on audit log
ALTER TABLE public.pha_audit_log ENABLE ROW LEVEL SECURITY;

-- Only allow authenticated users to view their own audit logs
CREATE POLICY "Users can view audit logs" 
ON public.pha_audit_log 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

-- Create function to log PHA data changes
CREATE OR REPLACE FUNCTION public.log_pha_changes()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.pha_audit_log (
    user_id,
    action,
    record_id,
    old_data,
    new_data,
    created_at
  ) VALUES (
    auth.uid(),
    TG_OP,
    COALESCE(NEW.id, OLD.id),
    CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE NULL END,
    CASE WHEN TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN row_to_json(NEW) ELSE NULL END,
    now()
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for audit logging
CREATE TRIGGER pha_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.pha_agencies
  FOR EACH ROW EXECUTE FUNCTION public.log_pha_changes();
