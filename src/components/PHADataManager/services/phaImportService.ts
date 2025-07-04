
import { supabase } from "@/integrations/supabase/client";
import { FieldMapping } from '../components/FieldMappingDialog';
import { sanitizeInput } from '../utils/dataValidation';

export const processPHARecord = (record: any, fieldMappings: FieldMapping[]) => {
  console.log('Processing record:', record);
  console.log('Field mappings:', fieldMappings);
  
  // Apply field mappings to build PHA data object
  const phaData: any = {
    last_updated: new Date().toISOString()
  };

  // Map fields based on user configuration (only checked fields)
  fieldMappings.forEach(mapping => {
    if (!mapping.checked) return; // Skip unchecked fields
    
    const csvValue = record[mapping.csvField];
    console.log(`Mapping ${mapping.csvField} -> ${mapping.dbField} with value:`, csvValue);
    
    // Only process fields that have database mappings
    if (mapping.dbField) {
      // Clean and validate the input value
      const cleanValue = sanitizeInput(csvValue, getFieldMaxLength(mapping.dbField));
      
      // Only set non-empty values
      if (cleanValue && cleanValue.trim().length > 0) {
        switch (mapping.dbField) {
          case 'pha_code':
            phaData.pha_code = cleanValue;
            break;
          case 'name':
            phaData.name = cleanValue;
            break;
          case 'address':
            phaData.address = cleanValue;
            break;
          case 'phone':
            // Clean phone number format
            phaData.phone = cleanPhoneNumber(cleanValue);
            break;
          case 'email':
            // Validate email format
            if (isValidEmail(cleanValue)) {
              phaData.email = cleanValue.toLowerCase();
            }
            break;
          case 'exec_dir_email':
            // Validate email format
            if (isValidEmail(cleanValue)) {
              phaData.exec_dir_email = cleanValue.toLowerCase();
            }
            break;
          case 'program_type':
            phaData.program_type = cleanValue;
            break;
          case 'fax':
            phaData.fax = cleanPhoneNumber(cleanValue);
            break;
          default:
            console.log(`Field ${mapping.csvField} is checked but has no database mapping`);
            break;
        }
      }
    }
  });

  console.log('Processed PHA data:', phaData);
  return phaData;
};

// Helper function to get max length for database fields
const getFieldMaxLength = (field: string): number => {
  const maxLengths: { [key: string]: number } = {
    'pha_code': 50,
    'name': 255,
    'address': 500,
    'phone': 20,
    'email': 255,
    'exec_dir_email': 255,
    'program_type': 100,
    'fax': 20
  };
  return maxLengths[field] || 255;
};

// Helper function to clean phone numbers
const cleanPhoneNumber = (phone: string): string => {
  if (!phone) return '';
  // Remove all non-numeric characters except parentheses, hyphens, and spaces
  return phone.replace(/[^\d\(\)\-\s]/g, '').trim();
};

// Helper function to validate email addresses
const isValidEmail = (email: string): boolean => {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

export const upsertPHARecord = async (phaData: any) => {
  // Enhanced validation - require name
  if (!phaData.name || phaData.name.trim().length === 0) {
    throw new Error('PHA name is required');
  }

  const { error } = await supabase
    .from('pha_agencies')
    .upsert(phaData, { 
      onConflict: 'pha_code',
      ignoreDuplicates: false 
    });

  if (error) {
    console.error('Error upserting PHA record:', error);
    // Check if it's an authentication error
    if (error.message.includes('row-level security policy')) {
      throw new Error('Authentication required for data import. Please ensure you are logged in.');
    }
    throw error;
  }

  return true;
};
