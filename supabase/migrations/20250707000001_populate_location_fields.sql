-- Parse existing address data to populate city, state, and zip fields
-- This will help with geocoding and location-based searches

-- Update city, state, and zip from address field
-- Expected address format: "123 Main St, City, ST 12345"
UPDATE public.pha_agencies
SET 
  -- Extract city (the part before the last comma that precedes state and zip)
  city = CASE 
    WHEN address IS NOT NULL AND address LIKE '%,%,%' THEN
      TRIM(SPLIT_PART(REVERSE(SPLIT_PART(REVERSE(address), ',', 2)), ',', 1))
    ELSE NULL
  END,
  
  -- Extract state (2-letter code before zip)
  state = CASE
    WHEN address IS NOT NULL AND address ~ '[A-Z]{2}\s+\d{5}' THEN
      SUBSTRING(address FROM '([A-Z]{2})\s+\d{5}')
    ELSE NULL
  END,
  
  -- Extract zip code
  zip = CASE
    WHEN address IS NOT NULL AND address ~ '\d{5}(-\d{4})?' THEN
      SUBSTRING(address FROM '(\d{5}(-\d{4})?)')
    ELSE NULL
  END
WHERE city IS NULL OR state IS NULL OR zip IS NULL;

-- Log how many records were updated
DO $$
DECLARE
  updated_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO updated_count 
  FROM public.pha_agencies 
  WHERE city IS NOT NULL OR state IS NOT NULL OR zip IS NOT NULL;
  
  RAISE NOTICE 'Updated location fields for % PHA agencies', updated_count;
END $$;

-- For addresses that couldn't be parsed automatically, we'll need to geocode them
-- This query helps identify agencies that need geocoding
CREATE OR REPLACE VIEW public.agencies_needing_geocoding AS
SELECT 
  id,
  name,
  address,
  city,
  state,
  zip,
  latitude,
  longitude
FROM public.pha_agencies
WHERE 
  (latitude IS NULL OR longitude IS NULL)
  AND address IS NOT NULL
  AND address != '';

-- Create a more robust parsing function for complex addresses
CREATE OR REPLACE FUNCTION public.parse_address_components(addr TEXT)
RETURNS TABLE(city TEXT, state TEXT, zip TEXT) AS $$
DECLARE
  parts TEXT[];
  last_part TEXT;
  state_zip_part TEXT;
BEGIN
  -- Return NULL values if address is NULL or empty
  IF addr IS NULL OR TRIM(addr) = '' THEN
    RETURN QUERY SELECT NULL::TEXT, NULL::TEXT, NULL::TEXT;
    RETURN;
  END IF;
  
  -- Split address by comma
  parts := STRING_TO_ARRAY(addr, ',');
  
  -- Need at least 3 parts for street, city, state/zip
  IF array_length(parts, 1) >= 3 THEN
    -- Get the last part (should contain state and zip)
    last_part := TRIM(parts[array_length(parts, 1)]);
    
    -- Extract state (2 letter code)
    IF last_part ~ '[A-Z]{2}\s+\d{5}' THEN
      state := SUBSTRING(last_part FROM '([A-Z]{2})\s+\d{5}');
    ELSE
      state := NULL;
    END IF;
    
    -- Extract zip
    IF last_part ~ '\d{5}(-\d{4})?' THEN
      zip := SUBSTRING(last_part FROM '(\d{5}(-\d{4})?)');
    ELSE
      zip := NULL;
    END IF;
    
    -- City is the second to last part
    IF array_length(parts, 1) >= 2 THEN
      city := TRIM(parts[array_length(parts, 1) - 1]);
    ELSE
      city := NULL;
    END IF;
  ELSE
    city := NULL;
    state := NULL;
    zip := NULL;
  END IF;
  
  RETURN QUERY SELECT city, state, zip;
END;
$$ LANGUAGE plpgsql;

-- Use the function to update any remaining NULL values
UPDATE public.pha_agencies
SET 
  city = COALESCE(city, (SELECT p.city FROM public.parse_address_components(address) p)),
  state = COALESCE(state, (SELECT p.state FROM public.parse_address_components(address) p)),
  zip = COALESCE(zip, (SELECT p.zip FROM public.parse_address_components(address) p))
WHERE (city IS NULL OR state IS NULL OR zip IS NULL) AND address IS NOT NULL; 