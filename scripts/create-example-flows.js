// Create example lead flows
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Example flow 1: Quick Housing Search
const quickHousingFlow = {
  name: 'Quick Housing Search',
  slug: 'quick-housing-search',
  description: 'A simple 3-step flow to capture leads looking for Section 8 housing',
  status: 'active',
  settings: {},
  style_config: {
    primaryColor: '#3B82F6',
    backgroundColor: '#F8FAFC',
    buttonStyle: 'rounded',
    layout: 'centered'
  },
  google_ads_config: {
    conversionId: 'AW-XXXXXXXXX',
    conversionLabel: 'housing_lead'
  }
};

const quickHousingSteps = [
  {
    step_order: 1,
    step_type: 'form',
    title: "Let's Find Housing Near You",
    subtitle: "Enter your ZIP code to see available Section 8 properties",
    button_text: 'Search Properties',
    is_required: true,
    fields: [
      {
        field_order: 1,
        field_type: 'zip',
        field_name: 'zipCode',
        label: 'ZIP Code',
        placeholder: '12345',
        is_required: true,
        validation_rules: {
          pattern: '^\\d{5}$',
          message: 'Please enter a valid 5-digit ZIP code'
        }
      }
    ]
  },
  {
    step_order: 2,
    step_type: 'quiz',
    title: 'What type of housing are you looking for?',
    subtitle: 'This helps us show you the most relevant options',
    is_required: false,
    fields: [
      {
        field_order: 1,
        field_type: 'radio',
        field_name: 'housingType',
        label: 'Housing Type',
        options: [
          { label: 'Studio / 1 Bedroom', value: 'small', icon: 'home' },
          { label: '2-3 Bedrooms', value: 'medium', icon: 'users' },
          { label: '4+ Bedrooms', value: 'large', icon: 'heart' },
          { label: 'Senior Housing', value: 'senior', icon: 'clock' }
        ]
      }
    ]
  },
  {
    step_order: 3,
    step_type: 'form',
    title: 'Get Your Free Housing List',
    subtitle: "We'll send you available properties and keep you updated",
    button_text: 'Get My List',
    is_required: true,
    fields: [
      {
        field_order: 1,
        field_type: 'email',
        field_name: 'email',
        label: 'Email Address',
        placeholder: 'your@email.com',
        is_required: true,
        help_text: 'We\'ll send your housing list here'
      },
      {
        field_order: 2,
        field_type: 'text',
        field_name: 'firstName',
        label: 'First Name',
        placeholder: 'John',
        is_required: false
      }
    ]
  },
  {
    step_order: 4,
    step_type: 'thank_you',
    title: 'Your Housing List is Ready!',
    subtitle: 'Check your email for available Section 8 properties in your area',
    content: '<p>We found <strong>15+ properties</strong> near your location!</p>'
  }
];

// Example flow 2: Emergency Housing Assistance
const emergencyFlow = {
  name: 'Emergency Housing Assistance',
  slug: 'emergency-housing',
  description: 'Fast-track flow for people needing immediate housing help',
  status: 'active',
  settings: {},
  style_config: {
    primaryColor: '#DC2626',
    backgroundColor: '#FEF2F2',
    buttonStyle: 'rounded',
    layout: 'centered'
  }
};

const emergencySteps = [
  {
    step_order: 1,
    step_type: 'quiz',
    title: 'Do you need housing within the next 7 days?',
    subtitle: 'We have resources for urgent situations',
    is_required: true,
    fields: [
      {
        field_order: 1,
        field_type: 'radio',
        field_name: 'urgency',
        label: 'Urgency',
        options: [
          { label: 'Yes, within 7 days', value: 'urgent', icon: 'zap' },
          { label: 'Within 30 days', value: 'soon', icon: 'clock' },
          { label: 'Planning ahead', value: 'planning', icon: 'calendar' }
        ]
      }
    ]
  },
  {
    step_order: 2,
    step_type: 'form',
    title: 'Let us connect you with help',
    subtitle: 'A housing specialist will contact you within 24 hours',
    button_text: 'Get Emergency Help',
    is_required: true,
    fields: [
      {
        field_order: 1,
        field_type: 'phone',
        field_name: 'phone',
        label: 'Phone Number',
        placeholder: '(555) 555-5555',
        is_required: true,
        help_text: 'For immediate assistance'
      },
      {
        field_order: 2,
        field_type: 'zip',
        field_name: 'zipCode',
        label: 'Current Location (ZIP)',
        placeholder: '12345',
        is_required: true
      }
    ]
  },
  {
    step_order: 3,
    step_type: 'thank_you',
    title: 'Help is on the way!',
    subtitle: 'A specialist will call you within 24 hours',
    content: '<p><strong>Emergency Resources:</strong></p><ul><li>Call 211 for immediate shelter</li><li>Text HOME to 741741 for crisis support</li></ul>'
  }
];

async function createExampleFlows() {
  try {
    console.log('🚀 Creating example flows...');

    // Create Quick Housing Search flow
    const { data: flow1, error: error1 } = await supabase
      .from('flows')
      .insert(quickHousingFlow)
      .select()
      .single();

    if (error1) throw error1;

    // Add steps for flow 1
    for (const step of quickHousingSteps) {
      const { data: stepData, error: stepError } = await supabase
        .from('flow_steps')
        .insert({
          flow_id: flow1.id,
          ...step,
          fields: undefined // Remove fields from step data
        })
        .select()
        .single();

      if (stepError) throw stepError;

      // Add fields if any
      if (step.fields && step.fields.length > 0) {
        const fieldsToInsert = step.fields.map(field => ({
          step_id: stepData.id,
          ...field
        }));

        const { error: fieldsError } = await supabase
          .from('flow_fields')
          .insert(fieldsToInsert);

        if (fieldsError) throw fieldsError;
      }
    }

    console.log('✅ Created Quick Housing Search flow');

    // Create Emergency Housing flow
    const { data: flow2, error: error2 } = await supabase
      .from('flows')
      .insert(emergencyFlow)
      .select()
      .single();

    if (error2) throw error2;

    // Add steps for flow 2
    for (const step of emergencySteps) {
      const { data: stepData, error: stepError } = await supabase
        .from('flow_steps')
        .insert({
          flow_id: flow2.id,
          ...step,
          fields: undefined
        })
        .select()
        .single();

      if (stepError) throw stepError;

      // Add fields if any
      if (step.fields && step.fields.length > 0) {
        const fieldsToInsert = step.fields.map(field => ({
          step_id: stepData.id,
          ...field
        }));

        const { error: fieldsError } = await supabase
          .from('flow_fields')
          .insert(fieldsToInsert);

        if (fieldsError) throw fieldsError;
      }
    }

    console.log('✅ Created Emergency Housing Assistance flow');

    console.log('\n🎉 Example flows created successfully!');
    console.log('\nYou can view them at:');
    console.log(`- /flow/quick-housing-search`);
    console.log(`- /flow/emergency-housing`);
    console.log('\nManage them at: /admin/flows');

  } catch (error) {
    console.error('❌ Error creating flows:', error);
  }
}

createExampleFlows();