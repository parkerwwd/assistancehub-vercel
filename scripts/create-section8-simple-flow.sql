-- Simplified Section 8 Search Flow - Single Page Form
-- Light Blue Theme to match your branding

-- Insert the flow
INSERT INTO public.flows (
  name,
  slug,
  description,
  status,
  style_config
) VALUES (
  'Section 8 Housing Search',
  'section8-housing-search',
  'Simple lead capture for Section 8 housing assistance',
  'active',
  '{
    "primaryColor": "#60A5FA",
    "secondaryColor": "#3B82F6",
    "backgroundColor": "#FFFFFF",
    "buttonStyle": "rounded",
    "layout": "centered"
  }'::jsonb
) RETURNING id;

-- Create single-page form
DO $$
DECLARE
  flow_id uuid := (SELECT id FROM flows WHERE slug = 'section8-housing-search' LIMIT 1);
  step_id uuid;
BEGIN
  -- Single form step
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
    '<div style="margin-bottom: 2rem;">
      <p style="text-align: center; font-weight: 600; font-size: 1.25rem; margin: 2rem 0;">
        Enter Your Name, E-Mail, and Zip Code Below For Instant Access!
      </p>
    </div>
    
    <div style="background-color: #DBEAFE; border-radius: 0.75rem; padding: 1.5rem; margin-top: 3rem;">
      <p style="font-weight: 600; color: #1E40AF; text-align: center;">
        Discover FREE Section 8 housing listings and information near you today! Whether you''re 
        looking to join a public housing waiting list or explore affordable housing options, we''ve 
        got you covered. Our comprehensive resources make it easy to find the best Section 8 
        opportunities in your area, helping you secure the housing you need without the hassle. 
        Start your search now and take the first step toward finding your new home.
      </p>
    </div>',
    'START NOW →',
    true
  ) RETURNING id INTO step_id;

  -- Add form fields
  INSERT INTO public.flow_fields (step_id, field_order, field_type, field_name, label, placeholder, is_required) VALUES
    (step_id, 1, 'text', 'fullName', '', 'Enter your Full Name', true),
    (step_id, 2, 'email', 'email', '', 'Enter your Email', true),
    (step_id, 3, 'zip', 'zipCode', '', 'Enter your Zip Code', true);

  -- Simple thank you page
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
    'Check your email for your free housing list',
    '<div style="text-align: center;">
      <p>We''ve sent you a personalized list of Section 8 housing opportunities in your area.</p>
      <p style="margin-top: 1rem;">You''ll also receive daily updates on new listings and waiting list openings.</p>
    </div>'
  );

END $$;