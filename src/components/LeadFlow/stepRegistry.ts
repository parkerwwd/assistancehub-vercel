import React from 'react';
import { 
  FlowPayloadStep, 
  StyleConfig, 
  FormStepSettings,
  QuizStepSettings,
  ThankYouStepSettings,
  SinglePageLandingSettings
} from '@/types/flowSchema';
import FormStep from '@/components/LeadFlow/steps/FormStep';
import ContentStep from '@/components/LeadFlow/steps/ContentStep';
import QuizStep from '@/components/LeadFlow/steps/QuizStep';
import ThankYouStep from '@/components/LeadFlow/steps/ThankYouStep';
import InteractiveLocationPicker from '@/components/LeadFlow/steps/InteractiveLocationPicker';
import SinglePageLandingStep from '@/components/LeadFlow/steps/SinglePageLandingStep';
import RatingStep from '@/components/LeadFlow/steps/RatingStep';
import VideoStep from '@/components/LeadFlow/steps/VideoStep';
import FileUploadStep from '@/components/LeadFlow/steps/FileUploadStep';

// Properly typed renderer props - no more 'any'!
export interface StepRendererProps {
  step: FlowPayloadStep;
  onComplete: (data: Record<string, string | number | boolean | string[]>) => void;
  onChange?: (data: Record<string, string | number | boolean | string[]>) => void;
  onBack?: () => void;
  values: Record<string, string | number | boolean | string[]>;
  isSubmitting?: boolean;
  styleConfig: StyleConfig;
}

// Enhanced step metadata with proper validation
export interface StepMeta {
  type: FlowPayloadStep['step_type'];
  displayName: string;
  description: string;
  icon: string;
  category: 'form' | 'content' | 'interactive' | 'media';
  defaults: () => Omit<FlowPayloadStep, 'id' | 'step_order'>;
  validate: (step: FlowPayloadStep) => { isValid: boolean; errors: string[] };
  Renderer: React.ComponentType<StepRendererProps>;
  // Step-specific settings schema
  settingsSchema?: 'form' | 'quiz' | 'thank_you' | 'landing' | 'generic';
}

// Validation helpers
const validateRequiredFields = (step: FlowPayloadStep, requiredFields: (keyof FlowPayloadStep)[]): string[] => {
  const errors: string[] = [];
  for (const field of requiredFields) {
    if (!step[field] || (typeof step[field] === 'string' && step[field]!.trim() === '')) {
      errors.push(`${field} is required`);
    }
  }
  return errors;
};

const validateFields = (step: FlowPayloadStep): string[] => {
  const errors: string[] = [];
  if (step.step_type === 'form' && (!step.fields || step.fields.length === 0)) {
    errors.push('Form steps must have at least one field');
  }
  
  // Validate field names are unique
  if (step.fields && step.fields.length > 0) {
    const fieldNames = step.fields.map(f => f.field_name);
    const duplicates = fieldNames.filter((name, index) => fieldNames.indexOf(name) !== index);
    if (duplicates.length > 0) {
      errors.push(`Duplicate field names: ${duplicates.join(', ')}`);
    }
  }
  
  return errors;
};

