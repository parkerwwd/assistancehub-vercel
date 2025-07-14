-- Check for properties with suspicious data patterns that suggest column shifts
-- This query helps identify properties where years might be in bedroom columns

-- Log properties with suspiciously high bedroom counts (might be years)
DO $$
BEGIN
  -- Check for properties where bedroom counts look like years (1900-2030)
  IF EXISTS (
    SELECT 1 FROM properties 
    WHERE units_3br >= 1900 AND units_3br <= 2030
       OR units_4br >= 1900 AND units_4br <= 2030
  ) THEN
    RAISE NOTICE 'Found properties with potential column shift issues where years appear in bedroom columns';
    
    -- Log the problematic records
    RAISE NOTICE 'Properties with years in bedroom columns:';
    FOR r IN 
      SELECT id, name, year_put_in_service, units_studio, units_1br, units_2br, units_3br, units_4br
      FROM properties 
      WHERE units_3br >= 1900 AND units_3br <= 2030
         OR units_4br >= 1900 AND units_4br <= 2030
      LIMIT 10
    LOOP
      RAISE NOTICE 'Property: %, Year: %, 3BR: %, 4BR: %', r.name, r.year_put_in_service, r.units_3br, r.units_4br;
    END LOOP;
  END IF;
  
  -- Reset bedroom counts that look like years
  UPDATE properties
  SET units_3br = 0
  WHERE units_3br >= 1900 AND units_3br <= 2030;
  
  UPDATE properties
  SET units_4br = 0
  WHERE units_4br >= 1900 AND units_4br <= 2030;
  
  RAISE NOTICE 'Fixed bedroom counts that contained year values';
END $$; 