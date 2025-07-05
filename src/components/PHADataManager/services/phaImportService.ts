
import { supabase } from "@/integrations/supabase/client";
import { FieldMapping } from '../components/FieldMappingDialog';
import { sanitizeInput } from '../utils/dataValidation';

export const processPHARecord = (record: any, fieldMappings: FieldMapping[]) => {
  console.log('🔄 Processing PHA record:', record);
  console.log('📋 Field mappings:', fieldMappings);
  
  // Debug: Check all available fields in the CSV record
  console.log('📊 AVAILABLE CSV FIELDS:');
  Object.keys(record).forEach(key => {
    console.log(`  - ${key}: "${record[key]}"`);
  });
  
  // Apply field mappings to build PHA data object
  const phaData: any = {
    updated_at: new Date().toISOString()
  };

  // Map fields based on user configuration (only checked fields)
  fieldMappings.forEach(mapping => {
    if (!mapping.checked) {
      console.log(`⏭️ Skipping unchecked field: ${mapping.csvField} -> ${mapping.dbField}`);
      return; // Skip unchecked fields
    }
    
    const csvValue = record[mapping.csvField];
    console.log(`🔄 Mapping ${mapping.csvField} ("${csvValue}") -> ${mapping.dbField}`);
    
    // Handle each database field type
    switch (mapping.dbField) {
      case 'pha_code':
        phaData.pha_code = sanitizeInput(csvValue, 50);
        console.log(`✅ Mapped pha_code: ${phaData.pha_code}`);
        break;
        
      case 'name':
        phaData.name = sanitizeInput(csvValue, 255);
        console.log(`✅ Mapped name: ${phaData.name}`);
        break;
        
      case 'address':
        // Use FULL_ADDRESS directly - don't separate or combine
        phaData.address = sanitizeInput(csvValue, 500);
        console.log(`✅ Mapped full address: ${phaData.address}`);
        break;
        
      case 'phone':
        // Use HA_PHN_NUM directly - don't use city data
        phaData.phone = sanitizeInput(csvValue, 20);
        console.log(`✅ Mapped phone: ${phaData.phone}`);
        break;
        
      case 'email':
        // Use HA_EMAIL_ADDR_TEXT directly - don't use zip data
        phaData.email = sanitizeInput(csvValue, 255);
        console.log(`✅ Mapped email: ${phaData.email}`);
        break;
        
      case 'exec_dir_email':
        phaData.exec_dir_email = sanitizeInput(csvValue, 255);
        console.log(`✅ Mapped exec_dir_email: ${phaData.exec_dir_email}`);
        break;
        
      case 'program_type':
        phaData.program_type = sanitizeInput(csvValue, 100);
        console.log(`✅ Mapped program_type: ${phaData.program_type}`);
        break;
        
      default:
        console.warn(`⚠️ Unknown database field: ${mapping.dbField}`);
    }
  });

  // Validate email formats if present
  if (phaData.email && !/\S+@\S+\.\S+/.test(phaData.email)) {
    console.warn(`⚠️ Invalid email format detected: "${phaData.email}"`);
  }
  
  if (phaData.exec_dir_email && !/\S+@\S+\.\S+/.test(phaData.exec_dir_email)) {
    console.warn(`⚠️ Invalid exec_dir_email format detected: "${phaData.exec_dir_email}"`);
  }

  console.log('✅ Final PHA data object:', phaData);
  return phaData;
};

export const upsertPHARecord = async (phaData: any) => {
  console.log('💾 Starting upsert for PHA record:', phaData);
  
  // Enhanced validation - require name
  if (!phaData.name || phaData.name.trim().length === 0) {
    console.error('❌ Validation failed: PHA name is required');
    throw new Error('PHA name is required');
  }

  console.log('✅ Validation passed for PHA name:', phaData.name);

  // If pha_code is null, empty, or whitespace, we can't use ON CONFLICT
  // In this case, we'll just insert normally
  if (!phaData.pha_code || phaData.pha_code.trim().length === 0) {
    console.log('📝 Inserting record without pha_code (no ON CONFLICT)');
    const { data, error } = await supabase
      .from('pha_agencies')
      .insert(phaData)
      .select();

    if (error) {
      console.error('❌ Error inserting PHA record:', error);
      console.error('📋 Failed data:', phaData);
      // Check if it's an authentication error
      if (error.message.includes('row-level security policy')) {
        throw new Error('Authentication required for data import. Please ensure you are logged in.');
      }
      throw error;
    }
    
    console.log('✅ Successfully inserted PHA record:', data);
  } else {
    console.log('🔄 Upserting record with pha_code:', phaData.pha_code);
    // Use upsert with ON CONFLICT only when pha_code is valid
    const { data, error } = await supabase
      .from('pha_agencies')
      .upsert(phaData, { 
        onConflict: 'pha_code',
        ignoreDuplicates: false 
      })
      .select();

    if (error) {
      console.error('❌ Error upserting PHA record:', error);
      console.error('📋 Failed data:', phaData);
      console.error('🔧 Upsert config: onConflict=pha_code, ignoreDuplicates=false');
      // Check if it's an authentication error
      if (error.message.includes('row-level security policy')) {
        throw new Error('Authentication required for data import. Please ensure you are logged in.');
      }
      throw error;
    }
    
    console.log('✅ Successfully upserted PHA record:', data);
  }

  return true;
};
