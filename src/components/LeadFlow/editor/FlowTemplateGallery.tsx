import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, FileText, Star, UserPlus, DollarSign, Briefcase, Zap } from 'lucide-react';
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
    id: 'full-contact',
    name: 'Full Contact Form',
    description: 'Capture name, email, and phone number',
    category: 'Basic',
    icon: <UserPlus className="w-6 h-6" />,
    color: 'bg-blue-500',
    estimatedTime: '30 sec',
    conversionRate: '42%',
    steps: [
      {
        step_type: StepType.FORM,
        title: 'Get Your Free Guide',
        subtitle: 'Enter your information below',
        fields: [
          {
            field_type: FieldType.TEXT,
            field_name: 'full_name',
            label: 'Full Name',
            placeholder: 'John Smith',
            is_required: true
          },
          {
            field_type: FieldType.EMAIL,
            field_name: 'email',
            label: 'Email Address',
            placeholder: 'john@example.com',
            is_required: true
          },
          {
            field_type: FieldType.PHONE,
            field_name: 'phone',
            label: 'Phone Number',
            placeholder: '(555) 555-5555',
            is_required: true
          }
        ]
      },
      {
        step_type: StepType.THANK_YOU,
        title: 'Thank You!',
        content: '<p>We\'ve received your information and will be in touch soon.</p>'
      }
    ]
  },
  {
    id: 'email-only',
    name: 'Email Only',
    description: 'Simple email capture form',
    category: 'Basic',
    icon: <FileText className="w-6 h-6" />,
    color: 'bg-green-500',
    estimatedTime: '15 sec',
    conversionRate: '58%',
    steps: [
      {
        step_type: StepType.FORM,
        title: 'Stay Updated',
        subtitle: 'Get the latest updates delivered to your inbox',
        fields: [
          {
            field_type: FieldType.EMAIL,
            field_name: 'email',
            label: 'Email Address',
            placeholder: 'your@email.com',
            is_required: true
          }
        ]
      },
      {
        step_type: StepType.THANK_YOU,
        title: 'You\'re all set!',
        content: '<p>Check your email for a confirmation message.</p>'
      }
    ]
  },
  {
    id: 'phone-only',
    name: 'Phone Only',
    description: 'Capture phone number for SMS updates',
    category: 'Basic',
    icon: <DollarSign className="w-6 h-6" />,
    color: 'bg-purple-500',
    estimatedTime: '15 sec',
    conversionRate: '35%',
    steps: [
      {
        step_type: StepType.FORM,
        title: 'Get SMS Updates',
        subtitle: 'Receive instant notifications on your phone',
        fields: [
          {
            field_type: FieldType.PHONE,
            field_name: 'phone',
            label: 'Phone Number',
            placeholder: '(555) 555-5555',
            is_required: true,
            help_text: 'We\'ll only text you important updates'
          }
        ]
      },
      {
        step_type: StepType.THANK_YOU,
        title: 'Thank You!',
        content: '<p>You\'ll receive a confirmation text shortly.</p>'
      }
    ]
  },
  {
    id: 'name-email',
    name: 'Name & Email',
    description: 'Capture name and email without phone',
    category: 'Basic',
    icon: <Star className="w-6 h-6" />,
    color: 'bg-yellow-500',
    estimatedTime: '20 sec',
    conversionRate: '52%',
    steps: [
      {
        step_type: StepType.FORM,
        title: 'Join Our Community',
        subtitle: 'Let\'s get to know you',
        fields: [
          {
            field_type: FieldType.TEXT,
            field_name: 'first_name',
            label: 'First Name',
            placeholder: 'John',
            is_required: true
          },
          {
            field_type: FieldType.TEXT,
            field_name: 'last_name',
            label: 'Last Name',
            placeholder: 'Smith',
            is_required: true
          },
          {
            field_type: FieldType.EMAIL,
            field_name: 'email',
            label: 'Email Address',
            placeholder: 'john@example.com',
            is_required: true
          }
        ]
      },
      {
        step_type: StepType.THANK_YOU,
        title: 'Welcome!',
        content: '<p>Thanks for joining! Check your email for next steps.</p>'
      }
    ]
  },
  {
    id: 'email-phone',
    name: 'Email & Phone',
    description: 'Capture email and phone without name',
    category: 'Basic',
    icon: <Briefcase className="w-6 h-6" />,
    color: 'bg-orange-500',
    estimatedTime: '20 sec',
    conversionRate: '45%',
    steps: [
      {
        step_type: StepType.FORM,
        title: 'Get In Touch',
        subtitle: 'How can we reach you?',
        fields: [
          {
            field_type: FieldType.EMAIL,
            field_name: 'email',
            label: 'Email Address',
            placeholder: 'your@email.com',
            is_required: true
          },
          {
            field_type: FieldType.PHONE,
            field_name: 'phone',
            label: 'Phone Number',
            placeholder: '(555) 555-5555',
            is_required: true
          }
        ]
      },
      {
        step_type: StepType.THANK_YOU,
        title: 'Got it!',
        content: '<p>We\'ll be in touch within 24 hours.</p>'
      }
    ]
  },
  {
    id: 'progressive-capture',
    name: 'Progressive Capture',
    description: 'Multi-step form for better conversion',
    category: 'Advanced',
    icon: <Zap className="w-6 h-6" />,
    color: 'bg-indigo-500',
    estimatedTime: '45 sec',
    conversionRate: '55%',
    steps: [
      {
        step_type: StepType.FORM,
        title: 'Step 1: Email',
        subtitle: 'Let\'s start with your email',
        fields: [
          {
            field_type: FieldType.EMAIL,
            field_name: 'email',
            label: 'Email Address',
            placeholder: 'your@email.com',
            is_required: true
          }
        ]
      },
      {
        step_type: StepType.FORM,
        title: 'Step 2: Name',
        subtitle: 'What should we call you?',
        fields: [
          {
            field_type: FieldType.TEXT,
            field_name: 'first_name',
            label: 'First Name',
            placeholder: 'John',
            is_required: true
          },
          {
            field_type: FieldType.TEXT,
            field_name: 'last_name',
            label: 'Last Name',
            placeholder: 'Smith',
            is_required: true
          }
        ]
      },
      {
        step_type: StepType.FORM,
        title: 'Step 3: Phone (Optional)',
        subtitle: 'Want faster responses?',
        fields: [
          {
            field_type: FieldType.PHONE,
            field_name: 'phone',
            label: 'Phone Number',
            placeholder: '(555) 555-5555',
            is_required: false,
            help_text: 'Optional - for urgent updates only'
          }
        ]
      },
      {
        step_type: StepType.THANK_YOU,
        title: 'All Done!',
        content: '<p>Thanks for completing the form. We\'ll be in touch soon!</p>'
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

  const categories = ['all', 'Basic', 'Advanced'];
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
