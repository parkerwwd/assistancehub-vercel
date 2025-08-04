# Lead Flow Redirect Functionality

## Overview
The lead flow system now supports automatic redirects after form completion. This allows you to send users to guide pages, external resources, or other parts of your site after they submit their information.

## How It Works

### 1. Database Schema
Two new fields were added to the `flow_steps` table:
- `redirect_url` (text) - The URL to redirect to
- `redirect_delay` (integer) - Seconds to wait before redirecting (default: 3)

### 2. Migration
Run this migration in Supabase to add redirect functionality:
```sql
-- Location: supabase/migrations/20250117000000_add_redirect_to_flow_steps.sql
```

### 3. Setting Up Redirects

#### In the Flow Editor UI:
1. Create or edit a flow
2. Add a "Thank You" step at the end
3. In the step editor, find "Redirect Configuration"
4. Enter your redirect URL and delay

#### Via SQL:
```sql
INSERT INTO public.flow_steps (
  flow_id,
  step_order,
  step_type,
  title,
  subtitle,
  redirect_url,      -- Add your redirect URL here
  redirect_delay     -- Seconds to wait (optional, default 3)
) VALUES (
  'your-flow-id',
  2,
  'thank_you',
  'Success!',
  'Redirecting to your guide...',
  '/section8',       -- Internal route example
  5                  -- Wait 5 seconds
);
```

## Redirect Examples

### 1. Internal Page Redirect
```sql
redirect_url: '/section8'
-- Redirects to your Section 8 search page
```

### 2. External URL Redirect
```sql
redirect_url: 'https://example.com/guide.pdf'
-- Redirects to an external guide or resource
```

### 3. Internal Route with Query Parameters
```sql
redirect_url: '/section8?source=guide&utm_campaign=lead-flow'
-- Useful for tracking where users came from
```

### 4. Relative Path
```sql
redirect_url: 'about'
-- Will redirect to /about
```

## User Experience

When a redirect is configured:
1. User completes the form
2. Thank you page displays with confetti animation
3. Countdown message appears: "Redirecting to your free guide in X seconds..."
4. After the delay, user is automatically redirected
5. Standard action buttons still appear (they can click before redirect)

## Best Practices

1. **Delay Timing**:
   - 3-5 seconds: Recommended for most cases
   - 0-2 seconds: Only if users expect immediate redirect
   - 6+ seconds: When you want users to read important info first

2. **URL Types**:
   - Use internal routes (`/path`) for site navigation
   - Use full URLs (`https://...`) for external resources
   - Always test your redirect URLs

3. **Messaging**:
   - Clear title: "Your Guide is Ready!"
   - Informative subtitle: "Redirecting to your free guide..."
   - Use content area for additional instructions

## Example Flows

### Guide Download Flow
```sql
-- See: scripts/create-redirect-flow-example.sql
-- Captures lead info then redirects to guide
```

### Multi-Step with Redirect
```sql
-- Step 1: Capture email
-- Step 2: Preferences  
-- Step 3: Thank you → Redirect to personalized content
```

### A/B Testing Redirects
Create two flows with different redirect destinations to test conversion:
- Flow A → Redirects to `/section8`
- Flow B → Redirects to `/guide/section8-tips`

## Troubleshooting

**Redirect not working?**
- Check redirect_url is properly set in database
- Verify the URL is valid (test it directly)
- Ensure step_type is 'thank_you'

**Too fast/slow?**
- Adjust redirect_delay (0-30 seconds)
- Consider user reading speed

**Need to disable?**
- Set redirect_url to NULL or empty string
- Flow will show default action buttons only