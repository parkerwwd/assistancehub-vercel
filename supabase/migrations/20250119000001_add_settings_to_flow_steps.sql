-- Add settings column to flow_steps table
-- This is needed for single page landing steps and other step types that need custom configuration
ALTER TABLE public.flow_steps
ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}';

-- Add comment for documentation
COMMENT ON COLUMN public.flow_steps.settings IS 'Step-specific configuration (used by single_page_landing and other complex step types)';