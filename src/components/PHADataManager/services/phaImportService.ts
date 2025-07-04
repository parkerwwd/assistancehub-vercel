
import { supabase } from "@/integrations/supabase/client";
import { sanitizeInput } from '../utils/dataValidation';

interface FieldMapping {
  csvField: string;
  dbField: string;
  required?: boolean;
  dataType?: 'text' | 'integer' | 'decimal' | 'phone' | 'email';
}

// Enhanced data validation functions
const isValidPhone = (value: string): boolean => {
  if (!value) return false;
  const phoneRegex = /^\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/;
  return phoneRegex.test(value.trim());
};

const isValidEmail = (value: string): boolean => {
  if (!value) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value.trim());
};

const parseInteger = (value: string): number | null => {
  if (!value || value === 'null' || value === '') return null;
  const parsed = parseInt(value);
  return isNaN(parsed) ? null : parsed;
};

const parseDecimal = (value: string): number | null => {
  if (!value || value === 'null' || value === '') return null;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? null : parsed;
};

export const processPHARecord = (record: any, fieldMappings: FieldMapping[]) => {
  console.log('Processing PHA record with field mappings:', record);
  
  const phaData: any = {
    last_updated: new Date().toISOString()
  };

  // Process each field mapping
  fieldMappings.forEach(mapping => {
    const csvValue = record[mapping.csvField];
    
    // Skip null, undefined, or empty values
    if (!csvValue || csvValue === 'null' || csvValue === '') {
      return;
    }

    const trimmedValue = csvValue.toString().trim();
    console.log(`Processing ${mapping.csvField} -> ${mapping.dbField}: "${trimmedValue}"`);

    try {
      switch (mapping.dataType) {
        case 'phone':
          if (isValidPhone(trimmedValue)) {
            phaData[mapping.dbField] = sanitizeInput(trimmedValue, 20);
            console.log(`✅ Valid phone: ${trimmedValue}`);
          } else {
            console.warn(`❌ Invalid phone format: ${trimmedValue}`);
          }
          break;

        case 'email':
          if (isValidEmail(trimmedValue)) {
            phaData[mapping.dbField] = sanitizeInput(trimmedValue, 255);
            console.log(`✅ Valid email: ${trimmedValue}`);
          } else {
            console.warn(`❌ Invalid email format: ${trimmedValue}`);
          }
          break;

        case 'integer':
          const intValue = parseInteger(trimmedValue);
          if (intValue !== null && intValue >= 0) {
            phaData[mapping.dbField] = intValue;
            console.log(`✅ Valid integer: ${intValue}`);
          } else {
            console.warn(`❌ Invalid integer: ${trimmedValue}`);
          }
          break;

        case 'decimal':
          const decimalValue = parseDecimal(trimmedValue);
          if (decimalValue !== null && decimalValue >= 0) {
            phaData[mapping.dbField] = decimalValue;
            console.log(`✅ Valid decimal: ${decimalValue}`);
          } else {
            console.warn(`❌ Invalid decimal: ${trimmedValue}`);
          }
          break;

        case 'text':
        default:
          // For text fields, just sanitize and store
          phaData[mapping.dbField] = sanitizeInput(trimmedValue, 500);
          console.log(`✅ Text field: ${trimmedValue}`);
          break;
      }
    } catch (error) {
      console.error(`Error processing field ${mapping.csvField}:`, error);
    }
  });

  // Ensure we have at least a name (required field)
  if (!phaData.name) {
    throw new Error('PHA name is required but not found in data');
  }

  console.log('Final processed PHA data:', phaData);
  return phaData;
};

export const upsertPHARecord = async (phaData: any) => {
  // Validate required fields
  if (!phaData.name || phaData.name.trim().length === 0) {
    throw new Error('PHA name is required');
  }

  try {
    // First, try to find existing record by pha_code if it exists
    if (phaData.pha_code) {
      const { data: existingRecord } = await supabase
        .from('pha_agencies')
        .select('id')
        .eq('pha_code', phaData.pha_code)
        .maybeSingle();

      if (existingRecord) {
        // Update existing record
        const { error } = await supabase
          .from('pha_agencies')
          .update(phaData)
          .eq('id', existingRecord.id);

        if (error) {
          console.error('Error updating PHA record:', error);
          throw error;
        }
        console.log('✅ Updated existing PHA record');
        return true;
      }
    }

    // Insert new record
    const { error } = await supabase
      .from('pha_agencies')
      .insert(phaData);

    if (error) {
      console.error('Error inserting PHA record:', error);
      if (error.message.includes('row-level security policy')) {
        throw new Error('Authentication required for data import. Please ensure you are logged in.');
      }
      throw error;
    }

    console.log('✅ Inserted new PHA record');
    return true;
  } catch (error) {
    console.error('Error in upsertPHARecord:', error);
    throw error;
  }
};
