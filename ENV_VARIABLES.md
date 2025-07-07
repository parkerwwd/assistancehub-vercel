# Environment Variables for Vercel Deployment

## Required Environment Variables

Set these environment variables in your Vercel project settings:

### Supabase Configuration
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous key

### Mapbox Configuration  
- `VITE_MAPBOX_TOKEN` - Your Mapbox API token (starts with pk.)

### Google Maps Configuration
- `VITE_GOOGLE_MAPS_API_KEY` - Your Google Maps API key

## Setting Environment Variables in Vercel

1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add each variable with the appropriate values
4. Make sure to set them for all environments (Production, Preview, Development)

## Current Tokens (to migrate)
The current hardcoded tokens are:

**Mapbox Token:**
```
pk.eyJ1Ijoib2RoLTEiLCJhIjoiY21jbDNxZThoMDZwbzJtb3FxeXJjenhndSJ9.lHDryqr2gOUMzjrHRP-MLA
```

**Google Maps API Key:**
```
AIzaSyDldtppRX48PKyBUvlP7mnRFzO_vb6sVgU
```

Move these to the respective environment variables in Vercel.

## 📊 Data Import

For importing PHA and property data directly to Supabase:

1. **Check the upload script**: `scripts/upload-to-supabase.js`
2. **Follow the guide**: `scripts/README.md`
3. **Use your Supabase Service Role Key** (not the anon key) for uploads

The upload script requires these additional environment variables:
- `SUPABASE_URL` - Your Supabase project URL (same as VITE_SUPABASE_URL)
- `SUPABASE_SERVICE_KEY` - Your Supabase service role key (for database writes) 