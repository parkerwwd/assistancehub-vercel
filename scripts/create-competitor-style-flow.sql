-- Create a flow that matches the competitor's style with hero image
-- Run this in your Supabase SQL editor

-- Insert the flow with hero image configuration
INSERT INTO public.flows (
  name,
  slug,
  description,
  status,
  style_config,
  google_ads_config
) VALUES (
  'Section 8 Housing Search - All-in-One',
  'section8-housing-search',
  'Single-page lead capture form similar to competitor style',
  'active', -- Change to 'draft' if you want to preview first
  '{
    "primaryColor": "#FFD700",
    "secondaryColor": "#FFA500",
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

-- Get the flow ID and create the single form step
DO $$
DECLARE
  flow_id uuid := (SELECT id FROM flows WHERE slug = 'section8-housing-search' LIMIT 1);
  step_id uuid;
BEGIN
  -- Single form step with all fields
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
    1,
    'form',
    'Get Into Section 8 Housing Fast With Our Easy & FREE Tool',
    'Just Enter Your E-Mail To Search Listings And to Receive Daily Waiting List Updates and Announcements*',
    '<div style="margin-top: 2rem; padding: 1.5rem; background-color: #FFD700; border-radius: 0.5rem;">
      <p style="font-weight: 600; margin-bottom: 1rem;">Discover FREE Section 8 housing listings and information near you today!</p>
      <p>Whether you''re looking to join a public housing waiting list or explore affordable housing options, we''ve got you covered. Our comprehensive resources make it easy to find the best Section 8 opportunities in your area, helping you secure the housing you need without the hassle.</p>
      <p style="margin-top: 1rem; font-weight: 600;">Start your search now and take the first step toward finding your new home.</p>
    </div>',
    'START NOW →',
    true
  ) RETURNING id INTO step_id;

  -- Add Full Name field
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
    1,
    'text',
    'fullName',
    'Enter your Full Name',
    'Enter your Full Name',
    true
  );

  -- Add Email field
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
    'email',
    'email',
    'Enter your Email',
    'Enter your Email',
    true
  );

  -- Add ZIP Code field
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
    'zip',
    'zipCode',
    'Enter your Zip Code',
    'Enter your Zip Code',
    true
  );

  -- Optional: Add Phone Number field (if you want to require it)
  /*
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
    'Phone Number',
    '(555) 555-5555',
    true,
    'We''ll only call if we find urgent housing opportunities'
  );
  */

  -- Add a thank you step
  INSERT INTO public.flow_steps (
    flow_id,
    step_order,
    step_type,
    title,
    subtitle,
    content
  ) VALUES (
    flow_id,
    2,
    'thank_you',
    'Thank You! Your Housing Search Has Started',
    'Check your email for available Section 8 properties',
    '<div style="text-align: center;">
      <p style="font-size: 1.25rem; font-weight: 600; color: #059669; margin-bottom: 1rem;">✓ We found properties in your area!</p>
      <p>You''ll receive an email within the next few minutes with:</p>
      <ul style="text-align: left; max-width: 500px; margin: 1rem auto;">
        <li>• Available Section 8 properties near you</li>
        <li>• Local PHA contact information</li>
        <li>• Application tips and requirements</li>
        <li>• Waiting list status updates</li>
      </ul>
      <p style="margin-top: 2rem; color: #6B7280;">Can''t find the email? Check your spam folder or contact support@example.com</p>
    </div>'
  );

END $$;

-- To use this flow:
-- 1. Replace the heroImageUrl with your actual hero image URL
-- 2. Replace the logoUrl with your actual logo URL
-- 3. Update the Google Ads configuration with your actual IDs
-- 4. Access the flow at: /flow/section8-housing-search

-- Tips for hero images:
-- - Recommended size: 1200x600px
-- - Format: JPG or PNG
-- - Optimize for web (keep under 500KB)
-- - Use images that show happy families or housing
-- - Consider using free stock photos from Unsplash or Pexels