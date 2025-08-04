-- Section 8 Search Lead Flow - Light Blue Theme
-- Based on the provided screenshot layout

-- Insert the flow
INSERT INTO public.flows (
  name,
  slug,
  description,
  status,
  style_config,
  google_ads_config
) VALUES (
  'Section 8 Search - Easy & FREE Tool',
  'section8-search-tool',
  'Lead capture for Section 8 housing search with daily waiting list updates',
  'active', -- Set to 'draft' if you want to test first
  '{
    "primaryColor": "#60A5FA",
    "secondaryColor": "#3B82F6",
    "backgroundColor": "#FFFFFF",
    "buttonStyle": "rounded",
    "layout": "centered",
    "logoUrl": "/logo.png",
    "heroImageUrl": "https://example.com/family-housing-image.jpg"
  }'::jsonb,
  '{
    "conversionId": "AW-XXXXXXXXX",
    "conversionLabel": "section8_lead",
    "remarketingTag": true,
    "enhancedConversions": true
  }'::jsonb
) RETURNING id;

-- Create the single form step
DO $$
DECLARE
  flow_id uuid := (SELECT id FROM flows WHERE slug = 'section8-search-tool' LIMIT 1);
  step_id uuid;
BEGIN
  -- Main form step with all fields
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
    '<div style="text-align: center; margin-bottom: 2rem;">
      <img src="https://example.com/family-housing-image.jpg" alt="Family receiving housing assistance" style="max-width: 500px; width: 100%; height: auto; border-radius: 0.5rem; margin: 0 auto 1.5rem;">
      
      <h3 style="font-size: 1.25rem; font-weight: 600; margin-bottom: 2rem;">
        Enter Your Name, E-Mail, and Zip Code Below For Instant Access!
      </h3>
      
      <div style="border-top: 2px dashed #000; margin: 2rem 0;"></div>
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
    'Full Name',
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
    'Email',
    'Enter your Email',
    true
  );

  -- Add Zip Code field
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
    'Zip Code',
    'Enter your Zip Code',
    true
  );

  -- Thank You step with redirect
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
    '🎉 Welcome to Section 8 Search!',
    'Your free housing list is being prepared...',
    '<div style="background-color: #DBEAFE; border-radius: 0.75rem; padding: 2rem; margin: 2rem auto; max-width: 700px;">
      <h3 style="color: #1E40AF; font-weight: 600; margin-bottom: 1rem; text-align: center;">
        Discover FREE Section 8 housing listings and information near you today!
      </h3>
      
      <p style="color: #1E40AF; text-align: center; margin-bottom: 1rem;">
        Whether you''re looking to join a public housing waiting list or explore affordable housing options, 
        we''ve got you covered. Our comprehensive resources make it easy to find the best Section 8 
        opportunities in your area, helping you secure the housing you need without the hassle.
      </p>
      
      <p style="color: #1E40AF; font-weight: 600; text-align: center;">
        Start your search now and take the first step toward finding your new home.
      </p>
    </div>
    
    <div style="text-align: center; margin-top: 2rem;">
      <p style="color: #6B7280;">✉️ Check your email for your personalized housing list</p>
      <p style="color: #6B7280;">📱 Save our number: 1-800-SECTION8 for housing support</p>
    </div>',
    '/section8', -- Redirects to main search page after 5 seconds
    5
  );

END $$;

-- CSS override to match the exact style (add to your custom CSS file)
-- This makes the form fields look exactly like the screenshot
/*
.lead-flow-container {
  max-width: 600px;
  margin: 0 auto;
}

.lead-flow-container input {
  width: 100%;
  padding: 1rem;
  font-size: 1.125rem;
  border: 3px solid #000;
  border-radius: 0.5rem;
  background-color: #FFFFFF;
  box-shadow: 4px 4px 0 #000;
  transition: all 0.2s;
}

.lead-flow-container input:focus {
  outline: none;
  border-color: #60A5FA;
  box-shadow: 4px 4px 0 #3B82F6;
}

.lead-flow-container button[type="submit"] {
  width: 100%;
  padding: 1.25rem;
  font-size: 1.25rem;
  font-weight: bold;
  background-color: #60A5FA;
  color: #000;
  border: 3px solid #000;
  border-radius: 0.5rem;
  box-shadow: 4px 4px 0 #000;
  transition: all 0.2s;
  cursor: pointer;
}

.lead-flow-container button[type="submit"]:hover {
  transform: translate(2px, 2px);
  box-shadow: 2px 2px 0 #000;
}

-- Light blue info box
.info-box {
  background-color: #DBEAFE;
  border: 2px solid #3B82F6;
  border-radius: 0.75rem;
  padding: 1.5rem;
  margin-top: 2rem;
  color: #1E40AF;
}
*/

-- Notes:
-- 1. Replace "https://example.com/family-housing-image.jpg" with your actual image URL
-- 2. Update Google Ads configuration with your actual conversion ID
-- 3. The flow redirects to /section8 after form completion
-- 4. All fields are required (name, email, zip)
-- 5. Light blue theme: #60A5FA (primary), #3B82F6 (secondary), #DBEAFE (light background)