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