
-- Fix numeric field overflow by increasing precision for percentage fields
ALTER TABLE public.pha_agencies 
ALTER COLUMN pct_occupied TYPE decimal(8,4),
ALTER COLUMN pct_reported TYPE decimal(8,4);

-- Also increase precision for financial amounts to handle larger values
ALTER TABLE public.pha_agencies 
ALTER COLUMN opfund_amount TYPE decimal(20,2),
ALTER COLUMN opfund_amount_prev_yr TYPE decimal(20,2),
ALTER COLUMN capfund_amount TYPE decimal(20,2);
