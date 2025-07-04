
-- Create the audit log table for tracking PHA data changes
CREATE TABLE public.pha_audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  table_name TEXT DEFAULT 'pha_agencies',
  action TEXT NOT NULL,
  record_id TEXT,
  old_data JSONB,
  new_data JSONB,
  user_id UUID,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on audit log
ALTER TABLE public.pha_audit_log ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view audit logs
CREATE POLICY "Authenticated users can view audit logs" 
ON public.pha_audit_log 
FOR SELECT 
TO authenticated
USING (true);

-- Allow authenticated users to insert audit logs (for system logging)
CREATE POLICY "Authenticated users can insert audit logs" 
ON public.pha_audit_log 
FOR INSERT 
TO authenticated
WITH CHECK (true);

-- Create function to log PHA data changes
CREATE OR REPLACE FUNCTION public.log_pha_changes()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.pha_audit_log (
    action,
    record_id,
    old_data,
    new_data,
    user_id,
    created_at
  ) VALUES (
    TG_OP,
    COALESCE(NEW.id::text, OLD.id::text),
    CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE NULL END,
    CASE WHEN TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN row_to_json(NEW) ELSE NULL END,
    auth.uid(),
    now()
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for audit logging on PHA agencies table
CREATE TRIGGER pha_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.pha_agencies
  FOR EACH ROW EXECUTE FUNCTION public.log_pha_changes();
