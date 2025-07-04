
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

// Smart field detection based on data content
const detectFieldType = (value: string): 'phone' | 'email' | 'integer' | 'decimal' | 'text' => {
  if (!value || value === 'null' || value === '') return 'text';
  
  const trimmedValue = value.toString().trim();
  
  // Check for email pattern
  if (isValidEmail(trimmedValue)) return 'email';
  
  // Check for phone pattern
  if (isValidPhone(trimmedValue)) return 'phone';
  
  // Check for integer
  const intValue = parseInt(trimmedValue);
  if (!isNaN(intValue) && intValue.toString() === trimmedValue) return 'integer';
  
  // Check for decimal
  const floatValue = parseFloat(trimmedValue);
  if (!isNaN(floatValue) && floatValue.toString() === trimmedValue) return 'decimal';
  
  return 'text';
};

// Intelligent field mapping based on content analysis
const createIntelligentMapping = (record: any): FieldMapping[] => {
  const mappings: FieldMapping[] = [];
  const csvFields = Object.keys(record);
  
  console.log('🔍 Analyzing CSV structure with intelligent mapping...');
  console.log('Available CSV fields:', csvFields);
  
  // Required field: Find the name field
  const nameFields = csvFields.filter(field => 
    field.toLowerCase().includes('name') || 
    field.toLowerCase().includes('participant')
  );
  
  if (nameFields.length > 0) {
    mappings.push({
      csvField: nameFields[0],
      dbField: 'name',
      required: true,
      dataType: 'text'
    });
    console.log(`✅ Mapped name: ${nameFields[0]} -> name`);
  }
  
  // Map other fields based on content analysis
  csvFields.forEach(csvField => {
    if (nameFields.includes(csvField)) return; // Skip already mapped name field
    
    const value = record[csvField];
    if (!value || value === 'null' || value === '') return;
    
    const detectedType = detectFieldType(value);
    const fieldLower = csvField.toLowerCase();
    
    // Map based on field name patterns and detected content
    if (fieldLower.includes('code') && detectedType === 'text') {
      mappings.push({ csvField, dbField: 'pha_code', dataType: 'text' });
    } else if (fieldLower.includes('address') && detectedType === 'text') {
      mappings.push({ csvField, dbField: 'address', dataType: 'text' });
    } else if (detectedType === 'phone') {
      // Map phone numbers intelligently
      if (fieldLower.includes('exec') || fieldLower.includes('dir')) {
        mappings.push({ csvField, dbField: 'exec_dir_phone', dataType: 'phone' });
      } else if (fieldLower.includes('fax')) {
        mappings.push({ csvField, dbField: 'fax', dataType: 'phone' });
      } else {
        mappings.push({ csvField, dbField: 'phone', dataType: 'phone' });
      }
    } else if (detectedType === 'email') {
      // Map email addresses intelligently
      if (fieldLower.includes('exec') || fieldLower.includes('dir')) {
        mappings.push({ csvField, dbField: 'exec_dir_email', dataType: 'email' });
      } else {
        mappings.push({ csvField, dbField: 'email', dataType: 'email' });
      }
    } else if (detectedType === 'integer') {
      // Map integer fields based on name patterns
      if (fieldLower.includes('total') && fieldLower.includes('unit')) {
        mappings.push({ csvField, dbField: 'total_units', dataType: 'integer' });
      } else if (fieldLower.includes('occupied')) {
        mappings.push({ csvField, dbField: 'total_occupied', dataType: 'integer' });
      } else if (fieldLower.includes('section8')) {
        mappings.push({ csvField, dbField: 'section8_units_count', dataType: 'integer' });
      }
    } else if (detectedType === 'decimal') {
      // Map decimal fields
      if (fieldLower.includes('pct') || fieldLower.includes('percent')) {
        mappings.push({ csvField, dbField: 'pct_occupied', dataType: 'decimal' });
      } else if (fieldLower.includes('amount') || fieldLower.includes('fund')) {
        mappings.push({ csvField, dbField: 'opfund_amount', dataType: 'decimal' });
      }
    }
    
    console.log(`🔍 Field: ${csvField}, Value: "${value}", Detected: ${detectedType}`);
  });
  
  console.log(`✅ Created ${mappings.length} intelligent mappings`);
  return mappings;
};

export const processPHARecord = (record: any, fieldMappings?: FieldMapping[]) => {
  console.log('Processing PHA record with intelligent mapping:', record);
  
  // Use intelligent mapping if no mappings provided or if mappings seem incorrect
  const mappings = fieldMappings && fieldMappings.length > 0 ? fieldMappings : createIntelligentMapping(record);
  
  const phaData: any = {
    last_updated: new Date().toISOString()
  };

  // Process each field mapping
  mappings.forEach(mapping => {
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
