
import { supabase } from "@/integrations/supabase/client";
import { FieldMapping } from '../components/FieldMappingDialog';
import { sanitizeInput } from '../utils/dataValidation';

export const processPHARecord = (record: any, fieldMappings: FieldMapping[]) => {
  // Apply field mappings to build PHA data object
  const phaData: any = {
    last_updated: new Date().toISOString()
  };

  // Map fields based on user configuration (only checked fields)
  fieldMappings.forEach(mapping => {
    if (!mapping.checked) return; // Skip unchecked fields
    
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
      case 'email':
        phaData.email = sanitizeInput(csvValue, 255);
        break;
      case 'exec_dir_email':
        phaData.exec_dir_email = sanitizeInput(csvValue, 255);
        break;
      case 'program_type':
        phaData.program_type = sanitizeInput(csvValue, 100);
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
