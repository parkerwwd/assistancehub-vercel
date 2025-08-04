# Single-Page Landing Flow Guide

## Overview
We can now build sophisticated single-page landing flows similar to Affordable Housing Heroes and other competitors. These flows combine a lead capture form with multiple content sections on a single page.

## Key Features

### 1. Hero Section with Background
- Full-width background images with overlay
- Centered form container with semi-transparent background
- Logo placement at top
- Professional gradient overlays

### 2. Form Layouts
- **2x2 Grid**: First Name, Last Name, Email, ZIP (like Affordable Housing Heroes)
- **Single Column**: Traditional stacked fields
- **Custom Layouts**: Any configuration you need

### 3. Content Sections
- **3-Step Process**: Visual step-by-step with one highlighted
- **Benefits Lists**: Checkmarks with feature descriptions
- **Image + Text**: Side-by-side layouts
- **Call-to-Action Blocks**: Secondary CTAs that scroll to form
- **Testimonials**: Customer quotes and reviews
- **FAQs**: Expandable question sections

## Available Templates

### 1. Affordable Housing Heroes Style (`housing-application-guide`)
```sql
-- Teal theme (#00B8A9)
-- Hero background with form
-- 3-step process
-- Benefits checklist
-- Professional design
```

### 2. Section 8 Search Tool (`section8-search-tool`)
```sql
-- Light blue theme (#60A5FA)
-- Bold borders and shadows
-- Simple 3-field form
-- Info box below
```

### 3. Generic Landing Template (`landing-page-template`)
```sql
-- Customizable theme
-- Flexible content sections
-- Easy to modify
```

## How to Create Your Own

### Step 1: Choose Your Structure
```sql
INSERT INTO public.flows (
  name,
  slug,
  description,
  status,
  style_config
) VALUES (
  'Your Landing Page',
  'your-landing-slug',
  'Description here',
  'draft',
  '{
    "primaryColor": "#00B8A9",      -- Main button/accent color
    "backgroundColor": "#FFFFFF",    -- Page background
    "heroImageUrl": "https://...",  -- Hero background image
    "layout": "full"                -- Use full width
  }'::jsonb
);
```

### Step 2: Build Your Content
Use HTML in the `content` field to add sections:

```html
<!-- Hero overlay text -->
<div class="hero-content">
  <p>Your hero message here</p>
</div>

<!-- 3-Column Features -->
<div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 2rem;">
  <div>Feature 1</div>
  <div>Feature 2</div>
  <div>Feature 3</div>
</div>

<!-- Benefits List -->
<div class="benefits-list">
  <div style="display: flex; align-items: center; gap: 1rem;">
    <svg><!-- checkmark icon --></svg>
    <span>Your benefit here</span>
  </div>
</div>
```

### Step 3: Configure Form Fields
```sql
-- 2x2 Grid Layout
INSERT INTO public.flow_fields (step_id, field_order, field_type, field_name, placeholder) VALUES
  (step_id, 1, 'text', 'firstName', 'First Name'),
  (step_id, 2, 'text', 'lastName', 'Last Name'),
  (step_id, 3, 'email', 'email', 'Email Address'),
  (step_id, 4, 'zip', 'zipCode', 'Zip Code');
```

### Step 4: Style Your Flow
Create custom CSS if needed:

```css
/* Target your specific flow */
.flow-renderer[data-slug="your-landing-slug"] {
  /* Custom styles */
}

/* Form container */
.flow-renderer[data-slug="your-landing-slug"] .max-w-md {
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
}
```

## Design Patterns

### Hero with Overlay
```css
position: relative;
background-image: url('your-image.jpg');
background-size: cover;
background-position: center;

&::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.6));
}
```

### Highlighted Section
```html
<div style="background: #00B8A9; color: white; padding: 2rem; border-radius: 1rem;">
  <!-- Your highlighted content -->
</div>
```

### Security Badge
```html
<span style="display: flex; align-items: center; gap: 0.5rem;">
  🔒 100% Secure and SPAM Free
</span>
```

## Best Practices

1. **Mobile First**: Always test on mobile devices
2. **Fast Loading**: Optimize images (use WebP, compress)
3. **Clear CTAs**: Make buttons stand out with contrasting colors
4. **Trust Signals**: Add security badges, testimonials
5. **Simple Forms**: Minimize fields for higher conversion
6. **Content Hierarchy**: Most important info above the fold

## Color Schemes

### Teal/Turquoise (Affordable Housing Heroes)
- Primary: `#00B8A9`
- Secondary: `#00A99D`
- Light: `#E8F5F5`

### Light Blue (Section 8 Search)
- Primary: `#60A5FA`
- Secondary: `#3B82F6`
- Light: `#DBEAFE`
- Dark: `#1E40AF`

### Custom Themes
You can use any colors - just update the `style_config` in your flow.

## Testing Your Flow

1. Set status to `draft` initially
2. Preview at `/flow/your-slug`
3. Test form submission
4. Check mobile responsiveness
5. Set to `active` when ready

## Examples in Production

- `/flow/housing-application-guide` - Affordable Housing Heroes style
- `/flow/section8-search-tool` - Bold form with info box
- `/flow/landing-page-template` - Generic template

## Need Help?

The landing flow system is flexible enough to recreate almost any competitor's design. If you need specific features:

1. Take a screenshot of what you want
2. Note the key elements (colors, layout, content)
3. We can build it!