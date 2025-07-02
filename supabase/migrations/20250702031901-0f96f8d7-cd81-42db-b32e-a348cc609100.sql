
-- Drop the existing restrictive policy that's blocking imports
DROP POLICY IF EXISTS "Allow authenticated users to manage PHA data" ON pha_agencies;

-- Create a more permissive policy for inserts (needed for CSV imports)
CREATE POLICY "Allow public inserts for PHA data" 
ON pha_agencies 
FOR INSERT 
WITH CHECK (true);

-- Keep the existing public read policy
-- (The "Allow public read access to PHA agencies" policy should already exist)

-- Add a policy for updates (in case we need to update existing records)
CREATE POLICY "Allow public updates for PHA data" 
ON pha_agencies 
FOR UPDATE 
USING (true)
WITH CHECK (true);

-- Add a policy for deletes (for data management)
CREATE POLICY "Allow public deletes for PHA data" 
ON pha_agencies 
FOR DELETE 
USING (true);
