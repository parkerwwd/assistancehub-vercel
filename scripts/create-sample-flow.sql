-- Create a sample lead flow for immediate testing
-- Run this in your Supabase SQL editor after creating the tables

-- Insert a sample flow
INSERT INTO public.flows (
  name,
  slug,
  description,
  status,
  style_config,
  google_ads_config
) VALUES (
  'Quick Housing Search',
  'quick-housing-search',
  'A simple 3-step flow to capture leads looking for Section 8 housing',
  'active',
  '{
    "primaryColor": "#3B82F6",
    "backgroundColor": "#F8FAFC",
    "buttonStyle": "rounded",
    "layout": "centered"
  }'::jsonb,
  '{
    "conversionId": "AW-XXXXXXXXX",
    "conversionLabel": "housing_lead",
    "remarketingTag": false,
    "enhancedConversions": false
  }'::jsonb
) RETURNING id;

-- Get the flow ID (you'll see it in the output)
-- Then use it in the following queries

-- Replace 'YOUR_FLOW_ID' with the actual ID from above
DO $$
DECLARE
  flow_id uuid := (SELECT id FROM flows WHERE slug = 'quick-housing-search' LIMIT 1);
  step1_id uuid;
  step2_id uuid;
  step3_id uuid;
  step4_id uuid;
BEGIN
  -- Step 1: Location
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
    'Let''s Find Housing Near You',
    'Enter your ZIP code to see available Section 8 properties',
    'Search Properties',
    true
  ) RETURNING id INTO step1_id;

  -- Add ZIP field to step 1
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
    step1_id,
    1,
    'zip',
    'zipCode',
    'ZIP Code',
    '12345',
    true,
    '{"pattern": "^\\d{5}$", "message": "Please enter a valid 5-digit ZIP code"}'::jsonb
  );

  -- Step 2: Housing Type Quiz
  INSERT INTO public.flow_steps (
    flow_id,
    step_order,
    step_type,
    title,
    subtitle,
    is_required
  ) VALUES (
    flow_id,
    2,
    'quiz',
    'What type of housing are you looking for?',
    'This helps us show you the most relevant options',
    false
  ) RETURNING id INTO step2_id;

  -- Add quiz field to step 2
  INSERT INTO public.flow_fields (
    step_id,
    field_order,
    field_type,
    field_name,
    label,
    options
  ) VALUES (
    step2_id,
    1,
    'radio',
    'housingType',
    'Housing Type',
    '[
      {"label": "Studio / 1 Bedroom", "value": "small", "icon": "home"},
      {"label": "2-3 Bedrooms", "value": "medium", "icon": "users"},
      {"label": "4+ Bedrooms", "value": "large", "icon": "heart"},
      {"label": "Senior Housing", "value": "senior", "icon": "clock"}
    ]'::jsonb
  );

  -- Step 3: Contact Info
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
    3,
    'form',
    'Get Your Free Housing List',
    'We''ll send you available properties and keep you updated',
    'Get My List',
    true
  ) RETURNING id INTO step3_id;

  -- Add email field
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
    step3_id,
    1,
    'email',
    'email',
    'Email Address',
    'your@email.com',
    true,
    'We''ll send your housing list here'
  );

  -- Add first name field
  INSERT INTO public.flow_fields (
    step_id,
    field_order,
    field_type,
    field_name,
    label,
    placeholder,
    is_required
  ) VALUES (
    step3_id,
    2,
    'text',
    'firstName',
    'First Name',
    'John',
    false
  );

  -- Step 4: Thank You
  INSERT INTO public.flow_steps (
    flow_id,
    step_order,
    step_type,
    title,
    subtitle,
    content
  ) VALUES (
    flow_id,
    4,
    'thank_you',
    'Your Housing List is Ready!',
    'Check your email for available Section 8 properties in your area',
    '<p>We found <strong>15+ properties</strong> near your location!</p><p>A housing specialist will also reach out within 24 hours to help you with your application.</p>'
  );

END $$;

-- Create a second flow for emergency housing
INSERT INTO public.flows (
  name,
  slug,
  description,
  status,
  style_config
) VALUES (
  'Emergency Housing Assistance',
  'emergency-housing',
  'Fast-track flow for people needing immediate housing help',
  'active',
  '{
    "primaryColor": "#DC2626",
    "backgroundColor": "#FEF2F2",
    "buttonStyle": "rounded",
    "layout": "centered"
  }'::jsonb
);

-- You can view your flows at:
-- /admin/flows (admin panel)
-- /flow/quick-housing-search (public flow)
-- /flow/emergency-housing (public flow)