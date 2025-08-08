import React from 'react';
import { FlowPayloadStep } from '@/types/flowSchema';
import FormStep from '@/components/LeadFlow/steps/FormStep';
import ContentStep from '@/components/LeadFlow/steps/ContentStep';
import QuizStep from '@/components/LeadFlow/steps/QuizStep';
import ThankYouStep from '@/components/LeadFlow/steps/ThankYouStep';
import InteractiveLocationPicker from '@/components/LeadFlow/steps/InteractiveLocationPicker';
import SinglePageLandingStep from '@/components/LeadFlow/steps/SinglePageLandingStep';
import RatingStep from '@/components/LeadFlow/steps/RatingStep';
import VideoStep from '@/components/LeadFlow/steps/VideoStep';
import FileUploadStep from '@/components/LeadFlow/steps/FileUploadStep';

export type StepRendererProps = {
  step: any;
  onComplete: (data: Record<string, any>) => void;
  onBack?: () => void;
  values: Record<string, any>;
  isSubmitting?: boolean;
  styleConfig?: any;
};

export type StepMeta = {
  type: FlowPayloadStep['step_type'];
  displayName: string;
  defaults: () => Partial<FlowPayloadStep>;
  validate: (step: FlowPayloadStep) => string[];
  Renderer: React.FC<StepRendererProps>;
};

export const StepRegistry: Record<string, StepMeta> = {
  form: {
    type: 'form',
    displayName: 'Form',
    defaults: () => ({ title: 'Your Details', button_text: 'Continue', fields: [] }),
    validate: (s) => [],
    Renderer: ((props: any) => React.createElement(FormStep as any, props)) as any,
  },
  content: {
    type: 'content',
    displayName: 'Content',
    defaults: () => ({ title: 'Info', content: '' }),
    validate: (s) => [],
    Renderer: ((props: any) => React.createElement(ContentStep as any, props)) as any,
  },
  quiz: {
    type: 'quiz',
    displayName: 'Quiz',
    defaults: () => ({ title: 'Quick Quiz' }),
    validate: (s) => [],
    Renderer: ((props: any) => React.createElement(QuizStep as any, props)) as any,
  },
  thank_you: {
    type: 'thank_you',
    displayName: 'Thank You',
    defaults: () => ({ title: 'Thank You!' }),
    validate: (s) => [],
    Renderer: ((props: any) => React.createElement(ThankYouStep as any, props)) as any,
  },
  single_page_landing: {
    type: 'single_page_landing',
    displayName: 'Landing Page',
    defaults: () => ({ title: 'Welcome' }),
    validate: (s) => [],
    Renderer: ((props: any) => React.createElement(SinglePageLandingStep as any, props)) as any,
  },
  rating: {
    type: 'rating',
    displayName: 'Rating',
    defaults: () => ({ title: 'Rate' }),
    validate: (s) => [],
    Renderer: ((props: any) => React.createElement(RatingStep as any, props)) as any,
  },
  video: {
    type: 'video',
    displayName: 'Video',
    defaults: () => ({}),
    validate: (s) => [],
    Renderer: ((props: any) => React.createElement(VideoStep as any, props)) as any,
  },
  file_upload: {
    type: 'file_upload',
    displayName: 'File Upload',
    defaults: () => ({ title: 'Upload' }),
    validate: (s) => [],
    Renderer: ((props: any) => React.createElement(FileUploadStep as any, props)) as any,
  },
  // Special interactive case
  location_picker: {
    type: 'conditional',
    displayName: 'Location Picker',
    defaults: () => ({ title: 'Location' }),
    validate: (s) => [],
    Renderer: ((props: any) => React.createElement(InteractiveLocationPicker as any, props)) as any,
  },
};


