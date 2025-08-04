-- Create a beautiful light blue themed lead flow
-- Run this in your Supabase SQL editor

-- Insert the flow with light blue color scheme
INSERT INTO public.flows (
  name,
  slug,
  description,
  status,
  style_config,
  google_ads_config
) VALUES (
  'Section 8 Housing - Light Blue',
  'housing-search-blue',
  'Clean, modern lead capture with light blue theme',
  'active', -- Change to 'draft' if you want to preview first
  '{
    "primaryColor": "#60A5FA",
    "secondaryColor": "#3B82F6",
    "backgroundColor": "#FFFFFF",
    "buttonStyle": "rounded",
    "layout": "centered",
    "heroImageUrl": "https://example.com/your-hero-image.jpg",
    "logoUrl": "https://example.com/your-logo.png"
  }'::jsonb,
  '{
    "conversionId": "AW-XXXXXXXXX",
    "conversionLabel": "housing_lead",
    "remarketingTag": false,
    "enhancedConversions": false
  }'::jsonb
) RETURNING id;

-- Get the flow ID and create the steps
DO $$
DECLARE
  flow_id uuid := (SELECT id FROM flows WHERE slug = 'housing-search-blue' LIMIT 1);
  step_id uuid;
BEGIN
  -- Step 1: Simple ZIP code entry with beautiful styling
  INSERT INTO public.flow_steps (
    flow_id,
    step_order,
    step_type,
    title,
    subtitle,
    button_text,
    is_required
  ) VALUES (
    flow_id,
    1,
    'form',
    'Find Section 8 Housing Near You',
    'Enter your ZIP code to discover available properties',
    'Search Properties →',
    true
  ) RETURNING id INTO step_id;

  -- Add ZIP field
  INSERT INTO public.flow_fields (
    step_id,
    field_order,
    field_type,
    field_name,
    label,
    placeholder,
    is_required,
    validation_rules
  ) VALUES (
    step_id,
    1,
    'zip',
    'zipCode',
    'ZIP Code',
    'Enter your ZIP code',
    true,
    '{"pattern": "^\\d{5}$", "message": "Please enter a valid 5-digit ZIP code"}'::jsonb
  );

  -- Step 2: Contact Information
  INSERT INTO public.flow_steps (
    flow_id,
    step_order,
    step_type,
    title,
    subtitle,
    content,
    button_text,
    is_required
  ) VALUES (
    flow_id,
    2,
    'form',
    'Get Your Free Housing List',
    'We''ll send you available properties and waiting list updates',
    '<div style="margin-top: 2rem; padding: 1.5rem; background-color: #EFF6FF; border-radius: 0.75rem; border: 1px solid #DBEAFE;">
      <p style="font-weight: 600; color: #1E40AF; margin-bottom: 0.5rem;">✨ What You''ll Receive:</p>
      <ul style="color: #3B82F6; margin: 0.5rem 0; padding-left: 1.5rem;">
        <li>Available Section 8 properties in your area</li>
        <li>PHA contact information</li>
        <li>Waiting list status updates</li>
        <li>Application tips and guides</li>
      </ul>
    </div>',
    'Get My Housing List →',
    true
  ) RETURNING id INTO step_id;

  -- Add Email field
  INSERT INTO public.flow_fields (
    step_id,
    field_order,
    field_type,
    field_name,
    label,
    placeholder,
    is_required,
    help_text
  ) VALUES (
    step_id,
    1,
    'email',
    'email',
    'Email Address',
    'your@email.com',
    true,
    'We''ll send your housing list here'
  );

  -- Add Name fields
  INSERT INTO public.flow_fields (
    step_id,
    field_order,
    field_type,
    field_name,
    label,
    placeholder,
    is_required
  ) VALUES (
    step_id,
    2,
    'text',
    'firstName',
    'First Name',
    'John',
    true
  );

  INSERT INTO public.flow_fields (
    step_id,
    field_order,
    field_type,
    field_name,
    label,
    placeholder,
    is_required
  ) VALUES (
    step_id,
    3,
    'text',
    'lastName',
    'Last Name',
    'Doe',
    false
  );

  -- Add Phone field (optional)
  INSERT INTO public.flow_fields (
    step_id,
    field_order,
    field_type,
    field_name,
    label,
    placeholder,
    is_required,
    help_text
  ) VALUES (
    step_id,
    4,
    'phone',
    'phone',
    'Phone Number (Optional)',
    '(555) 555-5555',
    false,
    'For urgent housing opportunities only'
  );

  -- Step 3: Thank You
  INSERT INTO public.flow_steps (
    flow_id,
    step_order,
    step_type,
    title,
    subtitle,
    content
  ) VALUES (
    flow_id,
    3,
    'thank_you',
    '🎉 Success! Check Your Email',
    'Your personalized housing list is on its way',
    '<div style="max-width: 600px; margin: 0 auto;">
      <div style="background-color: #DBEAFE; border-radius: 50%; width: 80px; height: 80px; margin: 2rem auto; display: flex; align-items: center; justify-content: center;">
        <svg style="width: 40px; height: 40px; color: #3B82F6;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
      </div>
      
      <div style="background-color: #F0F9FF; border-radius: 0.75rem; padding: 1.5rem; margin-top: 2rem;">
        <h3 style="color: #1E40AF; font-weight: 600; margin-bottom: 1rem;">What Happens Next?</h3>
        <ol style="color: #3B82F6; padding-left: 1.5rem;">
          <li style="margin-bottom: 0.5rem;">Check your email inbox in the next 5 minutes</li>
          <li style="margin-bottom: 0.5rem;">Review available properties in your area</li>
          <li style="margin-bottom: 0.5rem;">Contact PHAs using our provided information</li>
          <li>Watch for weekly updates on new listings</li>
        </ol>
      </div>
      
      <p style="text-align: center; color: #6B7280; margin-top: 2rem; font-size: 0.875rem;">
        Can''t find our email? Check your spam folder or contact support@assistancehub.com
      </p>
    </div>'
  );

END $$;

-- Light Blue Color Scheme:
-- Primary: #60A5FA (Blue 400) - Main buttons and CTAs
-- Secondary: #3B82F6 (Blue 500) - Links and accents
-- Light Background: #EFF6FF (Blue 50) - Content boxes
-- Very Light: #F0F9FF (Blue 50 lighter) - Subtle backgrounds
-- Border: #DBEAFE (Blue 100) - Borders and dividers
-- Dark Text: #1E40AF (Blue 800) - Headers and important text
-- Medium Text: #3B82F6 (Blue 500) - Body text in colored areas

-- To use this flow:
-- 1. Run this SQL in your Supabase SQL editor
-- 2. Update heroImageUrl and logoUrl with your actual images
-- 3. Update Google Ads configuration
-- 4. Access at: /flow/housing-search-blue