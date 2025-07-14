-- Add LIHTC fields to properties table
ALTER TABLE properties
ADD COLUMN IF NOT EXISTS year_put_in_service INTEGER,
ADD COLUMN IF NOT EXISTS low_income_units INTEGER,
ADD COLUMN IF NOT EXISTS units_studio INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS units_1br INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS units_2br INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS units_3br INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS units_4br INTEGER DEFAULT 0;

-- Add comment to explain the fields
COMMENT ON COLUMN properties.year_put_in_service IS 'Year the property was put into service (yr_pis in LIHTC data)';
COMMENT ON COLUMN properties.low_income_units IS 'Number of low income units (li_units in LIHTC data)';
COMMENT ON COLUMN properties.units_studio IS 'Number of studio units (n_0br in LIHTC data)';
COMMENT ON COLUMN properties.units_1br IS 'Number of 1 bedroom units (n_1br in LIHTC data)';
COMMENT ON COLUMN properties.units_2br IS 'Number of 2 bedroom units (n_2br in LIHTC data)';
COMMENT ON COLUMN properties.units_3br IS 'Number of 3 bedroom units (n_3br in LIHTC data)';
COMMENT ON COLUMN properties.units_4br IS 'Number of 4+ bedroom units (n_4br in LIHTC data)'; 