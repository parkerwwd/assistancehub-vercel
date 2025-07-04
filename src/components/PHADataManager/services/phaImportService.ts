
import { supabase } from "@/integrations/supabase/client";
import { sanitizeInput, parseCoordinate } from '../utils/dataValidation';

interface FieldMapping {
  csvField: string;
  dbField: string;
}

export const processPHARecord = (record: any, fieldMappings: FieldMapping[]) => {
  // Apply field mappings to build PHA data object
  const phaData: any = {
    last_updated: new Date().toISOString()
  };

  // Map fields based on auto-generated configuration
  fieldMappings.forEach(mapping => {
    const csvValue = record[mapping.csvField];
    
    switch (mapping.dbField) {
      case 'pha_code':
        phaData.pha_code = sanitizeInput(csvValue, 50);
        break;
      case 'name':
        phaData.name = sanitizeInput(csvValue, 255);
        break;
      case 'address':
        phaData.address = sanitizeInput(csvValue, 500);
        break;
      case 'phone':
        phaData.phone = sanitizeInput(csvValue, 20);
        break;
      case 'fax':
        phaData.fax = sanitizeInput(csvValue, 20);
        break;
      case 'email':
        phaData.email = sanitizeInput(csvValue, 255);
        break;
      case 'exec_dir_phone':
        phaData.exec_dir_phone = sanitizeInput(csvValue, 20);
        break;
      case 'exec_dir_fax':
        phaData.exec_dir_fax = sanitizeInput(csvValue, 20);
        break;
      case 'exec_dir_email':
        phaData.exec_dir_email = sanitizeInput(csvValue, 255);
        break;
      case 'phas_designation':
        phaData.phas_designation = sanitizeInput(csvValue, 50);
        break;
      case 'total_units':
        phaData.total_units = csvValue ? parseInt(csvValue.toString()) || null : null;
        break;
      case 'total_dwelling_units':
        phaData.total_dwelling_units = csvValue ? parseInt(csvValue.toString()) || null : null;
        break;
      case 'acc_units':
        phaData.acc_units = csvValue ? parseInt(csvValue.toString()) || null : null;
        break;
      case 'ph_occupied':
        phaData.ph_occupied = csvValue ? parseInt(csvValue.toString()) || null : null;
        break;
      case 'section8_units_count':
        phaData.section8_units_count = csvValue ? parseInt(csvValue.toString()) || null : null;
        break;
      case 'section8_occupied':
        phaData.section8_occupied = csvValue ? parseInt(csvValue.toString()) || null : null;
        break;
      case 'total_occupied':
        phaData.total_occupied = csvValue ? parseInt(csvValue.toString()) || null : null;
        break;
      case 'pct_occupied':
        phaData.pct_occupied = csvValue ? parseFloat(csvValue.toString()) || null : null;
        break;
      case 'regular_vacant':
        phaData.regular_vacant = csvValue ? parseInt(csvValue.toString()) || null : null;
        break;
      case 'pha_total_units':
        phaData.pha_total_units = csvValue ? parseInt(csvValue.toString()) || null : null;
        break;
      case 'number_reported':
        phaData.number_reported = csvValue ? parseInt(csvValue.toString()) || null : null;
        break;
      case 'pct_reported':
        phaData.pct_reported = csvValue ? parseFloat(csvValue.toString()) || null : null;
        break;
      case 'opfund_amount':
        phaData.opfund_amount = csvValue ? parseFloat(csvValue.toString()) || null : null;
        break;
      case 'opfund_amount_prev_yr':
        phaData.opfund_amount_prev_yr = csvValue ? parseFloat(csvValue.toString()) || null : null;
        break;
      case 'capfund_amount':
        phaData.capfund_amount = csvValue ? parseFloat(csvValue.toString()) || null : null;
        break;
      case 'program_type':
        phaData.program_type = sanitizeInput(csvValue, 100);
        break;
      case 'low_rent_size_category':
        phaData.low_rent_size_category = sanitizeInput(csvValue, 50);
        break;
      case 'section8_size_category':
        phaData.section8_size_category = sanitizeInput(csvValue, 50);
        break;
      case 'combined_size_category':
        phaData.combined_size_category = sanitizeInput(csvValue, 50);
        break;
      case 'fiscal_year_end':
        phaData.fiscal_year_end = sanitizeInput(csvValue, 20);
        break;
    }
  });

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
