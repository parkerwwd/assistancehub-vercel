-- Remove accidentally uploaded properties from pha_agencies table
-- This script identifies records added today and removes them

-- First, let's see what was added today
SELECT COUNT(*) as records_added_today
FROM pha_agencies
WHERE DATE(created_at) = CURRENT_DATE
   OR DATE(last_updated) = CURRENT_DATE;

-- Show a sample of today's uploads to verify they're properties
SELECT id, name, address, city, state, created_at
FROM pha_agencies
WHERE DATE(created_at) = CURRENT_DATE
   OR DATE(last_updated) = CURRENT_DATE
ORDER BY created_at DESC
LIMIT 10;

-- Optional: Look for telltale signs of property data
-- Properties often have different naming patterns than PHAs
SELECT id, name, address, city, state
FROM pha_agencies
WHERE (DATE(created_at) = CURRENT_DATE OR DATE(last_updated) = CURRENT_DATE)
  AND (
    name LIKE '%APTS%' 
    OR name LIKE '%APARTMENTS%'
    OR name LIKE '%VILLAGE%'
    OR name LIKE '%ESTATES%'
    OR name LIKE '%TERRACE%'
    OR name LIKE '%COURT%'
    OR name LIKE '%PLAZA%'
    OR name LIKE '%TOWERS%'
    OR name LIKE '%MANOR%'
    OR name LIKE '%HOMES%'
    OR name LIKE '%RESIDENCES%'
  )
LIMIT 20;

-- Count how many we're about to delete
SELECT COUNT(*) as records_to_delete
FROM pha_agencies
WHERE DATE(created_at) = CURRENT_DATE
   OR DATE(last_updated) = CURRENT_DATE;

-- ⚠️ DANGER ZONE - Uncomment the line below to actually delete
-- DELETE FROM pha_agencies WHERE DATE(created_at) = CURRENT_DATE OR DATE(last_updated) = CURRENT_DATE;

-- Alternative: Delete only those with property-like names added today
-- DELETE FROM pha_agencies 
-- WHERE (DATE(created_at) = CURRENT_DATE OR DATE(last_updated) = CURRENT_DATE)
--   AND (
--     name LIKE '%APTS%' 
--     OR name LIKE '%APARTMENTS%'
--     OR name LIKE '%VILLAGE%'
--     OR name LIKE '%ESTATES%'
--     OR name LIKE '%TERRACE%'
--     OR name LIKE '%COURT%'
--     OR name LIKE '%PLAZA%'
--     OR name LIKE '%TOWERS%'
--     OR name LIKE '%MANOR%'
--     OR name LIKE '%HOMES%'
--     OR name LIKE '%RESIDENCES%'
--   );

-- Verify deletion worked
-- SELECT COUNT(*) as remaining_records_from_today
-- FROM pha_agencies
-- WHERE DATE(created_at) = CURRENT_DATE
--    OR DATE(last_updated) = CURRENT_DATE; 