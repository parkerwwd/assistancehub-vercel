import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, FileText, Star, UserPlus, Home, DollarSign, Heart, Briefcase, GraduationCap, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { StepType, FieldType } from '@/types/leadFlow';

interface FlowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: React.ReactNode;
  color: string;
  steps: any[];
  estimatedTime: string;
  conversionRate?: string;
}

const templates: FlowTemplate[] = [
  {
    id: 'housing-assistance',
    name: 'Housing Assistance Application',
    description: 'Capture leads for Section 8 and affordable housing programs',
    category: 'Housing',
    icon: <Home className="w-6 h-6" />,
    color: 'bg-blue-500',
    estimatedTime: '2-3 min',
    conversionRate: '45%',
    steps: [
      {
        step_type: StepType.QUIZ,
        title: 'What type of housing assistance are you looking for?',
        subtitle: 'Select the option that best fits your needs',
        fields: [{
          field_type: FieldType.RADIO,
          field_name: 'assistance_type',
          label: 'Assistance Type',
          is_required: true,
          options: [
            { label: 'Section 8 Voucher', value: 'section8', icon: 'home' },
            { label: 'Public Housing', value: 'public', icon: 'building' },
            { label: 'Emergency Housing', value: 'emergency', icon: 'zap' },
            { label: 'Senior Housing', value: 'senior', icon: 'users' }
          ]
        }]
      },
      {
        step_type: StepType.FORM,
        title: 'Tell us about your household',
        fields: [
          {
            field_type: FieldType.NUMBER,
            field_name: 'household_size',
            label: 'How many people are in your household?',
            is_required: true,
            validation_rules: { min: 1, max: 20 }
          },
          {
            field_type: FieldType.ZIP,
            field_name: 'zip_code',
            label: 'ZIP Code',
            placeholder: '12345',
            is_required: true
          }
        ]
      },
      {
        step_type: StepType.FORM,
        title: 'How can we reach you?',
        subtitle: 'We\'ll send you available housing options',
        fields: [
          {
            field_type: FieldType.TEXT,
            field_name: 'first_name',
            label: 'First Name',
            is_required: true
          },
          {
            field_type: FieldType.EMAIL,
            field_name: 'email',
            label: 'Email Address',
            is_required: true
          },
          {
            field_type: FieldType.PHONE,
            field_name: 'phone',
            label: 'Phone Number',
            is_required: false
          }
        ]
      },
      {
        step_type: StepType.THANK_YOU,
        title: 'Thank you for your application!',
        content: '<p>We\'ve received your housing assistance request. You\'ll receive an email within 24 hours with:</p><ul><li>Available housing options in your area</li><li>Application requirements</li><li>Next steps to apply</li></ul>'
      }
    ]
  },
  {
    id: 'real-estate-buyer',
    name: 'Home Buyer Lead Capture',
    description: 'Qualify and capture real estate buyer leads',
    category: 'Real Estate',
    icon: <Home className="w-6 h-6" />,
    color: 'bg-green-500',
    estimatedTime: '1-2 min',
    conversionRate: '38%',
    steps: [
      {
        step_type: StepType.FORM,
        title: 'Find Your Dream Home',
        subtitle: 'Tell us what you\'re looking for',
        fields: [
          {
            field_type: FieldType.ZIP,
            field_name: 'search_area',
            label: 'Where are you looking to buy?',
            placeholder: 'Enter ZIP code',
            is_required: true
          }
        ]
      },
      {
        step_type: StepType.QUIZ,
        title: 'What\'s your timeline?',
        fields: [{
          field_type: FieldType.RADIO,
          field_name: 'timeline',
          label: 'When are you looking to buy?',
          is_required: true,
          options: [
            { label: 'ASAP', value: 'asap' },
            { label: '1-3 months', value: '1-3months' },
            { label: '3-6 months', value: '3-6months' },
            { label: 'Just browsing', value: 'browsing' }
          ]
        }]
      },
      {
        step_type: StepType.FORM,
        title: 'Get personalized home matches',
        fields: [
          {
            field_type: FieldType.TEXT,
            field_name: 'full_name',
            label: 'Full Name',
            is_required: true
          },
          {
            field_type: FieldType.EMAIL,
            field_name: 'email',
            label: 'Email',
            is_required: true
          },
          {
            field_type: FieldType.PHONE,
            field_name: 'phone',
            label: 'Phone (for urgent listings)',
            is_required: false
          }
        ]
      }
    ]
  },
  {
    id: 'newsletter-signup',
    name: 'Newsletter Signup',
    description: 'Simple email capture for newsletters',
    category: 'Marketing',
    icon: <FileText className="w-6 h-6" />,
    color: 'bg-purple-500',
    estimatedTime: '30 sec',
    conversionRate: '52%',
    steps: [
      {
        step_type: StepType.FORM,
        title: 'Stay in the loop',
        subtitle: 'Get weekly tips and exclusive content',
        fields: [
          {
            field_type: FieldType.EMAIL,
            field_name: 'email',
            label: 'Email Address',
            placeholder: 'your@email.com',
            is_required: true
          },
          {
            field_type: FieldType.CHECKBOX,
            field_name: 'preferences',
            label: 'I\'m interested in:',
            options: [
              { label: 'Weekly Newsletter', value: 'newsletter' },
              { label: 'Product Updates', value: 'products' },
              { label: 'Special Offers', value: 'offers' }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'webinar-registration',
    name: 'Webinar Registration',
    description: 'Capture registrations for online events',
    category: 'Events',
    icon: <GraduationCap className="w-6 h-6" />,
    color: 'bg-indigo-500',
    estimatedTime: '1-2 min',
    conversionRate: '42%',
    steps: [
      {
        step_type: StepType.CONTENT,
        title: 'Free Webinar: Master Your Finances',
        content: '<div class="text-center"><p class="text-lg mb-4">Join us for an exclusive 1-hour webinar where you\'ll learn:</p><ul class="text-left max-w-md mx-auto space-y-2"><li>✓ How to create a budget that works</li><li>✓ Investment strategies for beginners</li><li>✓ Tax-saving tips</li><li>✓ Q&A with financial experts</li></ul><p class="mt-6 text-sm text-gray-600">Thursday, March 28th at 2:00 PM EST</p></div>'
      },
      {
        step_type: StepType.FORM,
        title: 'Reserve Your Spot',
        subtitle: 'Limited seats available',
        fields: [
          {
            field_type: FieldType.TEXT,
            field_name: 'full_name',
            label: 'Full Name',
            is_required: true
          },
          {
            field_type: FieldType.EMAIL,
            field_name: 'email',
            label: 'Email Address',
            is_required: true
          },
          {
            field_type: FieldType.TEXT,
            field_name: 'company',
            label: 'Company (Optional)',
            is_required: false
          }
        ]
      },
      {
        step_type: StepType.THANK_YOU,
        title: 'You\'re registered!',
        content: '<p>Check your email for:</p><ul><li>Calendar invite</li><li>Webinar link</li><li>Pre-webinar resources</li></ul><p class="mt-4">See you Thursday!</p>'
      }
    ]
  },
  {
    id: 'customer-feedback',
    name: 'Customer Feedback Survey',
    description: 'Collect ratings and feedback from customers',
    category: 'Feedback',
    icon: <Star className="w-6 h-6" />,
    color: 'bg-yellow-500',
    estimatedTime: '1 min',
    conversionRate: '65%',
    steps: [
      {
        step_type: StepType.RATING,
        title: 'How was your experience?',
        content: '<p class="text-center">Your feedback helps us improve</p>',
        fields: [{
          field_type: FieldType.NUMBER,
          field_name: 'rating',
          label: 'Rating',
          is_required: true,
          validation_rules: { max: 5 },
          options: [
            { value: 'stars' },
            { value: 'true' } // show labels
          ]
        }]
      },
      {
        step_type: StepType.FORM,
        title: 'Tell us more',
        fields: [
          {
            field_type: FieldType.TEXTAREA,
            field_name: 'feedback',
            label: 'What can we improve?',
            placeholder: 'Your feedback...',
            is_required: false
          },
          {
            field_type: FieldType.EMAIL,
            field_name: 'email',
            label: 'Email (if you\'d like a response)',
            is_required: false
          }
        ]
      }
    ]
  },
  {
    id: 'job-application',
    name: 'Job Application Form',
    description: 'Streamlined job application with file upload',
    category: 'HR',
    icon: <Briefcase className="w-6 h-6" />,
    color: 'bg-orange-500',
    estimatedTime: '3-5 min',
    conversionRate: '28%',
    steps: [
      {
        step_type: StepType.FORM,
        title: 'Apply for Software Engineer',
        subtitle: 'Join our growing team',
        fields: [
          {
            field_type: FieldType.TEXT,
            field_name: 'full_name',
            label: 'Full Name',
            is_required: true
          },
          {
            field_type: FieldType.EMAIL,
            field_name: 'email',
            label: 'Email',
            is_required: true
          },
          {
            field_type: FieldType.PHONE,
            field_name: 'phone',
            label: 'Phone Number',
            is_required: true
          }
        ]
      },
      {
        step_type: StepType.FILE_UPLOAD,
        title: 'Upload Your Resume',
        subtitle: 'PDF or Word format preferred',
        fields: [{
          field_type: FieldType.TEXT,
          field_name: 'resume',
          label: 'Resume',
          is_required: true,
          validation_rules: {
            acceptedTypes: '.pdf,.doc,.docx',
            maxSize: 5242880, // 5MB
            maxFiles: 1
          }
        }]
      },
      {
        step_type: StepType.QUIZ,
        title: 'Quick Questions',
        fields: [
          {
            field_type: FieldType.RADIO,
            field_name: 'experience',
            label: 'Years of experience?',
            is_required: true,
            options: [
              { label: '0-2 years', value: '0-2' },
              { label: '3-5 years', value: '3-5' },
              { label: '5-10 years', value: '5-10' },
              { label: '10+ years', value: '10+' }
            ]
          }
        ]
      },
      {
        step_type: StepType.THANK_YOU,
        title: 'Application Received!',
        content: '<p>Thank you for applying! Our team will review your application and get back to you within 3-5 business days.</p>'
      }
    ]
  }
];

interface FlowTemplateGalleryProps {
  onSelectTemplate: (template: FlowTemplate) => void;
}

export default function FlowTemplateGallery({ onSelectTemplate }: FlowTemplateGalleryProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<FlowTemplate | null>(null);
  const [filter, setFilter] = useState<string>('all');

  const categories = ['all', ...Array.from(new Set(templates.map(t => t.category)))];
  const filteredTemplates = filter === 'all' 
    ? templates 
    : templates.filter(t => t.category === filter);

  const handleUseTemplate = () => {
    if (selectedTemplate) {
      onSelectTemplate(selectedTemplate);
      setSelectedTemplate(null);
    }
  };

  return (
    <>
      <div className="space-y-6">
        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Button
              key={category}
              variant={filter === category ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(category)}
              className="capitalize"
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Template Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates.map((template, index) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card 
                className="cursor-pointer hover:shadow-lg transition-all duration-200 h-full"
                onClick={() => setSelectedTemplate(template)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className={`p-3 rounded-lg ${template.color} text-white`}>
                      {template.icon}
                    </div>
                    <Badge variant="secondary">{template.category}</Badge>
                  </div>
                  <CardTitle className="mt-4">{template.name}</CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center gap-4">
                      <span>⏱ {template.estimatedTime}</span>
                      {template.conversionRate && (
                        <span>📈 {template.conversionRate} conv.</span>
                      )}
                    </div>
                    <span>{template.steps.length} steps</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Create from Scratch Option */}
        <Card 
          className="border-dashed cursor-pointer hover:border-gray-400 transition-colors"
          onClick={() => onSelectTemplate({ 
            id: 'blank',
            name: 'Blank Flow',
            description: 'Start with an empty flow',
            category: 'Custom',
            icon: <Sparkles />,
            color: 'bg-gray-500',
            steps: [],
            estimatedTime: 'Variable'
          })}
        >
          <CardContent className="py-12 text-center">
            <Sparkles className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="font-medium text-lg">Start from Scratch</h3>
            <p className="text-sm text-gray-500 mt-2">
              Build your own custom flow
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Template Preview Dialog */}
      <Dialog open={!!selectedTemplate} onOpenChange={() => setSelectedTemplate(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${selectedTemplate?.color} text-white`}>
                {selectedTemplate?.icon}
              </div>
              <div>
                <DialogTitle>{selectedTemplate?.name}</DialogTitle>
                <DialogDescription>{selectedTemplate?.description}</DialogDescription>
              </div>
            </div>
          </DialogHeader>
          
          {selectedTemplate && (
            <div className="space-y-6 mt-6">
              {/* Template Stats */}
              <div className="flex items-center gap-6 text-sm">
                <Badge variant="outline">⏱ {selectedTemplate.estimatedTime}</Badge>
                {selectedTemplate.conversionRate && (
                  <Badge variant="outline">📈 {selectedTemplate.conversionRate} conversion rate</Badge>
                )}
                <Badge variant="outline">📝 {selectedTemplate.steps.length} steps</Badge>
              </div>

              {/* Step Preview */}
              <div className="space-y-4">
                <h4 className="font-medium">Flow Steps:</h4>
                {selectedTemplate.steps.map((step, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                      <Badge variant="secondary">{step.step_type}</Badge>
                    </div>
                    <h5 className="font-medium">{step.title}</h5>
                    {step.subtitle && (
                      <p className="text-sm text-gray-600 mt-1">{step.subtitle}</p>
                    )}
                    {step.fields && step.fields.length > 0 && (
                      <p className="text-sm text-gray-500 mt-2">
                        {step.fields.length} field{step.fields.length > 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedTemplate(null)}>
              Cancel
            </Button>
            <Button onClick={handleUseTemplate}>
              Use This Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
