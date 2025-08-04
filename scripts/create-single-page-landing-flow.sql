-- Single Page Landing Flow Template
-- Flexible template for creating landing pages with content sections

-- Insert the flow
INSERT INTO public.flows (
  name,
  slug,
  description,
  status,
  style_config
) VALUES (
  'Single Page Landing Template',
  'landing-page-template',
  'Template for single-page landing with hero, form, and content sections',
  'draft',
  '{
    "primaryColor": "#00B8A9",
    "secondaryColor": "#00A99D",
    "backgroundColor": "#FFFFFF",
    "buttonStyle": "rounded",
    "layout": "full"
  }'::jsonb
) RETURNING id;

-- Create the flow
DO $$
DECLARE
  flow_id uuid := (SELECT id FROM flows WHERE slug = 'landing-page-template' LIMIT 1);
  step_id uuid;
BEGIN
  -- Single form step with content sections
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
    'Your Main Headline Here',
    'Your compelling subtitle that explains the value proposition',
    '<!-- Hero Section Content -->
    <div class="hero-content" style="text-align: center; margin-bottom: 2rem;">
      <p style="font-size: 1.125rem; color: #4B5563;">
        Additional hero text or call-to-action message goes here.
      </p>
    </div>
    
    <!-- Content Section 1: Features or Steps -->
    <div class="content-section" style="margin-top: 4rem; padding: 3rem 0;">
      <h2 style="text-align: center; font-size: 2rem; margin-bottom: 3rem;">How It Works</h2>
      
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 2rem; max-width: 1000px; margin: 0 auto;">
        <!-- Feature 1 -->
        <div style="text-align: center; padding: 1.5rem;">
          <div style="width: 60px; height: 60px; background: #E8F5F5; border-radius: 50%; margin: 0 auto 1rem; display: flex; align-items: center; justify-content: center;">
            <span style="font-size: 1.5rem;">1</span>
          </div>
          <h3 style="font-weight: 600; margin-bottom: 0.5rem;">Step One</h3>
          <p style="color: #6B7280;">Description of the first step or feature.</p>
        </div>
        
        <!-- Feature 2 -->
        <div style="text-align: center; padding: 1.5rem;">
          <div style="width: 60px; height: 60px; background: #00B8A9; color: white; border-radius: 50%; margin: 0 auto 1rem; display: flex; align-items: center; justify-content: center;">
            <span style="font-size: 1.5rem;">2</span>
          </div>
          <h3 style="font-weight: 600; margin-bottom: 0.5rem;">Step Two</h3>
          <p style="color: #6B7280;">Description of the second step or feature.</p>
        </div>
        
        <!-- Feature 3 -->
        <div style="text-align: center; padding: 1.5rem;">
          <div style="width: 60px; height: 60px; background: #E8F5F5; border-radius: 50%; margin: 0 auto 1rem; display: flex; align-items: center; justify-content: center;">
            <span style="font-size: 1.5rem;">3</span>
          </div>
          <h3 style="font-weight: 600; margin-bottom: 0.5rem;">Step Three</h3>
          <p style="color: #6B7280;">Description of the third step or feature.</p>
        </div>
      </div>
    </div>
    
    <!-- Content Section 2: Benefits -->
    <div class="content-section" style="background: #F9FAFB; margin: 4rem -2rem 0; padding: 3rem 2rem;">
      <h2 style="text-align: center; font-size: 2rem; margin-bottom: 2rem;">What You Get</h2>
      
      <div style="max-width: 600px; margin: 0 auto;">
        <!-- Benefit items -->
        <div style="margin-bottom: 1rem; display: flex; align-items: start; gap: 1rem;">
          <svg style="width: 20px; height: 20px; color: #00B8A9; flex-shrink: 0; margin-top: 2px;" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
          </svg>
          <span>Benefit or feature description here</span>
        </div>
        
        <div style="margin-bottom: 1rem; display: flex; align-items: start; gap: 1rem;">
          <svg style="width: 20px; height: 20px; color: #00B8A9; flex-shrink: 0; margin-top: 2px;" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
          </svg>
          <span>Another benefit or feature</span>
        </div>
        
        <div style="margin-bottom: 1rem; display: flex; align-items: start; gap: 1rem;">
          <svg style="width: 20px; height: 20px; color: #00B8A9; flex-shrink: 0; margin-top: 2px;" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
          </svg>
          <span>Additional value proposition</span>
        </div>
      </div>
    </div>',
    'Get Started Now',
    true
  ) RETURNING id INTO step_id;

  -- Add form fields
  INSERT INTO public.flow_fields (step_id, field_order, field_type, field_name, label, placeholder, is_required) VALUES
    (step_id, 1, 'text', 'fullName', 'Full Name', 'Enter your name', true),
    (step_id, 2, 'email', 'email', 'Email Address', 'your@email.com', true),
    (step_id, 3, 'zip', 'zipCode', 'ZIP Code', 'Enter ZIP', false);

  -- Thank you step
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
    'Thank You!',
    'Your submission has been received',
    '<div style="text-align: center;">
      <p>We''ll be in touch shortly with next steps.</p>
    </div>'
  );

END $$;

-- Usage Notes:
-- 1. This template creates a single-page landing with:
--    - Hero section with form
--    - Content sections below the form
--    - Customizable layout and styling
-- 
-- 2. To customize:
--    - Update title, subtitle, and content HTML
--    - Modify form fields as needed
--    - Add/remove content sections
--    - Change colors in style_config
--
-- 3. Content sections can include:
--    - Feature lists
--    - Step-by-step processes
--    - Benefits/value props
--    - Testimonials
--    - FAQs
--    - CTAs
--
-- 4. The form stays visible while users can scroll through content