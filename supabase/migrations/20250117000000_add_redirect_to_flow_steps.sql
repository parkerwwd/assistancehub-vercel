-- Add redirect functionality to flow steps
-- This allows thank you pages to redirect to custom URLs after completion

-- Add redirect columns to flow_steps table
ALTER TABLE public.flow_steps
ADD COLUMN IF NOT EXISTS redirect_url text,
ADD COLUMN IF NOT EXISTS redirect_delay integer DEFAULT 3;

-- Add comment for documentation
COMMENT ON COLUMN public.flow_steps.redirect_url IS 'URL to redirect to after step completion (typically used for thank_you steps)';
COMMENT ON COLUMN public.flow_steps.redirect_delay IS 'Delay in seconds before redirecting (default 3)';

-- Create index for flows that have redirects
CREATE INDEX IF NOT EXISTS idx_flow_steps_redirect 
ON public.flow_steps(flow_id) 
WHERE redirect_url IS NOT NULL;