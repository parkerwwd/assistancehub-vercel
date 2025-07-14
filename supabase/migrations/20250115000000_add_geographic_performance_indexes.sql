-- Performance indexes for geographic queries
-- These indexes will significantly speed up location-based searches

-- Create a composite index for city + state queries (most common search)
CREATE INDEX IF NOT EXISTS idx_properties_city_state ON properties(city, state) 
WHERE city IS NOT NULL AND state IS NOT NULL;

-- Create a spatial index using btree for bounding box queries
CREATE INDEX IF NOT EXISTS idx_properties_lat_lng_bounds ON properties(latitude, longitude)
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Create indexes for common filter combinations
CREATE INDEX IF NOT EXISTS idx_properties_available ON properties(units_available)
WHERE units_available > 0;

CREATE INDEX IF NOT EXISTS idx_properties_waitlist ON properties(waitlist_open)
WHERE waitlist_open = true;

-- Composite index for type + location
CREATE INDEX IF NOT EXISTS idx_properties_type_state ON properties(property_type, state)
WHERE property_type IS NOT NULL AND state IS NOT NULL;

-- Analyze the table to update statistics for query planner
ANALYZE properties;

-- Add similar indexes for PHAs
CREATE INDEX IF NOT EXISTS idx_pha_agencies_city_state ON pha_agencies(city, state)
WHERE city IS NOT NULL AND state IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_pha_agencies_lat_lng_bounds ON pha_agencies(latitude, longitude)
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

ANALYZE pha_agencies; 