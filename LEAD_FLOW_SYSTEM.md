# Lead Flow System Documentation

## Overview

The Lead Flow System is a comprehensive solution for creating dynamic lead capture forms, managing leads, and integrating with Google Ads campaigns. It provides a no-code interface for building multi-step forms with advanced features like conditional logic, A/B testing, and analytics.

## Key Features

### 1. Dynamic Flow Builder
- **Visual Editor**: Create and edit flows without coding
- **Multiple Step Types**: Forms, quizzes, content blocks, thank you pages
- **Field Types**: Text, email, phone, select, radio, checkbox, date, ZIP code
- **Drag & Drop**: Reorder steps and fields easily
- **Live Preview**: Test flows before publishing

### 2. Advanced Form Features
- **Progressive Disclosure**: Only ask for essential information at each step
- **Conditional Logic**: Show/hide fields based on user responses
- **Interactive Elements**: Location picker with popular areas
- **Validation**: Built-in and custom validation rules
- **Mobile Responsive**: Optimized for all devices

### 3. Lead Management
- **Dashboard**: View all captured leads in one place
- **Filtering**: Search by name, email, flow, status
- **Export**: Download leads as CSV
- **Status Tracking**: Mark leads as new, qualified, contacted, converted
- **Lead Details**: View complete submission data and timeline

### 4. Google Ads Integration
- **UTM Tracking**: Automatic capture of campaign parameters
- **Conversion Tracking**: Fire conversion events on completion
- **GCLID Storage**: Store Google Click ID for attribution
- **Remarketing**: Support for remarketing tags

### 5. Analytics & Reporting
- **Conversion Rates**: Track form completion rates
- **Drop-off Analysis**: See where users abandon forms
- **Source Attribution**: Track leads by traffic source
- **A/B Testing**: Compare flow variants

## URLs and Routes

### Public Routes
- **Lead Capture Page**: `/flow/:slug`
  - Example: `/flow/quick-housing-search`
  - This is where your Google Ads traffic lands

### Admin Routes (Authentication Required)
- **Flow Management**: `/admin/flows`
  - View all flows
  - Create new flows
  - Edit/duplicate/delete flows
  
- **Flow Editor**: `/admin/flows/:id/edit`
  - Visual flow builder
  - Step and field configuration
  - Style and tracking settings

- **Lead Management**: `/admin/leads`
  - View all captured leads
  - Filter and search leads
  - Export to CSV
  - Update lead status

- **Data Import**: `/data-admin`
  - Original PHA/property import tools
  - Connected via navigation tabs

## Setting Up Your First Flow

### 1. Access the Admin Panel
```
https://yourdomain.com/admin/flows
```

### 2. Create a New Flow
1. Click "Create New Flow"
2. Enter basic information:
   - **Name**: Internal name for the flow
   - **Slug**: URL-friendly identifier (e.g., `housing-search`)
   - **Description**: Brief description for reference

### 3. Add Steps
Choose from step types:
- **Form Step**: Collect user information
- **Quiz Step**: Interactive selection with icons
- **Content Step**: Display information or instructions
- **Thank You Step**: Confirmation with next steps

### 4. Configure Fields
For form steps, add fields:
- Set field type (text, email, phone, etc.)
- Add labels and placeholders
- Configure validation rules
- Mark as required if needed

### 5. Style Your Flow
- Set primary color to match your brand
- Choose button styles
- Add logo and background images
- Configure layout options

### 6. Set Up Tracking
- Add Google Ads Conversion ID
- Configure conversion labels
- Enable remarketing if needed

### 7. Publish and Test
- Set status to "Active"
- Save the flow
- Preview at `/flow/your-slug`
- Submit test data

## Google Ads Campaign Setup

### 1. Landing Page URL
Use this format for your ads:
```
https://yourdomain.com/flow/your-flow-slug?utm_source=google&utm_medium=cpc&utm_campaign=campaign_name&gclid={gclid}
```

### 2. URL Parameters
The system automatically captures:
- `utm_source`: Traffic source
- `utm_medium`: Marketing medium
- `utm_campaign`: Campaign name
- `utm_term`: Keywords (optional)
- `utm_content`: Ad variation (optional)
- `gclid`: Google Click ID

### 3. Conversion Tracking
Add your Google Ads conversion tracking:
1. Go to Flow Settings → Tracking
2. Enter your Conversion ID (format: AW-XXXXXXXXX)
3. Enter your Conversion Label
4. The system will fire conversions on form completion

## Best Practices

### 1. Form Design
- **Keep it short**: 3-5 steps maximum
- **Start easy**: Begin with ZIP code or simple selection
- **Show value**: Display what users will get before asking for contact info
- **Use progress bars**: Show users how far they've come

### 2. Lead Quality
- **Progressive profiling**: Collect basic info first, details later
- **Validate inputs**: Use proper validation for emails and phones
- **Set expectations**: Clear messaging about next steps

### 3. Conversion Optimization
- **A/B test**: Create flow variants to test different approaches
- **Mobile-first**: Design for mobile users
- **Fast loading**: Optimize images and content
- **Trust signals**: Add security badges and privacy notices

### 4. Lead Follow-up
- **Quick response**: Contact leads within 24 hours
- **Status tracking**: Update lead status as you work them
- **Export regularly**: Download leads for CRM import

## Technical Details

### Database Schema
- **flows**: Main flow configuration
- **flow_steps**: Individual steps within flows
- **flow_fields**: Form fields within steps
- **leads**: Captured lead information
- **lead_responses**: Individual field responses
- **flow_analytics**: Daily analytics data

### Data Privacy
- Row Level Security (RLS) enabled
- Public can submit leads
- Only authenticated users can view lead data
- Secure storage of personal information

### Performance
- Optimized indexes for fast queries
- Efficient data structure
- Minimal client-side processing
- CDN-ready assets

## Troubleshooting

### Flow Not Loading
1. Check flow status is "Active"
2. Verify slug is correct in URL
3. Check browser console for errors

### Leads Not Capturing
1. Verify all required fields are filled
2. Check network tab for API errors
3. Ensure Supabase RLS policies are correct

### Tracking Not Working
1. Verify Google Ads IDs are correct
2. Check if ad blockers are interfering
3. Test in incognito mode

## Support

For additional help:
1. Check the error logs in browser console
2. Review Supabase logs for API errors
3. Verify environment variables are set correctly

## Future Enhancements

Planned features:
- Email automation integration
- Webhook support for CRM integration
- Advanced A/B testing UI
- Custom CSS editor
- Multi-language support
- CAPTCHA integration
- Save and resume functionality