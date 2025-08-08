import { z } from 'zod';

// Unified Flow Schema for versioned payloads

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
  label: z.string().optional(),
  placeholder: z.string().optional(),
  help_text: z.string().optional(),
  is_required: z.boolean().default(false),
  validation_rules: z.record(z.any()).optional(),
  options: z.array(z.any()).optional(),
  default_value: z.any().optional(),
  conditional_logic: z.record(z.any()).optional(),
});

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
  title: z.string().optional(),
  subtitle: z.string().optional(),
  content: z.string().optional(),
  button_text: z.string().optional(),
  is_required: z.boolean().optional(),
  skip_logic: z.record(z.any()).optional(),
  navigation_logic: z.record(z.any()).optional(),
  validation_rules: z.record(z.any()).optional(),
  settings: z.record(z.any()).optional(),
  redirect_url: z.string().url().optional(),
  redirect_delay: z.number().int().optional(),
  fields: z.array(FieldSchema).default([]),
});

export const StyleSchema = z.object({
  primaryColor: z.string().optional(),
  backgroundColor: z.string().optional(),
  buttonStyle: z.enum(['rounded', 'square', 'pill']).optional(),
  layout: z.enum(['centered', 'split', 'full']).optional(),
  fontFamily: z.string().optional(),
  logoUrl: z.string().optional(),
  heroImageUrl: z.string().optional(),
  backgroundImageUrl: z.string().optional(),
});

export const FlowPayloadSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  slug: z.string(),
  description: z.string().optional(),
  status: z.enum(['draft', 'active', 'paused', 'archived']).default('draft'),
  settings: z.record(z.any()).default({}),
  google_ads_config: z.record(z.any()).default({}),
  style_config: StyleSchema.default({}),
  steps: z.array(StepSchema).min(0),
  logic: z.array(z.record(z.any())).optional(),
  metadata: z.record(z.any()).optional(),
});

export type FlowPayload = z.infer<typeof FlowPayloadSchema>;
export type FlowPayloadStep = z.infer<typeof StepSchema>;
export type FlowPayloadField = z.infer<typeof FieldSchema>;


