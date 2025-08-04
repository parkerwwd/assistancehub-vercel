-- Create enum types for flow and field types
CREATE TYPE flow_status AS ENUM ('draft', 'active', 'paused', 'archived');
CREATE TYPE step_type AS ENUM ('form', 'content', 'quiz', 'survey', 'conditional', 'thank_you');
CREATE TYPE field_type AS ENUM ('text', 'email', 'phone', 'select', 'radio', 'checkbox', 'textarea', 'date', 'number', 'zip', 'hidden');

-- Create flows table
CREATE TABLE public.flows (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    status flow_status DEFAULT 'draft',
    
    -- Configuration
    settings JSONB DEFAULT '{}',
    google_ads_config JSONB DEFAULT '{}', -- UTM tracking, conversion IDs
    style_config JSONB DEFAULT '{}', -- Colors, fonts, branding
    
    -- A/B Testing
    is_variant BOOLEAN DEFAULT false,
    parent_flow_id UUID REFERENCES public.flows(id),
    variant_weight INTEGER DEFAULT 50, -- Percentage of traffic
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID,
    
    -- Analytics
    total_views INTEGER DEFAULT 0,
    total_completions INTEGER DEFAULT 0,
    conversion_rate DECIMAL(5,2) GENERATED ALWAYS AS (
        CASE 
            WHEN total_views > 0 THEN (total_completions::DECIMAL / total_views * 100)
            ELSE 0
        END
    ) STORED
);

-- Create flow steps table
CREATE TABLE public.flow_steps (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    flow_id UUID REFERENCES public.flows(id) ON DELETE CASCADE,
    step_order INTEGER NOT NULL,
    step_type step_type NOT NULL,
    
    -- Content
    title VARCHAR(255),
    subtitle TEXT,
    content TEXT, -- Rich text content
    button_text VARCHAR(100) DEFAULT 'Next',
    
    -- Logic
    is_required BOOLEAN DEFAULT true,
    skip_logic JSONB DEFAULT '{}', -- Conditions to skip this step
    navigation_logic JSONB DEFAULT '{}', -- Where to go next based on answers
    validation_rules JSONB DEFAULT '{}',
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(flow_id, step_order)
);

-- Create flow fields table (for form steps)
CREATE TABLE public.flow_fields (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    step_id UUID REFERENCES public.flow_steps(id) ON DELETE CASCADE,
    field_order INTEGER NOT NULL,
    
    -- Field configuration
    field_type field_type NOT NULL,
    field_name VARCHAR(100) NOT NULL, -- Internal name
    label VARCHAR(255) NOT NULL,
    placeholder VARCHAR(255),
    help_text TEXT,
    
    -- Validation
    is_required BOOLEAN DEFAULT false,
    validation_rules JSONB DEFAULT '{}', -- min/max length, regex, etc.
    
    -- Options (for select, radio, checkbox)
    options JSONB DEFAULT '[]',
    
    -- Advanced
    default_value TEXT,
    conditional_logic JSONB DEFAULT '{}', -- Show/hide based on other fields
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(step_id, field_order),
    UNIQUE(step_id, field_name)
);

-- Create leads table
CREATE TABLE public.leads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    flow_id UUID REFERENCES public.flows(id),
    
    -- Contact info (denormalized for quick access)
    email VARCHAR(255),
    phone VARCHAR(20),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    zip_code VARCHAR(10),
    
    -- Source tracking
    source VARCHAR(50), -- google_ads, organic, direct
    utm_source VARCHAR(100),
    utm_medium VARCHAR(100),
    utm_campaign VARCHAR(100),
    utm_term VARCHAR(255),
    utm_content VARCHAR(255),
    gclid VARCHAR(255), -- Google Click ID
    
    -- Device/Browser info
    user_agent TEXT,
    ip_address INET,
    device_type VARCHAR(20),
    browser VARCHAR(50),
    
    -- Status
    status VARCHAR(20) DEFAULT 'new', -- new, qualified, contacted, converted
    score INTEGER DEFAULT 0, -- Lead scoring
    
    -- Timing
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    time_to_complete INTEGER, -- Seconds
    
    -- Location (for housing assistance targeting)
    city VARCHAR(100),
    state VARCHAR(2),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8)
);

