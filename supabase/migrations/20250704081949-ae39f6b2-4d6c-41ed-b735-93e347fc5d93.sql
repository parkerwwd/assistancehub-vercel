
-- Add missing fields to match CSV data structure
ALTER TABLE public.pha_agencies 
ADD COLUMN IF NOT EXISTS pha_code text,
ADD COLUMN IF NOT EXISTS phas_designation text,
ADD COLUMN IF NOT EXISTS acc_units integer,
ADD COLUMN IF NOT EXISTS total_occupied integer,
ADD COLUMN IF NOT EXISTS pct_occupied decimal(5,2),
ADD COLUMN IF NOT EXISTS regular_vacant integer,
ADD COLUMN IF NOT EXISTS pha_total_units integer,
ADD COLUMN IF NOT EXISTS number_reported integer,
ADD COLUMN IF NOT EXISTS pct_reported decimal(5,2),
ADD COLUMN IF NOT EXISTS opfund_amount decimal(15,2),
ADD COLUMN IF NOT EXISTS opfund_amount_prev_yr decimal(15,2),
ADD COLUMN IF NOT EXISTS capfund_amount decimal(15,2);