// Enhanced step registry with proper validation - NO MORE 'as any'!
export const StepRegistry: Record<string, StepMeta> = {
  form: {
    type: 'form',
    displayName: 'Form Step',
    description: 'Collect user information with form fields',
    icon: '📝',
    category: 'form',
    settingsSchema: 'form',
    defaults: () => ({
      step_type: 'form',
      title: 'Your Details',
      button_text: 'Continue',
      is_required: true,
      fields: [],
      settings: {
        layout: 'single',
        showProgress: true,
        allowBack: true,
      } as FormStepSettings
    }),
    validate: (step) => {
      const errors = [
        ...validateRequiredFields(step, ['title']),
        ...validateFields(step)
      ];
      return { isValid: errors.length === 0, errors };
    },
    Renderer: FormStep,
  },
  content: {
    type: 'content',
    displayName: 'Content Step', 
    description: 'Display information or instructions',
    icon: '📄',
    category: 'content',
    defaults: () => ({
      step_type: 'content',
      title: 'Information',
      content: 'Add your content here...',
      button_text: 'Continue',
      is_required: false,
      fields: []
    }),
    validate: (step) => {
      const errors = validateRequiredFields(step, ['title', 'content']);
      return { isValid: errors.length === 0, errors };
    },
    Renderer: ContentStep,
  },
  quiz: {
    type: 'quiz', 
    displayName: 'Quiz Step',
    description: 'Interactive quiz with scoring',
    icon: '❓',
    category: 'interactive',
    settingsSchema: 'quiz',
    defaults: () => ({
      step_type: 'quiz',
      title: 'Quick Quiz',
      button_text: 'Submit Quiz',
      is_required: true,
      fields: [],
      settings: {
        showResults: false,
        allowRetake: false,
      } as QuizStepSettings
    }),
    validate: (step) => {
      const errors = [
        ...validateRequiredFields(step, ['title']),
        ...validateFields(step)
      ];
      if (step.fields && step.fields.length === 0) {
        errors.push('Quiz steps must have at least one question');
      }
      return { isValid: errors.length === 0, errors };
    },
    Renderer: QuizStep,
  },
  thank_you: {
    type: 'thank_you',
    displayName: 'Thank You Step',
    description: 'Confirmation and next steps',
    icon: '🎉',
    category: 'content',
    settingsSchema: 'thank_you',
    defaults: () => ({
      step_type: 'thank_you',
      title: 'Thank You!',
      content: 'We\'ve received your submission.',
      button_text: 'Done',
      is_required: false,
      fields: [],
      settings: {
        showConfetti: false,
        autoRedirect: false,
      } as ThankYouStepSettings
    }),
    validate: (step) => {
      const errors = validateRequiredFields(step, ['title']);
      return { isValid: errors.length === 0, errors };
    },
    Renderer: ThankYouStep,
  },
  single_page_landing: {
    type: 'single_page_landing',
    displayName: 'Landing Page',
    description: 'Complete single-page landing with form',
    icon: '🎯',
    category: 'content',
    settingsSchema: 'landing',
    defaults: () => ({
      step_type: 'single_page_landing',
      title: 'Welcome',
      subtitle: 'Get started with our service',
      button_text: 'Get Started',
      is_required: true,
      fields: [],
      settings: {
        layoutType: 'hero',
        showProgressSteps: true,
        showBenefits: true,
      } as SinglePageLandingSettings
    }),
    validate: (step) => {
      const errors = validateRequiredFields(step, ['title']);
      return { isValid: errors.length === 0, errors };
    },
    Renderer: SinglePageLandingStep,
  },
  rating: {
    type: 'rating',
    displayName: 'Rating Step',
    description: 'Collect ratings and feedback',
    icon: '⭐',
    category: 'interactive', 
    defaults: () => ({
      step_type: 'rating',
      title: 'Rate Your Experience',
      button_text: 'Submit Rating',
      is_required: true,
      fields: []
    }),
    validate: (step) => {
      const errors = validateRequiredFields(step, ['title']);
      return { isValid: errors.length === 0, errors };
    },
    Renderer: RatingStep,
  },
  video: {
    type: 'video',
    displayName: 'Video Step',
    description: 'Embed video content',
    icon: '🎥',
    category: 'media',
    defaults: () => ({
      step_type: 'video',
      title: 'Watch Video',
      button_text: 'Continue',
      is_required: false,
      fields: []
    }),
    validate: (step) => {
      const errors = validateRequiredFields(step, ['title']);
      if (!step.settings || !step.settings.videoUrl) {
        errors.push('Video URL is required');
      }
      return { isValid: errors.length === 0, errors };
    },
    Renderer: VideoStep,
  },
  file_upload: {
    type: 'file_upload',
    displayName: 'File Upload',
    description: 'Allow users to upload files',
    icon: '📎',
    category: 'form',
    defaults: () => ({
      step_type: 'file_upload',
      title: 'Upload Files', 
      button_text: 'Upload & Continue',
      is_required: true,
      fields: []
    }),
    validate: (step) => {
      const errors = validateRequiredFields(step, ['title']);
      return { isValid: errors.length === 0, errors };
    },
    Renderer: FileUploadStep,
  },
};

// Helper functions for step management
export const getStepMeta = (stepType: FlowPayloadStep['step_type']): StepMeta | undefined => {
  return StepRegistry[stepType];
};

export const validateStep = (step: FlowPayloadStep): { isValid: boolean; errors: string[] } => {
  const meta = getStepMeta(step.step_type);
  if (!meta) {
    return { isValid: false, errors: [`Unknown step type: ${step.step_type}`] };
  }
  return meta.validate(step);
};

export const createDefaultStep = (stepType: FlowPayloadStep['step_type'], stepOrder: number = 1): FlowPayloadStep => {
  const meta = getStepMeta(stepType);
  if (!meta) {
    throw new Error(`Unknown step type: ${stepType}`);
  }
  
  return {
    id: `step-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    step_order: stepOrder,
    ...meta.defaults(),
  } as FlowPayloadStep;
};

export const getStepsByCategory = (category: StepMeta['category']): StepMeta[] => {
  return Object.values(StepRegistry).filter(meta => meta.category === category);
};

// Export step categories for UI
export const STEP_CATEGORIES = {
  form: 'Form Elements',
  content: 'Content & Info', 
  interactive: 'Interactive',
  media: 'Media & Files'
} as const;