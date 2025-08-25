import { z } from 'zod';

// Enhanced Flow Schema with strict type safety
// No more 'as any' - everything properly typed!

// Validation rule schemas
export const ValidationRuleSchema = z.object({
  required: z.boolean().optional(),
  minLength: z.number().optional(),
  maxLength: z.number().optional(),
  pattern: z.string().optional(),
  message: z.string().optional(),
  min: z.number().optional(),
  max: z.number().optional(),
});

// Field option schema for select/radio/checkbox
export const FieldOptionSchema = z.object({
  label: z.string(),
  value: z.string(),
  isDefault: z.boolean().optional(),
  icon: z.string().optional(),
});

// Conditional logic schema
export const ConditionalLogicSchema = z.object({
  field: z.string(),
  operator: z.enum(['equals', 'notEquals', 'contains', 'greaterThan', 'lessThan']),
  value: z.union([z.string(), z.number(), z.boolean()]),
  action: z.enum(['show', 'hide', 'require']),
});

// Enhanced field schema with proper typing
export const FieldSchema = z.object({
  id: z.string(),
  field_type: z.enum([
    'text',
    'email',
    'phone',
    'select',
    'radio',
    'checkbox',
    'textarea',
    'date',
    'number',
    'zip',
    'hidden',
  ]),
  field_name: z.string(),
  label: z.string(),
  placeholder: z.string().optional(),
  help_text: z.string().optional(),
  is_required: z.boolean().default(false),
  validation_rules: ValidationRuleSchema.optional(),
  options: z.array(FieldOptionSchema).optional(),
  default_value: z.string().optional(),
  conditional_logic: z.array(ConditionalLogicSchema).optional(),
});

// Step-specific settings schemas
export const FormStepSettingsSchema = z.object({
  layout: z.enum(['single', 'grid', 'inline']).default('single'),
  showProgress: z.boolean().default(true),
  allowBack: z.boolean().default(true),
}).optional();

export const QuizStepSettingsSchema = z.object({
  showResults: z.boolean().default(false),
  passingScore: z.number().min(0).max(100).optional(),
  allowRetake: z.boolean().default(false),
}).optional();

export const ThankYouStepSettingsSchema = z.object({
  showConfetti: z.boolean().default(false),
  autoRedirect: z.boolean().default(false),
  redirectDelay: z.number().int().positive().optional(),
}).optional();

export const SinglePageLandingSettingsSchema = z.object({
  layoutType: z.enum(['hero', 'split', 'minimal']).default('hero'),
  showProgressSteps: z.boolean().default(true),
  showBenefits: z.boolean().default(true),
  benefitPreset: z.string().optional(),
}).optional();

// Skip logic schema
export const SkipLogicSchema = z.object({
  conditions: z.array(ConditionalLogicSchema),
  action: z.enum(['skip', 'jump_to']),
  targetStep: z.string().optional(),
}).optional();

// Navigation logic schema  
export const NavigationLogicSchema = z.object({
  conditions: z.array(ConditionalLogicSchema),
  targetStep: z.string().optional(),
  targetFlow: z.string().optional(),
}).optional();

// Enhanced step schema with proper settings per type
export const StepSchema = z.object({
  id: z.string(),
  step_order: z.number().int().nonnegative(),
  step_type: z.enum([
    'form',
    'content', 
    'quiz',
    'survey',
    'conditional',
    'thank_you',
    'single_page_landing',
    'image_gallery',
    'video',
    'file_upload', 
    'rating',
    'testimonial',
    'countdown',
  ]),
  title: z.string(),
  subtitle: z.string().optional(),
  content: z.string().optional(),
  button_text: z.string().default('Continue'),
  is_required: z.boolean().default(true),
  skip_logic: SkipLogicSchema,
  navigation_logic: NavigationLogicSchema,
  validation_rules: ValidationRuleSchema.optional(),
  settings: z.union([
    FormStepSettingsSchema,
    QuizStepSettingsSchema, 
    ThankYouStepSettingsSchema,
    SinglePageLandingSettingsSchema,
    z.record(z.unknown())
  ]).optional(),
  redirect_url: z.string().url().optional(),
  redirect_delay: z.number().int().positive().optional(),
  fields: z.array(FieldSchema).default([]),
});

