-- Affordable Housing Heroes Style Landing Page Flow
-- Single page with hero form and content sections

-- Insert the flow
INSERT INTO public.flows (
  name,
  slug,
  description,
  status,
  style_config,
  google_ads_config
) VALUES (
  'Affordable Housing Application Guide',
  'housing-application-guide',
  'Landing page for Section 8 and housing assistance application guide',
  'draft', -- Change to 'active' when ready
  '{
    "primaryColor": "#00B8A9",
    "secondaryColor": "#00A99D",
    "backgroundColor": "#FFFFFF",
    "buttonStyle": "rounded",
    "layout": "full",
    "heroImageUrl": "https://example.com/aerial-housing-view.jpg",
    "logoUrl": "https://example.com/affordable-housing-heroes-logo.png"
  }'::jsonb,
  '{
    "conversionId": "AW-XXXXXXXXX",
    "conversionLabel": "guide_download",
    "remarketingTag": true,
    "enhancedConversions": true
  }'::jsonb
) RETURNING id;

-- Create the single-page flow
DO $$
DECLARE
  flow_id uuid := (SELECT id FROM flows WHERE slug = 'housing-application-guide' LIMIT 1);
  step_id uuid;
BEGIN
  -- Main landing page with all content sections
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
    'Apply Here For:',
    'Section 8 Vouchers Government Housing Rental Assistance and more',
    '<div class="hero-overlay">
      <p class="hero-tagline">Just Enter Your Zip To Download Your States Application Guide And to Receive Daily Waiting List Updates and Announcements*</p>
    </div>
    
    <!-- After form, show content sections -->
    <div class="content-sections" style="margin-top: -100px; position: relative; z-index: 10;">
      
      <!-- 3 Step Process -->
      <div class="steps-section" style="background: white; padding: 4rem 2rem; border-radius: 2rem 2rem 0 0;">
        <div class="steps-container" style="max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: repeat(3, 1fr); gap: 2rem;">
          
          <!-- Step 1 -->
          <div class="step-card" style="text-align: center; padding: 2rem;">
            <h3 style="font-size: 1.5rem; font-weight: bold; margin-bottom: 1rem;">Step1</h3>
            <div style="width: 80px; height: 80px; margin: 0 auto 1rem; background: #E8F5F5; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
              <svg style="width: 40px; height: 40px; color: #00B8A9;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
              </svg>
            </div>
            <p style="color: #4B5563;">Find safe and affordable housing that meets you and your families needs and budget.</p>
          </div>
          
          <!-- Step 2 (Highlighted) -->
          <div class="step-card highlighted" style="text-align: center; padding: 2rem; background: #00B8A9; color: white; border-radius: 1rem;">
            <h3 style="font-size: 1.5rem; font-weight: bold; margin-bottom: 1rem;">Step2</h3>
            <div style="width: 80px; height: 80px; margin: 0 auto 1rem; background: rgba(255,255,255,0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
              <svg style="width: 40px; height: 40px; color: white;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
              </svg>
            </div>
            <p>Once approved your landlord will receive monthly rent checks on your behalf covering most if not all of your rent requirements.</p>
          </div>
          
          <!-- Step 3 -->
          <div class="step-card" style="text-align: center; padding: 2rem;">
            <h3 style="font-size: 1.5rem; font-weight: bold; margin-bottom: 1rem;">Step3</h3>
            <div style="width: 80px; height: 80px; margin: 0 auto 1rem; background: #E8F5F5; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
              <svg style="width: 40px; height: 40px; color: #00B8A9;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path>
              </svg>
            </div>
            <p style="color: #4B5563;">Take the stress of rent out of your life. Once approved you will receive a housing choice voucher. This voucher guarantees living accommodations allowing you to focus on other areas of your life.</p>
          </div>
          
        </div>
      </div>
      
      <!-- What Do I Get Section -->
      <div class="benefits-section" style="background: #F9FAFB; padding: 4rem 2rem;">
        <div style="max-width: 1200px; margin: 0 auto;">
          <h2 style="font-size: 2.5rem; font-weight: bold; text-align: center; margin-bottom: 3rem;">What Do I Get When Signing Up?</h2>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; align-items: center;">
            <!-- House Image -->
            <div>
              <img src="https://example.com/modern-house.jpg" alt="Modern house" style="width: 100%; border-radius: 1rem; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
            </div>
            
            <!-- Benefits List -->
            <div class="benefits-list">
              <div style="space-y: 1rem;">
                <div style="display: flex; align-items: center; gap: 1rem; padding: 0.75rem 0;">
                  <svg style="width: 24px; height: 24px; color: #00B8A9; flex-shrink: 0;" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                  </svg>
                  <span style="font-size: 1.125rem;">Instructions For You local Housing Agency</span>
                </div>
                
                <div style="display: flex; align-items: center; gap: 1rem; padding: 0.75rem 0;">
                  <svg style="width: 24px; height: 24px; color: #00B8A9; flex-shrink: 0;" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                  </svg>
                  <span style="font-size: 1.125rem;">Nationwide Income Limits</span>
                </div>
                
                <div style="display: flex; align-items: center; gap: 1rem; padding: 0.75rem 0;">
                  <svg style="width: 24px; height: 24px; color: #00B8A9; flex-shrink: 0;" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                  </svg>
                  <span style="font-size: 1.125rem;">Eligibility Requirements</span>
                </div>
                
                <div style="display: flex; align-items: center; gap: 1rem; padding: 0.75rem 0;">
                  <svg style="width: 24px; height: 24px; color: #00B8A9; flex-shrink: 0;" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                  </svg>
                  <span style="font-size: 1.125rem;">Email Alerts</span>
                </div>
                
                <div style="display: flex; align-items: center; gap: 1rem; padding: 0.75rem 0;">
                  <svg style="width: 24px; height: 24px; color: #00B8A9; flex-shrink: 0;" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                  </svg>
                  <span style="font-size: 1.125rem;">Housing and Property Lists In Your Area</span>
                </div>
                
                <div style="display: flex; align-items: center; gap: 1rem; padding: 0.75rem 0;">
                  <svg style="width: 24px; height: 24px; color: #00B8A9; flex-shrink: 0;" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                  </svg>
                  <span style="font-size: 1.125rem;">Section 8 Waiting List Openings In Your Area</span>
                </div>
                
                <div style="display: flex; align-items: center; gap: 1rem; padding: 0.75rem 0;">
                  <svg style="width: 24px; height: 24px; color: #00B8A9; flex-shrink: 0;" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                  </svg>
                  <span style="font-size: 1.125rem;">Helpful Information On Credit, Income and Other Key</span>
                </div>
                
                <div style="display: flex; align-items: center; gap: 1rem; padding: 0.75rem 0;">
                  <svg style="width: 24px; height: 24px; color: #00B8A9; flex-shrink: 0;" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                  </svg>
                  <span style="font-size: 1.125rem;">Factors Affecting Approval Status</span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- CTA Button -->
          <div style="text-align: center; margin-top: 3rem;">
            <button type="button" onclick="document.querySelector(''form'').scrollIntoView({behavior: ''smooth''})" style="background: #00B8A9; color: white; padding: 1.25rem 3rem; font-size: 1.25rem; font-weight: bold; border-radius: 0.5rem; border: none; cursor: pointer; box-shadow: 0 4px 15px rgba(0, 184, 169, 0.3);">
              Download Application Guide
            </button>
            <div style="margin-top: 1rem;">
              <span style="display: inline-flex; align-items: center; gap: 0.5rem; color: #00B8A9; font-weight: 500;">
                <svg style="width: 20px; height: 20px;" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd"></path>
                </svg>
                100% Secure and SPAM Free
              </span>
            </div>
          </div>
          
        </div>
      </div>
      
    </div>',
    'Download Application Guide',
    true
  ) RETURNING id INTO step_id;

  -- Add form fields (2x2 grid layout)
  INSERT INTO public.flow_fields (step_id, field_order, field_type, field_name, label, placeholder, is_required) VALUES
    (step_id, 1, 'text', 'firstName', '', 'First Name', true),
    (step_id, 2, 'text', 'lastName', '', 'Last Name', true),
    (step_id, 3, 'email', 'email', '', 'Email Address', true),
    (step_id, 4, 'zip', 'zipCode', '', 'Zip Code', true);

  -- Thank you page with redirect to guide
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
    '🎉 Your Application Guide is Ready!',
    'Check your email for immediate access',
    '<div style="text-align: center; max-width: 600px; margin: 0 auto;">
      <div style="background: #E8F5F5; border-radius: 1rem; padding: 2rem; margin-bottom: 2rem;">
        <h3 style="color: #00B8A9; margin-bottom: 1rem;">What Happens Next?</h3>
        <ol style="text-align: left; color: #4B5563; padding-left: 1.5rem;">
          <li style="margin-bottom: 0.5rem;">Check your email for your personalized application guide</li>
          <li style="margin-bottom: 0.5rem;">Follow the step-by-step instructions for your state</li>
          <li style="margin-bottom: 0.5rem;">Watch for daily updates on new openings</li>
          <li>Contact us if you need additional assistance</li>
        </ol>
      </div>
      
      <p style="color: #6B7280;">
        <strong>Important:</strong> If you don''t see our email within 5 minutes, please check your spam folder.
      </p>
    </div>',
    '/guide/download', -- Redirect to guide download page
    5
  );

END $$;

-- Footer disclaimer text to add via custom CSS/HTML:
-- By clicking "Download Application Guide", I represent that I am 18+ years of age. I understand that this site is and is not 
-- endorsed or supported by any government agency, by signing up for the free housing guide I agree to the Privacy Policy,
-- California Privacy Policy and Terms and Conditions, and agree to receive email marketing from our informational website
-- affordablehousingheroes.com.