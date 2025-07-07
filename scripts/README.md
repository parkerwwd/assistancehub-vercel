# 📊 Supabase Data Upload Script

This script uploads CSV data directly to your Supabase database without needing local development setup.

## 🚀 Quick Start

### 1. Get Your Supabase Credentials

1. Go to [supabase.com](https://supabase.com) and sign in
2. Navigate to your project → Settings → API
3. Copy these values:
   - **Project URL** (e.g., `https://your-project-id.supabase.co`)
   - **Service Role Key** (the `service_role` secret, NOT the `anon` key)

### 2. Set Environment Variables

Create a `.env` file in the `scripts/` directory:

```bash
# Your Supabase Project URL
SUPABASE_URL=https://your-project-id.supabase.co

# Your Supabase Service Role Key (NOT the anon key)
SUPABASE_SERVICE_KEY=your-service-role-key-here
```

### 3. Install Dependencies

```bash
cd scripts
npm install
```

### 4. Upload Your CSV Data

```bash
node upload-to-supabase.js path/to/your/data.csv
```

## 📋 Supported CSV Columns

The script automatically maps common field names to your database:

| CSV Column | Database Field | Description |
|------------|----------------|-------------|
| `PARTICIPANT_CODE`, `PHA_CODE` | `pha_code` | Unique PHA identifier |
| `FORMAL_PARTICIPANT_NAME`, `PHA_NAME` | `name` | Agency name (required) |
| `FULL_ADDRESS`, `ADDRESS` | `address` | Full mailing address |
| `CITY` | `city` | City name |
| `STATE` | `state` | 2-letter state code |
| `ZIP`, `ZIP_CODE` | `zip` | ZIP code |
| `HA_PHN_NUM`, `PHONE` | `phone` | Contact phone |
| `HA_EMAIL_ADDR_TEXT`, `EMAIL` | `email` | Contact email |
| `WEBSITE`, `WEB_SITE` | `website` | Agency website |

## 🛠️ Features

- ✅ **Automatic field mapping** - Maps common CSV headers to database fields
- ✅ **Batch processing** - Handles large files efficiently (100 records per batch)
- ✅ **Upsert functionality** - Updates existing records based on PHA code
- ✅ **Error handling** - Continues processing even if some records fail
- ✅ **Progress tracking** - Shows upload progress and final statistics

## 📝 Example Usage

```bash
# Upload HUD PHA data
node upload-to-supabase.js ./data/hud-pha-data.csv

# Upload custom CSV file
node upload-to-supabase.js ~/Downloads/housing-authorities.csv
```

## 🔧 Advanced Options

### Custom Field Mapping

If your CSV has different column names, you can modify the `FIELD_MAPPINGS` object in `upload-to-supabase.js`:

```javascript
const FIELD_MAPPINGS = {
  'YOUR_CUSTOM_FIELD': 'database_field',
  'AGENCY_CONTACT': 'phone',
  // ... add more mappings
}
```

### Batch Size

For very large files, you can adjust the batch size:

```javascript
await uploadCSVToSupabase(csvFilePath, 500) // Process 500 records per batch
```

## 🚨 Important Notes

- **Use Service Role Key**: The anon key won't work for uploads
- **CSV Format**: Ensure your CSV has headers in the first row
- **Required Fields**: At minimum, your CSV must have a name/agency name field
- **Large Files**: For files over 100MB, consider splitting them or using Supabase's bulk import tools

## 📊 Expected Output

```
🚀 Starting Supabase upload...
📁 File: /path/to/your/data.csv
🔍 Testing Supabase connection...
✅ Supabase connection successful!
📤 Uploading batch of 100 records...
✅ Batch uploaded successfully
📤 Uploading batch of 100 records...
✅ Batch uploaded successfully
...

✅ Upload completed!
📊 Total processed: 1,250
✅ Successfully inserted: 1,240
❌ Errors: 10
```

## 🆘 Troubleshooting

**Connection Failed**: Check your SUPABASE_URL and SUPABASE_SERVICE_KEY
**Permission Denied**: Make sure you're using the service role key, not the anon key
**File Not Found**: Verify the path to your CSV file is correct
**Import Errors**: Check that your CSV has the required name/agency field 