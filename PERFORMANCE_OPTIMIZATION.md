# Performance Optimization Guide for Heavy Traffic

## 🔥 Critical Optimizations (Implement ASAP)

### 1. **Database Performance** 
**Priority: HIGHEST** - Your Supabase queries will be the first bottleneck

```sql
-- Add these indexes to your Supabase database:
CREATE INDEX CONCURRENTLY idx_pha_agencies_state ON pha_agencies(state);
CREATE INDEX CONCURRENTLY idx_pha_agencies_city ON pha_agencies(city);
CREATE INDEX CONCURRENTLY idx_pha_agencies_name_search ON pha_agencies USING gin(to_tsvector('english', name));
CREATE INDEX CONCURRENTLY idx_pha_agencies_location ON pha_agencies USING gist(ST_Point(longitude, latitude));
```

### 2. **Code Splitting & Lazy Loading**
**Priority: HIGH** - Reduce initial bundle size

```typescript
// In your main App.tsx, implement lazy loading:
const Section8 = lazy(() => import('./pages/Section8'));
const PHADetail = lazy(() => import('./pages/PHADetail'));
const SNAP = lazy(() => import('./pages/SNAP'));
const DataAdmin = lazy(() => import('./pages/DataAdmin'));

// Wrap routes in Suspense
<Suspense fallback={<div className="flex justify-center items-center min-h-screen">
  <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
</div>}>
  <Route path="/section8" element={<Section8 />} />
</Suspense>
```

### 3. **API Response Caching**
**Priority: HIGH** - Cache PHA data to reduce database load

```typescript
// Add to your PHA service:
const PHA_CACHE_KEY = 'pha-data';
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

export const getCachedPHAData = async (filters: any) => {
  const cacheKey = `${PHA_CACHE_KEY}-${JSON.stringify(filters)}`;
  const cached = localStorage.getItem(cacheKey);
  
  if (cached) {
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp < CACHE_DURATION) {
      return data;
    }
  }
  
  const freshData = await fetchPHAData(filters);
  localStorage.setItem(cacheKey, JSON.stringify({
    data: freshData,
    timestamp: Date.now()
  }));
  
  return freshData;
};
```

## 🚀 Performance Monitoring Setup

### **1. Add Vercel Analytics & Speed Insights**
```bash
npm install @vercel/analytics @vercel/speed-insights
```

```typescript
// Add to your main.tsx:
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
    <Analytics />
    <SpeedInsights />
  </React.StrictMode>
);
```

### **2. Error Monitoring with Sentry**
```bash
npm install @sentry/react @sentry/tracing
```

### **3. Performance Budgets in Vercel**
Add to `vercel.json`:
```json
{
  "functions": {
    "app/api/pha/route.ts": {
      "maxDuration": 10
    }
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    },
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Cache-Control", 
          "value": "s-maxage=300, stale-while-revalidate=60"
        }
      ]
    }
  ]
}
```

## 📊 Database Optimization

### **Supabase Performance Settings**
1. **Connection Pooling**: Enable in Supabase Dashboard → Settings → Database
2. **Read Replicas**: Consider upgrading to Pro plan for read replicas
3. **Query Optimization**: 
   ```sql
   -- Monitor slow queries:
   SELECT query, mean_exec_time, calls 
   FROM pg_stat_statements 
   WHERE mean_exec_time > 100 
   ORDER BY mean_exec_time DESC;
   ```

### **Pagination & Limiting**
```typescript
// Implement virtual scrolling for large lists
const ITEMS_PER_PAGE = 50; // Reduce from current 100+

// Add query limits:
const { data, error } = await supabase
  .from('pha_agencies')
  .select('*')
  .range(offset, offset + ITEMS_PER_PAGE - 1)
  .order('name');
```

## 🎯 Frontend Optimizations

### **1. Image Optimization**
- ✅ Already implemented WebP format and caching in GoogleMapsService
- Add preloading for critical images
- Consider using a CDN for static assets

### **2. Search Optimization**
```typescript
// Debounce more aggressively under high load
const SEARCH_DEBOUNCE_MS = 500; // Increase from 300ms
const MAX_SEARCH_RESULTS = 25;  // Reduce from current

// Implement search result caching
const searchCache = new Map();
const SEARCH_CACHE_SIZE = 100;
```

### **3. Map Performance**
```typescript
// Limit visible markers under heavy load
const MAX_VISIBLE_MARKERS = 200;
const shouldShowMarker = (index: number) => index < MAX_VISIBLE_MARKERS;

// Cluster more aggressively
const clusterOptions = {
  maxZoom: 12, // Reduced from 14
  radius: 80   // Increased from 50
};
```

## 🔍 Monitoring & Alerting

### **Key Metrics to Track**
1. **Core Web Vitals**:
   - LCP (Largest Contentful Paint) < 2.5s
   - FID (First Input Delay) < 100ms  
   - CLS (Cumulative Layout Shift) < 0.1

2. **Custom Metrics**:
   ```typescript
   // Track search performance
   const searchStartTime = performance.now();
   await performSearch();
   const searchDuration = performance.now() - searchStartTime;
   
   // Send to analytics
   gtag('event', 'search_duration', {
     event_category: 'performance',
     value: Math.round(searchDuration)
   });
   ```

3. **Database Performance**:
   - Query response times
   - Connection pool usage
   - Database CPU/memory usage

### **Alert Thresholds**
- Page load time > 3 seconds
- Search response time > 1 second  
- Error rate > 1%
- Database response time > 500ms

## 🚨 Load Testing

### **Before Going Live**
1. **Load Test with Artillery**:
   ```bash
   npm install -g artillery
   artillery quick --count 100 --num 50 https://your-domain.com
   ```

2. **Database Load Test**:
   ```sql
   -- Simulate concurrent searches
   SELECT * FROM pha_agencies WHERE state = 'CA' AND name ILIKE '%housing%';
   ```

3. **Monitor During Test**:
   - Vercel Functions logs
   - Supabase Dashboard metrics
   - Browser DevTools Performance tab

## 📈 Scaling Strategy

### **Traffic Thresholds**
- **< 1,000 CCU**: Current setup should handle
- **1,000-5,000 CCU**: Implement all above optimizations
- **> 5,000 CCU**: Consider:
  - Upgrade Supabase to Pro plan
  - Implement Redis caching layer
  - Consider CDN for dynamic content

### **Cost Optimization**
- Monitor Vercel function execution time
- Track Supabase database usage
- Optimize Google Maps API calls (biggest cost risk)

## ⚡ Quick Wins (Implement Today)

1. **Add loading states everywhere**
2. **Implement image caching** (already done ✅)
3. **Add database indexes** (critical!)
4. **Enable Vercel Analytics**
5. **Set up error monitoring**
6. **Optimize search debouncing**
7. **Add performance budgets**

## 🎯 Success Metrics

- **Page Load Time**: < 2 seconds (95th percentile)
- **Search Response**: < 800ms (95th percentile) 
- **Map Render Time**: < 1 second
- **Error Rate**: < 0.5%
- **Conversion Rate**: Track search → detail view
- **User Engagement**: Time on site, pages per session 