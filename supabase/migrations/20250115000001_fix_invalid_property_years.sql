-- Fix invalid year_put_in_service values
-- Set to NULL any years that are unrealistic (before 1900 or after current year + 5)
UPDATE properties
SET year_put_in_service = NULL
WHERE year_put_in_service IS NOT NULL 
  AND (year_put_in_service < 1900 
    OR year_put_in_service > EXTRACT(YEAR FROM CURRENT_DATE) + 5
    OR year_put_in_service = 9999
    OR year_put_in_service = 1);

-- Add a check constraint to prevent invalid years in the future
ALTER TABLE properties
ADD CONSTRAINT valid_year_put_in_service 
CHECK (
  year_put_in_service IS NULL 
  OR (year_put_in_service >= 1900 
    AND year_put_in_service <= EXTRACT(YEAR FROM CURRENT_DATE) + 5)
); 