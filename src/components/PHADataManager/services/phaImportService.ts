
import { supabase } from "@/integrations/supabase/client";
import { sanitizeInput, parseCoordinate } from '../utils/dataValidation';

interface FieldMapping {
  csvField: string;
  dbField: string;
}

// Helper function to validate phone numbers
const isValidPhone = (value: string): boolean => {
  if (!value) return false;
  const phoneRegex = /^\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/;
  return phoneRegex.test(value.trim());
};

// Helper function to validate email addresses
const isValidEmail = (value: string): boolean => {
  if (!value) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value.trim());
};

// Helper function to validate fax numbers (similar to phone)
const isValidFax = (value: string): boolean => {
  if (!value) return false;
  const faxRegex = /^\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/;
  return faxRegex.test(value.trim());
};

// Enhanced data type detection
const detectDataType = (value: string): string => {
  if (!value || value === 'null' || value === '') return 'empty';
  
  const trimmed = value.trim();
  
  // Phone number detection
  if (isValidPhone(trimmed)) return 'phone';
  
  // Email detection
  if (isValidEmail(trimmed)) return 'email';
  
  // Address detection (starts with number, has multiple words)
  if (/^\d+\s+[A-Za-z\s,.-]+/.test(trimmed) && trimmed.length > 10) return 'address';
  
  // City name detection (alphabetic, reasonable length)
  if (/^[A-Za-z\s]+$/.test(trimmed) && trimmed.length > 2 && trimmed.length < 50) return 'city';
  
  // State code detection
  if (/^[A-Z]{2}$/.test(trimmed)) return 'state';
  
  // ZIP code detection
  if (/^\d{5}(-\d{4})?$/.test(trimmed)) return 'zip';
  
  // PHAS designation detection
  if (/high\s*performer|standard|troubled/i.test(trimmed)) return 'phas_designation';
  
  // Size category detection
  if (/(small|medium|large)\s*\(?\d*-?\d*\)?/i.test(trimmed)) return 'size_category';
  
  // Program type detection
  if (/section\s*8|public\s*housing|mixed/i.test(trimmed)) return 'program_type';
  
  // Date detection
  if (/\d{1,2}-(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i.test(trimmed)) return 'date';
  
  // Integer detection
  if (/^\d+$/.test(trimmed)) return 'integer';
  
  // Decimal detection
  if (/^\d+\.\d+$/.test(trimmed)) return 'decimal';
  
  return 'text';
};

export const processPHARecord = (record: any, fieldMappings: FieldMapping[]) => {
  console.log('Processing PHA record with intelligent data detection:', record);
  console.log('Field mappings:', fieldMappings);
  
  const phaData: any = {
    last_updated: new Date().toISOString()
  };

  // First pass: collect all data and detect types
  const dataAnalysis: { [key: string]: { value: any, type: string, csvField: string } } = {};
  
  Object.keys(record).forEach(csvField => {
    const value = record[csvField];
    if (value && value !== 'null' && value !== '') {
      const dataType = detectDataType(value.toString());
      dataAnalysis[csvField] = {
        value: value.toString().trim(),
        type: dataType,
        csvField
      };
      console.log(`Data analysis: "${csvField}" = "${value}" -> type: ${dataType}`);
    }
  });

  // Second pass: intelligent field assignment based on data types
  const usedValues = new Set<string>();
  
  // Process mapped fields but validate against data types
  fieldMappings.forEach(mapping => {
    const analysisData = dataAnalysis[mapping.csvField];
    if (!analysisData || usedValues.has(analysisData.value)) return;
    
    const { value, type } = analysisData;
    
    console.log(`Processing mapping ${mapping.csvField} -> ${mapping.dbField} (value: "${value}", type: ${type})`);
    
    switch (mapping.dbField) {
      case 'pha_code':
        phaData.pha_code = sanitizeInput(value, 50);
        usedValues.add(value);
        break;
        
      case 'name':
        phaData.name = sanitizeInput(value, 255);
        usedValues.add(value);
        break;
        
      case 'phone':
        if (type === 'phone') {
          phaData.phone = sanitizeInput(value, 20);
          usedValues.add(value);
        } else {
          console.warn(`Expected phone for ${mapping.csvField}, got ${type}: "${value}"`);
        }
        break;
        
      case 'fax':
        if (type === 'phone') {  // Fax uses same format as phone
          phaData.fax = sanitizeInput(value, 20);
          usedValues.add(value);
        } else {
          console.warn(`Expected phone format for fax ${mapping.csvField}, got ${type}: "${value}"`);
        }
        break;
        
      case 'email':
        if (type === 'email') {
          phaData.email = sanitizeInput(value, 255);
          usedValues.add(value);
        } else {
          console.warn(`Expected email for ${mapping.csvField}, got ${type}: "${value}"`);
        }
        break;
        
      case 'exec_dir_phone':
        if (type === 'phone') {
          phaData.exec_dir_phone = sanitizeInput(value, 20);
          usedValues.add(value);
        }
        break;
        
      case 'exec_dir_fax':
        if (type === 'phone') {
          phaData.exec_dir_fax = sanitizeInput(value, 20);
          usedValues.add(value);
        }
        break;
        
      case 'exec_dir_email':
        if (type === 'email') {
          phaData.exec_dir_email = sanitizeInput(value, 255);
          usedValues.add(value);
        }
        break;
        
      case 'phas_designation':
        if (type === 'phas_designation') {
          phaData.phas_designation = sanitizeInput(value, 50);
          usedValues.add(value);
        }
        break;
        
      case 'address':
        if (type === 'address') {
          phaData.address = sanitizeInput(value, 500);
          usedValues.add(value);
        }
        break;
        
      case 'program_type':
        if (type === 'program_type' || type === 'size_category') {
          phaData.program_type = sanitizeInput(value, 100);
          usedValues.add(value);
        }
        break;
        
      case 'low_rent_size_category':
      case 'section8_size_category':
      case 'combined_size_category':
        if (type === 'size_category') {
          phaData[mapping.dbField] = sanitizeInput(value, 100);
          usedValues.add(value);
        }
        break;
        
      case 'fiscal_year_end':
        if (type === 'date' || type === 'text') {
          phaData.fiscal_year_end = sanitizeInput(value, 50);
          usedValues.add(value);
        }
        break;
        
      // Numeric fields
      case 'total_units':
      case 'total_dwelling_units':
      case 'acc_units':
      case 'ph_occupied':
      case 'section8_units_count':
      case 'section8_occupied':
      case 'total_occupied':
      case 'regular_vacant':
      case 'pha_total_units':
      case 'number_reported':
        if (type === 'integer') {
          const intValue = parseInt(value);
          if (!isNaN(intValue) && intValue >= 0 && intValue < 1000000) {
            phaData[mapping.dbField] = intValue;
            usedValues.add(value);
          }
        }
        break;
        
      case 'pct_occupied':
      case 'pct_reported':
      case 'opfund_amount':
      case 'opfund_amount_prev_yr':
      case 'capfund_amount':
        if (type === 'decimal' || type === 'integer') {
          const floatValue = parseFloat(value);
          if (!isNaN(floatValue) && floatValue >= 0) {
            phaData[mapping.dbField] = floatValue;
            usedValues.add(value);
          }
        }
        break;
    }
  });

  // Third pass: Fill in missing critical data by scanning unused values
  if (!phaData.phone) {
    // Look for unused phone numbers in the data
    Object.values(dataAnalysis).forEach(({ value, type }) => {
      if (type === 'phone' && !usedValues.has(value) && !phaData.phone) {
        phaData.phone = sanitizeInput(value, 20);
        usedValues.add(value);
        console.log(`🔧 Auto-assigned phone: ${value}`);
      }
    });
  }

  if (!phaData.email) {
    // Look for unused emails
    Object.values(dataAnalysis).forEach(({ value, type }) => {
      if (type === 'email' && !usedValues.has(value) && !phaData.email) {
        phaData.email = sanitizeInput(value, 255);
        usedValues.add(value);
        console.log(`🔧 Auto-assigned email: ${value}`);
      }
    });
  }

  if (!phaData.address) {
    // Look for unused addresses
    Object.values(dataAnalysis).forEach(({ value, type }) => {
      if (type === 'address' && !usedValues.has(value) && !phaData.address) {
        phaData.address = sanitizeInput(value, 500);
        usedValues.add(value);
        console.log(`🔧 Auto-assigned address: ${value}`);
      }
    });
  }

  // Build complete address from components if needed
  const addressComponents = [];
  let city = '', state = '', zip = '';
  
  Object.values(dataAnalysis).forEach(({ value, type }) => {
    if (!usedValues.has(value)) {
      if (type === 'city' && !city) city = value;
      else if (type === 'state' && !state) state = value;
      else if (type === 'zip' && !zip) zip = value;
    }
  });

  // Enhance address with city, state, zip if available
  if (phaData.address && (city || state || zip)) {
    const parts = [phaData.address];
    if (city) parts.push(city);
    if (state) parts.push(state);
    if (zip) parts.push(zip);
    phaData.address = parts.join(' ').trim();
    console.log(`🔧 Enhanced address: ${phaData.address}`);
  } else if (!phaData.address && (city || state || zip)) {
    const parts = [];
    if (city) parts.push(city);
    if (state) parts.push(state);
    if (zip) parts.push(zip);
    if (parts.length > 0) {
      phaData.address = parts.join(' ').trim();
      console.log(`🔧 Constructed address from parts: ${phaData.address}`);
    }
  }

  console.log('Final processed PHA data:', phaData);
  return phaData;
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
