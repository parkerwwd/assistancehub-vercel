
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

// Helper function to check if a value looks like a ZIP code
const isZipCode = (value: string): boolean => {
  if (!value) return false;
  const zipRegex = /^\d{5}(-\d{4})?$/;
  return zipRegex.test(value.trim());
};

// Helper function to check if a value looks like a state abbreviation
const isStateCode = (value: string): boolean => {
  if (!value) return false;
  const stateRegex = /^[A-Z]{2}$/;
  return stateRegex.test(value.trim());
};

// Helper function to check if a value looks like a city name
const isCityName = (value: string): boolean => {
  if (!value) return false;
  const cityRegex = /^[A-Za-z\s]+$/;
  return cityRegex.test(value.trim()) && value.trim().length > 1;
};

export const processPHARecord = (record: any, fieldMappings: FieldMapping[]) => {
  console.log('Processing PHA record:', record);
  console.log('Field mappings:', fieldMappings);
  
  // Apply field mappings to build PHA data object
  const phaData: any = {
    last_updated: new Date().toISOString()
  };

  // First, collect all raw field data to analyze for misalignment
  const rawData: { [key: string]: any } = {};
  
  // Map fields based on configuration but validate the data
  fieldMappings.forEach(mapping => {
    const csvValue = record[mapping.csvField];
    rawData[mapping.dbField] = csvValue;
    console.log(`Raw mapping ${mapping.csvField} -> ${mapping.dbField}: "${csvValue}"`);
  });

  // Now apply intelligent validation and correction
  fieldMappings.forEach(mapping => {
    const csvValue = record[mapping.csvField];
    console.log(`Processing ${mapping.csvField} -> ${mapping.dbField}: "${csvValue}"`);
    
    if (!csvValue || csvValue === 'null' || csvValue === '') {
      return; // Skip empty values
    }

    switch (mapping.dbField) {
      case 'pha_code':
        phaData.pha_code = sanitizeInput(csvValue, 50);
        break;
        
      case 'name':
        phaData.name = sanitizeInput(csvValue, 255);
        break;
        
      case 'phone':
        // Validate that this looks like a phone number
        if (isValidPhone(csvValue)) {
          phaData.phone = sanitizeInput(csvValue, 20);
        } else {
          console.warn(`Invalid phone number detected: "${csvValue}", skipping`);
        }
        break;
        
      case 'fax':
        // Validate that this looks like a fax number
        if (isValidFax(csvValue)) {
          phaData.fax = sanitizeInput(csvValue, 20);
        } else {
          console.warn(`Invalid fax number detected: "${csvValue}", skipping`);
        }
        break;
        
      case 'email':
        // Validate that this looks like an email
        if (isValidEmail(csvValue)) {
          phaData.email = sanitizeInput(csvValue, 255);
        } else {
          console.warn(`Invalid email detected: "${csvValue}", skipping`);
        }
        break;
        
      case 'exec_dir_phone':
        if (isValidPhone(csvValue)) {
          phaData.exec_dir_phone = sanitizeInput(csvValue, 20);
        } else {
          console.warn(`Invalid exec director phone detected: "${csvValue}", skipping`);
        }
        break;
        
      case 'exec_dir_fax':
        if (isValidFax(csvValue)) {
          phaData.exec_dir_fax = sanitizeInput(csvValue, 20);
        } else {
          console.warn(`Invalid exec director fax detected: "${csvValue}", skipping`);
        }
        break;
        
      case 'exec_dir_email':
        if (isValidEmail(csvValue)) {
          phaData.exec_dir_email = sanitizeInput(csvValue, 255);
        } else {
          console.warn(`Invalid exec director email detected: "${csvValue}", skipping`);
        }
        break;
        
      case 'phas_designation':
        // PHAS designation should be text like "High Performer", not a phone number
        if (!isValidPhone(csvValue)) {
          phaData.phas_designation = sanitizeInput(csvValue, 50);
        } else {
          console.warn(`PHAS designation looks like phone number: "${csvValue}", skipping`);
        }
        break;
        
      case 'address':
        // Address should not be just a ZIP code or state code
        if (!isZipCode(csvValue) && !isStateCode(csvValue)) {
          phaData.address = sanitizeInput(csvValue, 500);
        } else {
          console.warn(`Address looks like ZIP/state code: "${csvValue}", skipping`);
        }
        break;
        
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
        // Validate numeric fields
        const intValue = parseInt(csvValue.toString());
        if (!isNaN(intValue) && intValue >= 0 && intValue < 1000000) {
          phaData[mapping.dbField] = intValue;
        } else {
          console.warn(`Invalid integer value for ${mapping.dbField}: "${csvValue}"`);
        }
        break;
        
      case 'pct_occupied':
      case 'pct_reported':
      case 'opfund_amount':
      case 'opfund_amount_prev_yr':
      case 'capfund_amount':
        // Validate decimal fields
        const floatValue = parseFloat(csvValue.toString());
        if (!isNaN(floatValue) && floatValue >= 0) {
          phaData[mapping.dbField] = floatValue;
        } else {
          console.warn(`Invalid decimal value for ${mapping.dbField}: "${csvValue}"`);
        }
        break;
        
      case 'program_type':
      case 'low_rent_size_category':
      case 'section8_size_category':
      case 'combined_size_category':
      case 'fiscal_year_end':
        phaData[mapping.dbField] = sanitizeInput(csvValue, 100);
        break;
        
      default:
        console.warn(`Unknown field mapping: ${mapping.dbField}`);
    }
  });

  // Smart address reconstruction from separate components
  let fullAddress = phaData.address || '';
  let city = '', state = '', zip = '';

  // Look for city, state, zip in the raw CSV data
  Object.keys(record).forEach(key => {
    const upperKey = key.toUpperCase().trim();
    const value = record[key];
    
    if (value && value.toString().trim()) {
      const trimmedValue = value.toString().trim();
      
      // Detect city, state, zip patterns
      if ((upperKey.includes('CITY') || isCityName(trimmedValue)) && !city) {
        city = trimmedValue;
      } else if ((upperKey.includes('STATE') || isStateCode(trimmedValue)) && !state) {
        state = trimmedValue;
      } else if ((upperKey.includes('ZIP') || upperKey.includes('POSTAL') || isZipCode(trimmedValue)) && !zip) {
        zip = trimmedValue;
      }
    }
  });

  // Build complete address if we have components
  if (fullAddress || city || state || zip) {
    const addressParts = [];
    if (fullAddress && !isZipCode(fullAddress) && !isStateCode(fullAddress)) {
      addressParts.push(fullAddress);
    }
    if (city && city !== fullAddress) addressParts.push(city);
    if (state && state !== fullAddress) addressParts.push(state);
    if (zip && zip !== fullAddress) addressParts.push(zip);
    
    if (addressParts.length > 0) {
      phaData.address = addressParts.join(' ').trim();
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
