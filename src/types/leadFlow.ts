import { Database } from "@/integrations/supabase/types";

// Base types from Supabase
export type Flow = Database['public']['Tables']['flows']['Row'];
export type FlowStep = Database['public']['Tables']['flow_steps']['Row'];
export type FlowField = Database['public']['Tables']['flow_fields']['Row'];
export type Lead = Database['public']['Tables']['leads']['Row'];
export type LeadResponse = Database['public']['Tables']['lead_responses']['Row'];

// Enums
export enum FlowStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  PAUSED = 'paused',
  ARCHIVED = 'archived'
}

export enum StepType {
  FORM = 'form',
  CONTENT = 'content',
  QUIZ = 'quiz',
  SURVEY = 'survey',
  CONDITIONAL = 'conditional',
  THANK_YOU = 'thank_you'
}

export enum FieldType {
  TEXT = 'text',
  EMAIL = 'email',
  PHONE = 'phone',
  SELECT = 'select',
  RADIO = 'radio',
  CHECKBOX = 'checkbox',
  TEXTAREA = 'textarea',
  DATE = 'date',
  NUMBER = 'number',
  ZIP = 'zip',
  HIDDEN = 'hidden'
}

// Extended types with relations
export interface FlowWithSteps extends Flow {
  steps: FlowStepWithFields[];
}

export interface FlowStepWithFields extends FlowStep {
  fields: FlowField[];
}

// Field validation rules
export interface ValidationRule {
  type: 'required' | 'minLength' | 'maxLength' | 'pattern' | 'email' | 'phone' | 'zip';
  value?: any;
  message?: string;
}

// Field options for select/radio/checkbox
export interface FieldOption {
  label: string;
  value: string;
  isDefault?: boolean;
}

// Conditional logic
export interface ConditionalLogic {
  field: string;
  operator: 'equals' | 'notEquals' | 'contains' | 'greaterThan' | 'lessThan';
  value: any;
  action: 'show' | 'hide' | 'skip';
}

// Navigation logic
export interface NavigationLogic {
  conditions: ConditionalLogic[];
  targetStep?: number;
  targetFlow?: string;
}

// Style configuration
export interface StyleConfig {
  primaryColor?: string;
  secondaryColor?: string;
  backgroundColor?: string;
  fontFamily?: string;
  buttonStyle?: 'rounded' | 'square' | 'pill';
  layout?: 'centered' | 'split' | 'full';
  logoUrl?: string;
  backgroundImageUrl?: string;
}

// Google Ads configuration
export interface GoogleAdsConfig {
  conversionId?: string;
  conversionLabel?: string;
  remarketingTag?: boolean;
  enhancedConversions?: boolean;
}

// Form field values
export interface FieldValues {
  [fieldName: string]: any;
}

// Lead capture session
export interface LeadSession {
  flowId: string;
  leadId?: string;
  currentStep: number;
  responses: FieldValues;
  startedAt: Date;
  source?: string;
  utmParams?: {
    source?: string;
    medium?: string;
    campaign?: string;
    term?: string;
    content?: string;
  };
  gclid?: string;
}

// Analytics data
export interface FlowAnalytics {
  views: number;
  uniqueViews: number;
  starts: number;
  completions: number;
  conversionRate: number;
  avgTimeToComplete: number;
  dropOffByStep: {
    [stepId: string]: number;
  };
  sourceBreakdown: {
    [source: string]: {
      views: number;
      conversions: number;
    };
  };
}

// Template structure
export interface FlowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  thumbnailUrl?: string;
  steps: Omit<FlowStep, 'id' | 'flow_id' | 'created_at' | 'updated_at'>[];
  fields: {
    [stepOrder: number]: Omit<FlowField, 'id' | 'step_id' | 'created_at' | 'updated_at'>[];
  };
  defaultStyle?: StyleConfig;
}