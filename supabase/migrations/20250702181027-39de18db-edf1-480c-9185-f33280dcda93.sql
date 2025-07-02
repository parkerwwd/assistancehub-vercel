-- Clean up corrupted coordinate data in pha_agencies table
-- Set invalid coordinates to NULL so they don't break the map

UPDATE pha_agencies 
SET latitude = NULL 
WHERE latitude IS NOT NULL 
  AND (latitude < -90 OR latitude > 90 OR latitude = 0 OR latitude = 1);

UPDATE pha_agencies 
SET longitude = NULL 
WHERE longitude IS NOT NULL 
  AND (longitude < -180 OR longitude > 180 OR longitude = 0 OR longitude = 80 OR longitude = 1);

-- Fix clearly misplaced data where city/state/zip are in wrong columns
-- The Phoenix data shows city="0403", state="03", zip="Y" which is clearly wrong
UPDATE pha_agencies 
SET 
  city = CASE 
    WHEN name ILIKE '%phoenix%' AND city = '0403' THEN 'Phoenix'
    ELSE city 
  END,
  state = CASE 
    WHEN name ILIKE '%phoenix%' AND state = '03' THEN 'AZ'
    WHEN state = '03' THEN 'AZ'
    WHEN state = '06' THEN 'CA'  
    WHEN state = '48' THEN 'TX'
    WHEN state = '10' THEN 'DE'
    ELSE state 
  END,
  zip = CASE 
    WHEN zip = 'Y' OR zip = '1' OR LENGTH(zip) < 5 THEN NULL
    ELSE zip 
  END,
  address = CASE 
    WHEN address = 'Y' OR address = '1' THEN NULL
    ELSE address 
  END
WHERE name IS NOT NULL;