-- Create lead responses table
CREATE TABLE public.lead_responses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
    field_id UUID REFERENCES public.flow_fields(id),
    step_id UUID REFERENCES public.flow_steps(id),
    
    -- Response data
    field_name VARCHAR(100),
    field_value TEXT,
    field_values JSONB, -- For multi-select fields
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(lead_id, field_id)
);

-- Create flow analytics table
CREATE TABLE public.flow_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    flow_id UUID REFERENCES public.flows(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    
    -- Metrics
    views INTEGER DEFAULT 0,
    unique_views INTEGER DEFAULT 0,
    starts INTEGER DEFAULT 0,
    completions INTEGER DEFAULT 0,
    
    -- Step-by-step analytics
    step_analytics JSONB DEFAULT '{}', -- Drop-off rates per step
    
    -- Source breakdown
    source_breakdown JSONB DEFAULT '{}',
    device_breakdown JSONB DEFAULT '{}',
    
    -- Time metrics
    avg_time_to_complete INTEGER, -- Seconds
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(flow_id, date)
);

-- Create templates table for reusable flows
CREATE TABLE public.flow_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50),
    template_data JSONB NOT NULL, -- Full flow configuration
    thumbnail_url TEXT,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_flows_slug ON public.flows(slug);
CREATE INDEX idx_flows_status ON public.flows(status);
CREATE INDEX idx_flow_steps_flow_id ON public.flow_steps(flow_id);
CREATE INDEX idx_flow_fields_step_id ON public.flow_fields(step_id);
CREATE INDEX idx_leads_flow_id ON public.leads(flow_id);
CREATE INDEX idx_leads_email ON public.leads(email);
CREATE INDEX idx_leads_created_at ON public.leads(created_at);
CREATE INDEX idx_lead_responses_lead_id ON public.lead_responses(lead_id);
CREATE INDEX idx_flow_analytics_flow_id_date ON public.flow_analytics(flow_id, date);

-- Create RLS policies
ALTER TABLE public.flows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flow_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flow_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flow_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flow_templates ENABLE ROW LEVEL SECURITY;

-- Public can view active flows
CREATE POLICY "Anyone can view active flows" ON public.flows
    FOR SELECT USING (status = 'active');

-- Authenticated users can manage flows
CREATE POLICY "Authenticated users can manage flows" ON public.flows
    FOR ALL USING (auth.role() = 'authenticated');

-- Similar policies for other tables
CREATE POLICY "Authenticated users can manage flow steps" ON public.flow_steps
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage flow fields" ON public.flow_fields
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view leads" ON public.leads
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view lead responses" ON public.lead_responses
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view analytics" ON public.flow_analytics
    FOR SELECT USING (auth.role() = 'authenticated');

-- Public can submit leads
CREATE POLICY "Anyone can create leads" ON public.leads
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can create lead responses" ON public.lead_responses
    FOR INSERT WITH CHECK (true);

-- Create functions for analytics
CREATE OR REPLACE FUNCTION update_flow_analytics()
RETURNS TRIGGER AS $$
BEGIN
    -- Update flow total views/completions
    IF TG_TABLE_NAME = 'leads' THEN
        IF NEW.completed_at IS NOT NULL AND OLD.completed_at IS NULL THEN
            UPDATE flows 
            SET total_completions = total_completions + 1
            WHERE id = NEW.flow_id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_flow_analytics_trigger
    AFTER UPDATE ON public.leads
    FOR EACH ROW
    EXECUTE FUNCTION update_flow_analytics();

-- Function to increment flow views
CREATE OR REPLACE FUNCTION increment_flow_views(flow_slug VARCHAR)
RETURNS void AS $$
BEGIN
    UPDATE flows 
    SET total_views = total_views + 1
    WHERE slug = flow_slug AND status = 'active';
END;
$$ LANGUAGE plpgsql;