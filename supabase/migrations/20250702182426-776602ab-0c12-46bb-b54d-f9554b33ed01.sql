-- Clear all PHA data to allow for fresh import with cleaner addresses
DELETE FROM pha_agencies;

-- Reset any sequences or auto-incrementing values if needed
-- (Note: Since we're using UUIDs, no sequence reset is needed)