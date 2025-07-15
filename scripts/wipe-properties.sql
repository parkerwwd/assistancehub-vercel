-- Wipe all properties from the database
-- WARNING: This will delete ALL property data!

-- Show current count before deletion
SELECT COUNT(*) as current_property_count FROM properties;

-- Delete all properties
TRUNCATE TABLE properties RESTART IDENTITY CASCADE;

-- Verify deletion
SELECT COUNT(*) as property_count_after_deletion FROM properties;

-- Show message
DO $$
BEGIN
  RAISE NOTICE 'Properties table has been wiped clean. Ready for fresh import.';
END $$; 