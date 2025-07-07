-- Fix missing state data by extracting from address field
-- This helps with states like Kansas and Arizona that might not be showing up

-- Update records where state is null but address contains state info
UPDATE public.pha_agencies
SET state = 
  CASE 
    -- Check for common state patterns at end of address
    WHEN address ~* ', (AL|AK|AZ|AR|CA|CO|CT|DE|FL|GA|HI|ID|IL|IN|IA|KS|KY|LA|ME|MD|MA|MI|MN|MS|MO|MT|NE|NV|NH|NJ|NM|NY|NC|ND|OH|OK|OR|PA|RI|SC|SD|TN|TX|UT|VT|VA|WA|WV|WI|WY|DC)\s+\d{5}' 
    THEN substring(address from ', ([A-Z]{2})\s+\d{5}')
    
    -- Check for state abbreviation with comma separator
    WHEN address ~* ', (AL|AK|AZ|AR|CA|CO|CT|DE|FL|GA|HI|ID|IL|IN|IA|KS|KY|LA|ME|MD|MA|MI|MN|MS|MO|MT|NE|NV|NH|NJ|NM|NY|NC|ND|OH|OK|OR|PA|RI|SC|SD|TN|TX|UT|VT|VA|WA|WV|WI|WY|DC)\s*$' 
    THEN substring(address from ', ([A-Z]{2})\s*$')
    
    -- Check for specific state names
    WHEN lower(address) LIKE '%arizona%' THEN 'AZ'
    WHEN lower(address) LIKE '%kansas%' THEN 'KS'
    WHEN lower(address) LIKE '%california%' THEN 'CA'
    WHEN lower(address) LIKE '%texas%' THEN 'TX'
    WHEN lower(address) LIKE '%florida%' THEN 'FL'
    WHEN lower(address) LIKE '%new york%' THEN 'NY'
    WHEN lower(address) LIKE '%illinois%' THEN 'IL'
    WHEN lower(address) LIKE '%georgia%' THEN 'GA'
    WHEN lower(address) LIKE '%pennsylvania%' THEN 'PA'
    WHEN lower(address) LIKE '%ohio%' THEN 'OH'
    WHEN lower(address) LIKE '%michigan%' THEN 'MI'
    WHEN lower(address) LIKE '%north carolina%' THEN 'NC'
    WHEN lower(address) LIKE '%virginia%' THEN 'VA'
    WHEN lower(address) LIKE '%washington%' AND lower(address) NOT LIKE '%d.c.%' AND lower(address) NOT LIKE '%dc%' THEN 'WA'
    WHEN lower(address) LIKE '%massachusetts%' THEN 'MA'
    WHEN lower(address) LIKE '%tennessee%' THEN 'TN'
    WHEN lower(address) LIKE '%indiana%' THEN 'IN'
    WHEN lower(address) LIKE '%missouri%' THEN 'MO'
    WHEN lower(address) LIKE '%maryland%' THEN 'MD'
    WHEN lower(address) LIKE '%wisconsin%' THEN 'WI'
    WHEN lower(address) LIKE '%minnesota%' THEN 'MN'
    WHEN lower(address) LIKE '%colorado%' THEN 'CO'
    WHEN lower(address) LIKE '%alabama%' THEN 'AL'
    WHEN lower(address) LIKE '%south carolina%' THEN 'SC'
    WHEN lower(address) LIKE '%louisiana%' THEN 'LA'
    WHEN lower(address) LIKE '%kentucky%' THEN 'KY'
    WHEN lower(address) LIKE '%oregon%' THEN 'OR'
    WHEN lower(address) LIKE '%oklahoma%' THEN 'OK'
    WHEN lower(address) LIKE '%connecticut%' THEN 'CT'
    WHEN lower(address) LIKE '%iowa%' THEN 'IA'
    WHEN lower(address) LIKE '%mississippi%' THEN 'MS'
    WHEN lower(address) LIKE '%arkansas%' THEN 'AR'
    WHEN lower(address) LIKE '%utah%' THEN 'UT'
    WHEN lower(address) LIKE '%nevada%' THEN 'NV'
    WHEN lower(address) LIKE '%new mexico%' THEN 'NM'
    WHEN lower(address) LIKE '%west virginia%' THEN 'WV'
    WHEN lower(address) LIKE '%nebraska%' THEN 'NE'
    WHEN lower(address) LIKE '%idaho%' THEN 'ID'
    WHEN lower(address) LIKE '%hawaii%' THEN 'HI'
    WHEN lower(address) LIKE '%new hampshire%' THEN 'NH'
    WHEN lower(address) LIKE '%maine%' THEN 'ME'
    WHEN lower(address) LIKE '%montana%' THEN 'MT'
    WHEN lower(address) LIKE '%rhode island%' THEN 'RI'
    WHEN lower(address) LIKE '%delaware%' THEN 'DE'
    WHEN lower(address) LIKE '%south dakota%' THEN 'SD'
    WHEN lower(address) LIKE '%north dakota%' THEN 'ND'
    WHEN lower(address) LIKE '%alaska%' THEN 'AK'
    WHEN lower(address) LIKE '%vermont%' THEN 'VT'
    WHEN lower(address) LIKE '%wyoming%' THEN 'WY'
    WHEN lower(address) LIKE '%district of columbia%' OR lower(address) LIKE '%washington%d.c.%' OR lower(address) LIKE '%washington dc%' THEN 'DC'
    ELSE state
  END
WHERE state IS NULL OR state = '';

-- Also update city field where it's missing but can be extracted from address
UPDATE public.pha_agencies
SET city = 
  CASE
    -- Extract city from pattern: "street, city, state zip"
    WHEN city IS NULL AND address ~ '^[^,]+,\s*([^,]+),\s*[A-Z]{2}\s+\d{5}'
    THEN trim(substring(address from '^[^,]+,\s*([^,]+),\s*[A-Z]{2}\s+\d{5}'))
    ELSE city
  END
WHERE (city IS NULL OR city = '') AND address IS NOT NULL;

-- Update zip where it's missing but can be extracted
UPDATE public.pha_agencies
SET zip = 
  CASE
    -- Extract ZIP from end of address
    WHEN zip IS NULL AND address ~ '\d{5}(-\d{4})?$'
    THEN substring(address from '(\d{5}(-\d{4})?)$')
    ELSE zip
  END
WHERE (zip IS NULL OR zip = '') AND address IS NOT NULL;

-- Log how many records were updated
DO $$
DECLARE
  updated_state_count INTEGER;
  updated_city_count INTEGER;
  updated_zip_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO updated_state_count FROM public.pha_agencies WHERE state IS NOT NULL AND state != '';
  SELECT COUNT(*) INTO updated_city_count FROM public.pha_agencies WHERE city IS NOT NULL AND city != '';
  SELECT COUNT(*) INTO updated_zip_count FROM public.pha_agencies WHERE zip IS NOT NULL AND zip != '';
  
  RAISE NOTICE 'State data population complete. Records with state: %, city: %, zip: %', 
    updated_state_count, updated_city_count, updated_zip_count;
END $$; 