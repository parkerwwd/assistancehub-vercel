-- Add unique constraint on properties table for upsert functionality
-- This prevents duplicate properties based on name and address combination

-- First, remove any existing duplicates (keeping the first occurrence)
DELETE FROM properties a USING properties b
WHERE a.id > b.id 
  AND a.name = b.name 
  AND a.address = b.address;

-- Now add the unique constraint
ALTER TABLE properties 
ADD CONSTRAINT properties_name_address_unique 
UNIQUE (name, address);

-- Add index for better performance on lookups
CREATE INDEX IF NOT EXISTS idx_properties_name ON properties(name);

-- Add comment for documentation
COMMENT ON CONSTRAINT properties_name_address_unique ON properties IS 'Ensures no duplicate properties with same name and address';
