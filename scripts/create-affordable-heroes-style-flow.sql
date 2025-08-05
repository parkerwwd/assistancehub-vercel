-- Insert an Affordable Heroes style landing page flow
-- This creates a single-page flow similar to the competitor's design

DO $$
DECLARE
    flow_id UUID;
    step_id UUID;
BEGIN
    -- Create the flow
    INSERT INTO flows (
        name,
        slug,
        description,
        status,
        style_config,
        settings,
        google_ads_config
    ) VALUES (
        'Section 8 Housing Application Guide',
        'section8-housing-guide',
        'Get Your Free Section 8 Housing Application Guide',
        'active',
        jsonb_build_object(
            'primaryColor', '#1E40AF',
            'backgroundColor', '#F8FAFC',
            'fontFamily', 'Inter, Arial, sans-serif',
            'buttonStyle', 'rounded',
            'layout', 'heroSplit'
        ),
        jsonb_build_object(
            'redirectUrl', '/section8',
            'saveProgress', false
        ),
        jsonb_build_object(
            'conversionId', 'AW-XXXXXXXXX',
            'conversionLabel', 'housing_guide_download',
            'remarketingTag', true
        )
    ) RETURNING id INTO flow_id;

    -- Create single page landing step
    INSERT INTO flow_steps (
        flow_id,
        step_order,
        step_type,
        title,
        subtitle,
        content,
        button_text,
        settings
    ) VALUES (
        flow_id,
        1,
        'single_page_landing',
        'APPLY HERE FOR:',
        'Just Enter Your Zip To Download Your States Application Guide<br/>And to Receive Daily Waiting List Updates and<br/>Announcements*',
        '<p class="text-xs text-gray-500 text-center">By clicking "Download Application Guide", I represent that I am 18+ years of age, I understand that this site is not a not endorsed or supported by any government agency, by signing up for the free housing guide I agree to the <a href="/privacy" class="underline">Privacy Policy</a>, <a href="/terms" class="underline">California Privacy Policy</a> and <a href="/terms" class="underline">Terms and Conditions</a>, and agree to receive email marketing from our informational websites affordablehousingheroes.com.</p>',
        'Download Application Guide',
        jsonb_build_object(
            'heroImage', '/lovable-uploads/hero-family-image.jpg',
            'logo', '/lovable-uploads/affordable-heroes-logo.png',
            'layoutType', 'heroSplit',
            'formLayout', 'stacked',
            'buttonColor', '#3B82F6',
            'buttonText', 'Download Application Guide',
            'primaryColor', '#1E40AF',
            'accentColor', '#10B981',
            'showProgressSteps', true,
            'showBenefits', true,
            'benefitsTitle', 'What Do I Get When Signing Up?',
            'trustBadgePreset', 'government',
            'benefitPreset', 'section8',
            'stepsPreset', 'section8Housing'
        )
    ) RETURNING id INTO step_id;

    -- Add form fields
    INSERT INTO flow_fields (step_id, field_order, field_type, field_name, label, placeholder, is_required, validation_rules)
    VALUES 
        (step_id, 1, 'text', 'first_name', 'First Name', 'Enter Your First Name', true, 
         jsonb_build_object('minLength', 2, 'pattern', '^[a-zA-Z\s-]+$')),
        
        (step_id, 2, 'text', 'last_name', 'Last Name', 'Enter Your Last Name', true, 
         jsonb_build_object('minLength', 2, 'pattern', '^[a-zA-Z\s-]+$')),
        
        (step_id, 3, 'email', 'email', 'Email Address', 'Enter Your E-Mail Address', true, 
         jsonb_build_object('pattern', '^[^\s@]+@[^\s@]+\.[^\s@]+$')),
        
        (step_id, 4, 'zip', 'zip_code', 'Zip Code', 'Enter Your Zip Code', true, 
         jsonb_build_object('pattern', '^\d{5}(-\d{4})?$'));

    -- Create thank you step
    INSERT INTO flow_steps (
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
        '🎉 Success! Your Guide Is On The Way',
        'Check your email in the next few minutes',
        '<div class="space-y-4">
            <p class="text-lg">Thank you for requesting the Section 8 Housing Application Guide!</p>
            <div class="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                <h3 class="font-bold text-blue-900 mb-2">What happens next?</h3>
                <ul class="space-y-2 text-blue-800">
                    <li>✓ You''ll receive an email with your guide within 5 minutes</li>
                    <li>✓ We''ll send you updates about housing opportunities in your area</li>
                    <li>✓ You''ll get alerts when waiting lists open near you</li>
                </ul>
            </div>
            <p class="text-sm text-gray-600">
                <strong>Didn''t receive your email?</strong> Check your spam folder or 
                <a href="/contact" class="text-blue-600 underline">contact our support team</a>
            </p>
        </div>',
        '/section8',
        10
    );

END $$;

-- Create custom CSS for this flow
INSERT INTO public.flow_custom_styles (flow_id, css_content)
SELECT 
    id,
    '
/* Affordable Heroes Style Landing Page */
.flow-renderer[data-slug="section8-housing-guide"] {
    font-family: Inter, Arial, sans-serif;
}

/* Hero section background */
.hero-section {
    background: linear-gradient(135deg, #F8FAFC 0%, #E0E7FF 100%);
}

/* Form card styling */
.form-card {
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
    border: 1px solid #E5E7EB;
}

/* Input field styling */
.flow-renderer[data-slug="section8-housing-guide"] input {
    border: 2px solid #D1D5DB;
    transition: all 0.2s ease;
}

.flow-renderer[data-slug="section8-housing-guide"] input:focus {
    border-color: #3B82F6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Button styling */
.flow-renderer[data-slug="section8-housing-guide"] button[type="submit"] {
    background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
    box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
    text-transform: none;
    font-weight: 600;
}

.flow-renderer[data-slug="section8-housing-guide"] button[type="submit"]:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
}

/* Step number boxes */
.step-number {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

/* Benefits list */
.benefits-list .benefit-item {
    padding: 0.5rem 0;
    border-bottom: 1px solid #F3F4F6;
}

.benefits-list .benefit-item:last-child {
    border-bottom: none;
}

/* Trust badge */
.trust-badge {
    background: #F0FDF4;
    border: 1px solid #BBF7D0;
    padding: 0.25rem 0.75rem;
    border-radius: 9999px;
    font-size: 0.875rem;
}

/* Mobile responsive */
@media (max-width: 768px) {
    .flow-renderer[data-slug="section8-housing-guide"] .grid {
        grid-template-columns: 1fr !important;
    }
    
    .step-descriptions {
        margin-top: 2rem;
    }
}
'
FROM flows 
WHERE slug = 'section8-housing-guide';

-- Insert sample tracking events for this flow
INSERT INTO public.flow_analytics_events (flow_id, event_type, event_data)
SELECT 
    id,
    'view',
    jsonb_build_object(
        'source', 'google_ads',
        'utm_campaign', 'section8_guide_2024',
        'device', 'desktop'
    )
FROM flows 
WHERE slug = 'section8-housing-guide';