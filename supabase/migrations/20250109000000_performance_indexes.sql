-- Performance Optimization Indexes for Heavy Traffic
-- Run this migration to dramatically improve query performance

-- 1. Core search indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_pha_agencies_state 
ON pha_agencies(state);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_pha_agencies_city 
ON pha_agencies(city);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_pha_agencies_zip 
ON pha_agencies(zip);

-- 2. Full-text search index for PHA names
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_pha_agencies_name_search 
ON pha_agencies USING gin(to_tsvector('english', name));

-- 3. Geospatial index for location-based queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_pha_agencies_location 
ON pha_agencies USING gist(ST_Point(longitude, latitude))
WHERE longitude IS NOT NULL AND latitude IS NOT NULL;

-- 4. Composite index for common search patterns
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_pha_agencies_state_city 
ON pha_agencies(state, city);

-- 5. Index for phone number searches
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_pha_agencies_phone 
ON pha_agencies(phone) 
WHERE phone IS NOT NULL;

-- 6. Index for office types/categories
-- Commented out: office_type column doesn't exist
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_pha_agencies_office_type 
-- ON pha_agencies(office_type) 
-- WHERE office_type IS NOT NULL;

-- 7. Partial index for active/valid offices only
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_pha_agencies_active 
ON pha_agencies(state, city, name) 
WHERE address IS NOT NULL AND address != '';

-- 8. Index for pagination with consistent ordering
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_pha_agencies_name_id 
ON pha_agencies(name, id);

-- 9. Index for region-based searches
-- Commented out: county column doesn't exist
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_pha_agencies_region 
-- ON pha_agencies(state, city, county)
-- WHERE county IS NOT NULL;

-- 10. Performance monitoring - enable pg_stat_statements
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- Create a view for monitoring slow queries
CREATE OR REPLACE VIEW slow_queries AS
SELECT 
    query,
    calls,
    total_exec_time,
    mean_exec_time,
    rows
FROM pg_stat_statements
WHERE mean_exec_time > 100
ORDER BY mean_exec_time DESC
LIMIT 20;

-- Add comments for documentation
COMMENT ON INDEX idx_pha_agencies_state IS 'Optimizes state-based searches';
COMMENT ON INDEX idx_pha_agencies_city IS 'Optimizes city-based searches';
COMMENT ON INDEX idx_pha_agencies_name_search IS 'Full-text search for PHA names';
COMMENT ON INDEX idx_pha_agencies_location IS 'Geospatial queries for map functionality';
COMMENT ON INDEX idx_pha_agencies_state_city IS 'Composite searches by state and city';
COMMENT ON VIEW slow_queries IS 'Monitor query performance for optimization'; 