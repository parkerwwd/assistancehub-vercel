# LIHTC Data Cleaning & Upload Guide

## Quick Start

### 1. Stop the Current Upload
If you're still seeing errors, refresh your browser to stop the current upload.

### 2. Install Dependencies
```bash
cd scripts
npm install
```

### 3. Clean Your LIHTC Data
```bash
node clean-lihtc-data.js ../LIHTCPUB_enriched_52002_properties.csv
```

This will create a new file: `LIHTCPUB_enriched_52002_properties_cleaned.csv`

### 4. What the Cleaning Script Does
- ✅ Converts 9999 year values to NULL
- ✅ Maps bedroom columns (n_0br → units_studio, etc.)
- ✅ Fixes typos (ANCORAGE → ANCHORAGE)
- ✅ Removes placeholder values (02XXXXXXXXX)
- ✅ Validates coordinates
- ✅ Adds required fields with defaults
- ✅ Sets all properties as 'tax_credit' type

### 5. Review the Cleaned File
Open `LIHTCPUB_enriched_52002_properties_cleaned.csv` to verify:
- No more 9999 values
- Columns match what the database expects
- Coordinates are valid

### 6. Upload the Cleaned Data
Use the PropertyDataManager in the admin panel with the cleaned file.

## What Was Causing the Errors

1. **Numeric Overflow (22003)**
   - Year fields had 9999 values
   - Database expects NULL for missing years

2. **Duplicate Key (21000)**
   - Some properties appear multiple times in the batch
   - The cleaning doesn't fix this - the upload will handle it

3. **Column Mismatch**
   - LIHTC uses different column names than expected
   - Script maps them correctly

## Alternative: Direct Database Upload

If the UI upload still has issues, use the command line:

```bash
# Set up your .env file first
node upload-to-supabase.js LIHTCPUB_enriched_52002_properties_cleaned.csv
```

## Tips
- For 50,000+ records, expect the upload to take 10-20 minutes
- Monitor the console for specific error messages
- The unique constraint on (name, address) will prevent duplicates 