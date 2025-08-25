import { FlowService } from '@/services/flowService';
import { FlowPayload, validateFlowPayload } from '@/types/flowSchema';
import { createDefaultStep } from '@/components/LeadFlow/stepRegistry';

/**
 * Test utilities for the new flow system
 * Use these functions to verify the overhaul is working correctly
 */

export const TestFlowSystem = {
  /**
   * Create a test flow to verify the new system works
   */
  async createTestFlow(): Promise<{ success: boolean; flowId?: string; errors?: string[] }> {
    try {
      console.log('🧪 Creating test flow...');

      const testFlow: FlowPayload = {
        name: 'Test Flow - Enhanced System',
        slug: `test-flow-${Date.now()}`,
        description: 'Test flow created by the enhanced system',
        status: 'draft',
        settings: {
          allowBack: true,
          showProgress: true,
          saveProgress: false,
          requireAuth: false,
          captureUtm: true,
          trackAnalytics: true,
        },
        google_ads_config: {
          conversionId: '',
          conversionLabel: '',
          remarketingTag: false,
          enhancedConversions: false,
        },
        style_config: {
          primaryColor: '#10B981',
          backgroundColor: '#FFFFFF',
          buttonStyle: 'rounded',
          layout: 'centered',
          fontFamily: 'Inter',
          borderRadius: 8,
          shadowLevel: 'md',
        },
        steps: [
          {
            ...createDefaultStep('form', 1),
            title: 'Contact Information',
            subtitle: 'Please provide your details',
            fields: [
              {
                id: 'field-1',
                field_type: 'text',
                field_name: 'firstName',
                label: 'First Name',
                placeholder: 'Enter your first name',
                is_required: true,
                validation_rules: {
                  required: true,
                  minLength: 2,
                  message: 'First name must be at least 2 characters'
                },
              },
              {
                id: 'field-2',
                field_type: 'email',
                field_name: 'email',
                label: 'Email Address',
                placeholder: 'your@email.com',
                is_required: true,
                validation_rules: {
                  required: true,
                  pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$',
                  message: 'Please enter a valid email address'
                },
              }
            ]
          },
          {
            ...createDefaultStep('thank_you', 2),
            title: 'Thank You!',
            content: 'Your information has been received successfully.',
            button_text: 'Done'
          }
        ],
        logic: [],
        metadata: {
          category: 'test',
          tags: ['test', 'enhanced-system'],
          estimatedTime: 2,
          difficulty: 'easy'
        }
      };

      // Validate the test flow
      const validation = validateFlowPayload(testFlow);
      if (!validation.success) {
        return {
          success: false,
          errors: validation.errors
        };
      }

      // Save the test flow
      const result = await FlowService.saveDraft(null, testFlow);
      if (!result.success) {
        return {
          success: false,
          errors: result.errors
        };
      }

      console.log('✅ Test flow created successfully:', result.data?.flowId);
      return {
        success: true,
        flowId: result.data?.flowId
      };

    } catch (error) {
      console.error('❌ Test flow creation failed:', error);
      return {
        success: false,
        errors: [(error as Error).message]
      };
    }
  },

  /**
   * Test flow loading and validation
   */
  async testFlowLoading(slug: string): Promise<{ success: boolean; errors?: string[] }> {
    try {
      console.log('🧪 Testing flow loading for slug:', slug);

      const result = await FlowService.getPublishedBySlug(slug);
      
      if (!result.success) {
        return {
          success: false,
          errors: result.errors
        };
      }

      if (!result.data) {
        return {
          success: false,
          errors: ['No flow data returned']
        };
      }

      // Validate the loaded flow
      const validation = validateFlowPayload(result.data.payload);
      if (!validation.success) {
        return {
          success: false,
          errors: validation.errors
        };
      }

      console.log('✅ Flow loading test passed');
      return { success: true };

    } catch (error) {
      console.error('❌ Flow loading test failed:', error);
      return {
        success: false,
        errors: [(error as Error).message]
      };
    }
  },

  /**
   * Run comprehensive system tests
   */
  async runSystemTests(): Promise<{
    success: boolean;
    results: Array<{ test: string; success: boolean; errors?: string[] }>;
  }> {
    const results = [];

    // Test 1: Create test flow
    console.log('🧪 Running system tests...');
    const createResult = await this.createTestFlow();
    results.push({
      test: 'Create Test Flow',
      success: createResult.success,
      errors: createResult.errors
    });

    // Test 2: Validate flow schema
    try {
      const testPayload: FlowPayload = {
        name: 'Schema Test',
        slug: 'schema-test',
        status: 'draft',
        settings: {},
        google_ads_config: {},
        style_config: {},
        steps: [],
        logic: [],
        metadata: {}
      };

      const validation = validateFlowPayload(testPayload);
      results.push({
        test: 'Schema Validation',
        success: validation.success,
        errors: validation.errors
      });
    } catch (error) {
      results.push({
        test: 'Schema Validation',
        success: false,
        errors: [(error as Error).message]
      });
    }

    const allPassed = results.every(r => r.success);
    
    if (allPassed) {
      console.log('✅ All system tests passed!');
    } else {
      console.error('❌ Some system tests failed:', results.filter(r => !r.success));
    }

    return {
      success: allPassed,
      results
    };
  }
};
