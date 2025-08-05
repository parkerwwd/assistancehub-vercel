-- Add single_page_landing to step_type enum
ALTER TYPE step_type ADD VALUE IF NOT EXISTS 'single_page_landing';

-- Note: Adding enum values in PostgreSQL is safe and doesn't require recreating the type
-- The IF NOT EXISTS clause prevents errors if the value already exists