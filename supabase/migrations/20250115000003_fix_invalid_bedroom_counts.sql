-- Fix invalid bedroom counts in properties table
-- Values like 9999 are clearly data errors

DO $$
DECLARE
  updated_count INTEGER;
  r RECORD;
BEGIN
  -- Reset bedroom counts that are unreasonably high (> 500)
  -- No property realistically has 500+ units of a single bedroom type
  UPDATE properties
  SET 
    units_studio = CASE WHEN units_studio > 500 THEN 0 ELSE units_studio END,
    units_1br = CASE WHEN units_1br > 500 THEN 0 ELSE units_1br END,
    units_2br = CASE WHEN units_2br > 500 THEN 0 ELSE units_2br END,
    units_3br = CASE WHEN units_3br > 500 THEN 0 ELSE units_3br END,
    units_4br = CASE WHEN units_4br > 500 THEN 0 ELSE units_4br END
  WHERE units_studio > 500 
     OR units_1br > 500 
     OR units_2br > 500 
     OR units_3br > 500 
     OR units_4br > 500;
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  
  IF updated_count > 0 THEN
    RAISE NOTICE 'Fixed % properties with invalid bedroom counts (values > 500)', updated_count;
  ELSE
    RAISE NOTICE 'No properties found with invalid bedroom counts';
  END IF;
  
  -- Log some examples of what was fixed
  IF updated_count > 0 THEN
    RAISE NOTICE 'Examples of properties that were fixed:';
    FOR r IN 
      SELECT id, name, units_studio, units_1br, units_2br, units_3br, units_4br
      FROM properties 
      WHERE units_studio = 0 OR units_1br = 0 OR units_2br = 0 OR units_3br = 0 OR units_4br = 0
      ORDER BY created_at DESC
      LIMIT 5
    LOOP
      RAISE NOTICE 'Property: % - Studio: %, 1BR: %, 2BR: %, 3BR: %, 4BR: %', 
        r.name, r.units_studio, r.units_1br, r.units_2br, r.units_3br, r.units_4br;
    END LOOP;
  END IF;
END $$; 