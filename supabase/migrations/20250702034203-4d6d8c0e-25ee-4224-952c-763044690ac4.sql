
-- Update the latitude and longitude columns to use a more appropriate data type
-- NUMERIC(10,8) allows for coordinates like -123.12345678 (sufficient precision for GPS coordinates)
ALTER TABLE public.pha_agencies 
ALTER COLUMN latitude TYPE NUMERIC(10,8),
ALTER COLUMN longitude TYPE NUMERIC(11,8);

-- The latitude range is -90 to +90, so 10 total digits with 8 decimal places works
-- The longitude range is -180 to +180, so 11 total digits with 8 decimal places works
