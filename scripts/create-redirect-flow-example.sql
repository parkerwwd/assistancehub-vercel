-- Example flow that redirects to a guide page after completion
-- This demonstrates the new redirect functionality

-- Insert a flow that captures leads and redirects to a guide
INSERT INTO public.flows (
  name,
  slug,
  description,
  status,
  style_config,
  google_ads_config
) VALUES (
  'Free Section 8 Guide',
  'section8-guide-download',
  'Capture leads for Section 8 guide download with redirect',
  'draft', -- Set to 'active' when ready
  '{
    "primaryColor": "#60A5FA",
    "secondaryColor": "#3B82F6",
    "backgroundColor": "#FFFFFF",
    "buttonStyle": "rounded",
    "layout": "centered"
  }'::jsonb,
  '{
    "conversionId": "AW-XXXXXXXXX",
    "conversionLabel": "guide_download",
    "remarketingTag": false,
    "enhancedConversions": false
  }'::jsonb
) RETURNING id;

-- Create the flow steps
DO $$
DECLARE
  flow_id uuid := (SELECT id FROM flows WHERE slug = 'section8-guide-download' LIMIT 1);
  step_id uuid;
BEGIN
  -- Step 1: Capture basic info
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
    'Get Your FREE Section 8 Housing Guide',
    'Enter your information below to receive instant access',
    '<div style="background-color: #F0F9FF; border-radius: 0.5rem; padding: 1rem; margin-bottom: 1rem;">
      <h3 style="font-weight: 600; color: #1E40AF; margin-bottom: 0.5rem;">What''s Inside:</h3>
      <ul style="color: #3B82F6; padding-left: 1.5rem;">
        <li>Step-by-step application process</li>
        <li>Required documents checklist</li>
        <li>Tips to get approved faster</li>
        <li>Common mistakes to avoid</li>
        <li>State-specific resources</li>
      </ul>
    </div>',
    'Get My Free Guide →',
    true
  ) RETURNING id INTO step_id;

  -- Add Name field
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
    'Full Name',
    'Enter your full name',
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
    is_required,
    help_text
  ) VALUES (
    step_id,
    2,
    'email',
    'email',
    'Email Address',
    'your@email.com',
    true,
    'We''ll send your guide here'
  );

  -- Add ZIP field for personalization
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
    3,
    'zip',
    'zipCode',
    'ZIP Code',
    '12345',
    true,
    'For local resources in your area'
  );

  -- Step 2: Thank You with Redirect
  INSERT INTO public.flow_steps (
    flow_id,
    step_order,
    step_type,
    title,
    subtitle,
    content,
    redirect_url,
    redirect_delay
  ) VALUES (
    flow_id,
    2,
    'thank_you',
    '🎉 Success! Your Guide is Ready',
    'You''re being redirected to your free guide...',
    '<div style="text-align: center; margin: 2rem 0;">
      <div style="background-color: #DBEAFE; border-radius: 50%; width: 80px; height: 80px; margin: 0 auto 1.5rem; display: flex; align-items: center; justify-content: center;">
        <svg style="width: 40px; height: 40px; color: #3B82F6;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      </div>
      
      <p style="color: #6B7280; margin-bottom: 1rem;">
        We''ve also sent a copy to your email for future reference.
      </p>
      
      <div style="background-color: #FEF3C7; border: 1px solid #FCD34D; border-radius: 0.5rem; padding: 1rem; max-width: 400px; margin: 0 auto;">
        <p style="color: #92400E; font-weight: 600; margin: 0;">
          💡 Pro Tip: Check your email for bonus resources we''ve included!
        </p>
      </div>
    </div>',
    '/section8', -- This is where they'll be redirected
    5 -- Wait 5 seconds before redirecting
  );

END $$;

-- Alternative redirect examples:
-- 
-- 1. External URL redirect:
--    redirect_url: 'https://example.com/section8-guide.pdf'
--
-- 2. Internal page with query params:
--    redirect_url: '/section8?guide=downloaded&source=lead-flow'
--
-- 3. Different delay:
--    redirect_delay: 3  -- Redirect after 3 seconds
--
-- 4. Immediate redirect (not recommended):
--    redirect_delay: 0  -- Redirect immediately

-- To test this flow:
-- 1. Run this SQL in Supabase
-- 2. Change status to 'active' when ready
-- 3. Access at: /flow/section8-guide-download