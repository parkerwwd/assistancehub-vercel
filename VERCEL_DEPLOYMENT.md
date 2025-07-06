# Vercel Deployment Guide

## Prerequisites

1. **Vercel Account** - Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository** - Your code should be in a GitHub repository
3. **API Keys** - Gather all required API keys (see ENV_VARIABLES.md)

## Pre-Deployment Steps

### Fix Package Manager Conflict

This project has both `package-lock.json` and `bun.lockb` files, which can cause conflicts. Choose one:

**Option 1: Use npm (Recommended for Vercel)**
```bash
rm bun.lockb
npm install
```

**Option 2: Configure Vercel to use bun**
```bash
rm package-lock.json
# Add "packageManager": "bun" to package.json
```

## Step-by-Step Deployment

### 1. Connect Repository to Vercel

1. Log into your Vercel dashboard
2. Click "New Project"
3. Import your GitHub repository
4. Vercel will automatically detect this is a Vite project

### 2. Configure Build Settings

Vercel should automatically detect:
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 3. Set Environment Variables

Go to Settings → Environment Variables and add:

```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_MAPBOX_TOKEN=pk.eyJ1Ijoib2RoLTEiLCJhIjoiY21jbDNxZThoMDZwbzJtb3FxeXJjenhndSJ9.lHDryqr2gOUMzjrHRP-MLA
VITE_GOOGLE_MAPS_API_KEY=AIzaSyDldtppRX48PKyBUvlP7mnRFzO_vb6sVgU
```

**Important**: Set these for all environments (Production, Preview, Development)

### 4. Deploy

1. Click "Deploy" 
2. Wait for the build to complete
3. Your app will be available at the provided Vercel URL

## Post-Deployment Checklist

- [ ] Test map functionality (Mapbox)
- [ ] Test Street View images (Google Maps)
- [ ] Test PHA data loading (Supabase)
- [ ] Test authentication (Supabase Auth)
- [ ] Test all routes work (SPA routing)
- [ ] Test mobile responsiveness
- [ ] Test data import functionality

## Troubleshooting

### Common Issues

1. **Map not loading**: Check VITE_MAPBOX_TOKEN is set correctly
2. **Street View images not showing**: Check VITE_GOOGLE_MAPS_API_KEY
3. **Database connection issues**: Verify Supabase environment variables
4. **404 on route refresh**: Ensure vercel.json rewrites are configured
5. **Build failures**: Check that all dependencies are in package.json

### Performance Optimization

- Enable Vercel Analytics in project settings
- Consider enabling Vercel Speed Insights
- Monitor Core Web Vitals

## Domain Setup (Optional)

1. Go to Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions
4. Wait for SSL certificate generation

## Continuous Deployment

- Push to main branch triggers automatic deployment
- Preview deployments for PRs
- Rollback available from deployment history 