// Enhanced style configuration schema
export const StyleSchema = z.object({
  primaryColor: z.string().regex(/^#[0-9A-F]{6}$/i).default('#3B82F6'),
  secondaryColor: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
  backgroundColor: z.string().regex(/^#[0-9A-F]{6}$/i).default('#FFFFFF'),
  buttonStyle: z.enum(['rounded', 'square', 'pill']).default('rounded'),
  layout: z.enum(['centered', 'split', 'full']).default('centered'),
  fontFamily: z.string().default('Inter'),
  logoUrl: z.string().url().optional(),
  heroImageUrl: z.string().url().optional(), 
  backgroundImageUrl: z.string().url().optional(),
  borderRadius: z.number().min(0).max(50).default(8),
  shadowLevel: z.enum(['none', 'sm', 'md', 'lg', 'xl']).default('md'),
});

// Google Ads configuration schema
export const GoogleAdsConfigSchema = z.object({
  conversionId: z.string().optional(),
  conversionLabel: z.string().optional(),
  remarketingTag: z.boolean().default(false),
  enhancedConversions: z.boolean().default(false),
  gtagConfig: z.record(z.unknown()).optional(),
});

// Flow settings schema
export const FlowSettingsSchema = z.object({
  allowBack: z.boolean().default(true),
  showProgress: z.boolean().default(true),
  saveProgress: z.boolean().default(false),
  requireAuth: z.boolean().default(false),
  captureUtm: z.boolean().default(true),
  trackAnalytics: z.boolean().default(true),
});

// A/B testing and logic rules
export const LogicRuleSchema = z.object({
  id: z.string(),
  name: z.string(),
  conditions: z.array(ConditionalLogicSchema),
  actions: z.array(z.object({
    type: z.enum(['redirect', 'show_step', 'hide_step', 'set_value']),
    target: z.string(),
    value: z.unknown().optional(),
  })),
  enabled: z.boolean().default(true),
});

// Flow metadata schema
export const FlowMetadataSchema = z.object({
  guideMode: z.boolean().optional(),
  passThreshold: z.number().min(0).max(100).optional(),
  allowRetake: z.boolean().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  estimatedTime: z.number().positive().optional(), // minutes
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
});

// Main flow payload schema - fully typed!
export const FlowPayloadSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Flow name is required'),
  slug: z.string().regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  description: z.string().optional(),
  status: z.enum(['draft', 'active', 'paused', 'archived']).default('draft'),
  settings: FlowSettingsSchema.default({}),
  google_ads_config: GoogleAdsConfigSchema.default({}),
  style_config: StyleSchema.default({}),
  steps: z.array(StepSchema).min(1, 'Flow must have at least one step'),
  logic: z.array(LogicRuleSchema).default([]),
  metadata: FlowMetadataSchema.default({}),
});

// Export all types
export type FlowPayload = z.infer<typeof FlowPayloadSchema>;
export type FlowPayloadStep = z.infer<typeof StepSchema>;
export type FlowPayloadField = z.infer<typeof FieldSchema>;
export type ValidationRule = z.infer<typeof ValidationRuleSchema>;
export type FieldOption = z.infer<typeof FieldOptionSchema>;
export type ConditionalLogic = z.infer<typeof ConditionalLogicSchema>;
export type StyleConfig = z.infer<typeof StyleSchema>;
export type GoogleAdsConfig = z.infer<typeof GoogleAdsConfigSchema>;
export type FlowSettings = z.infer<typeof FlowSettingsSchema>;
export type LogicRule = z.infer<typeof LogicRuleSchema>;
export type FlowMetadata = z.infer<typeof FlowMetadataSchema>;

// Step settings types
export type FormStepSettings = z.infer<typeof FormStepSettingsSchema>;
export type QuizStepSettings = z.infer<typeof QuizStepSettingsSchema>;
export type ThankYouStepSettings = z.infer<typeof ThankYouStepSettingsSchema>;
export type SinglePageLandingSettings = z.infer<typeof SinglePageLandingSettingsSchema>;

// Helper functions for validation
export const validateFlowPayload = (data: unknown): { success: boolean; data?: FlowPayload; errors?: string[] } => {
  const result = FlowPayloadSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { 
    success: false, 
    errors: result.error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
  };
};

export const validateStep = (data: unknown): { success: boolean; data?: FlowPayloadStep; errors?: string[] } => {
  const result = StepSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { 
    success: false, 
    errors: result.error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
  };
};