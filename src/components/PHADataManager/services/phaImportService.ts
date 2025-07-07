
import { supabase } from "@/integrations/supabase/client";
import { FieldMapping } from '../components/FieldMappingDialog';

// Simple field mappings that match the command line script
const FIELD_MAPPINGS: { [key: string]: string } = {
  'PARTICIPANT_CODE': 'pha_code',
  'PHA_CODE': 'pha_code',
  'CODE': 'pha_code',
  'FORMAL_PARTICIPANT_NAME': 'name',
  'PARTICIPANT_NAME': 'name', 
  'PHA_NAME': 'name',
  'NAME': 'name',
  'AGENCY_NAME': 'name',
  'FULL_ADDRESS': 'address',
  'ADDRESS': 'address',
  'MAILING_ADDRESS': 'address',
  'CITY': 'city',
  'STATE': 'state',
  'ZIP': 'zip',
  'ZIP_CODE': 'zip',
  'HA_PHN_NUM': 'phone',
  'PHONE': 'phone',
  'PHONE_NUMBER': 'phone',
  'HA_EMAIL_ADDR_TEXT': 'email',
  'EMAIL': 'email',
  'EMAIL_ADDRESS': 'email',
  'EXEC_DIR_EMAIL': 'exec_dir_email',
  'HA_PROGRAM_TYPE': 'program_type',
  'WEBSITE': 'website',
  'WEB_SITE': 'website',
  'URL': 'website'
};

// Valid database columns (only include mapped columns)
const VALID_DB_COLUMNS = [
  'pha_code', 'name', 'address', 'city', 'state', 'zip', 
  'phone', 'email', 'exec_dir_email', 'website', 'program_type',
  'latitude', 'longitude', 'supports_hcv', 'waitlist_open', 
  'waitlist_status', 'jurisdictions'
];

// Simple sanitization - only trim whitespace and limit length
const sanitizeInput = (input: string | null | undefined, maxLength: number = 255): string | null => {
  if (!input) return null;
  const trimmed = input.trim();
  return trimmed.length > 0 ? trimmed.substring(0, maxLength) : null;
};

export const processPHARecord = (record: any, fieldMappings?: FieldMapping[]) => {
  console.log('🔄 Processing PHA record with simplified approach');
  
  // Use the same logic as the command line script
  const mappedRow: any = {};
  
  for (const [csvField, value] of Object.entries(record)) {
    const dbField = FIELD_MAPPINGS[csvField.toUpperCase()];
    
    // Only include columns that have explicit mappings and are valid
    if (dbField && VALID_DB_COLUMNS.includes(dbField) && value && String(value).trim()) {
      mappedRow[dbField] = sanitizeInput(String(value));
    }
  }

  console.log('✅ Mapped PHA record:', mappedRow);
  return mappedRow;
};

export const upsertPHARecord = async (phaData: any) => {
  console.log('💾 Upserting PHA record:', phaData);
  
  // Simple validation - just require name
  if (!phaData.name || phaData.name.trim().length === 0) {
    console.error('❌ PHA name is required');
    throw new Error('PHA name is required');
  }

  // Use the same upsert logic as the command line script
  const { data, error } = await supabase
    .from('pha_agencies')
    .upsert(phaData, { 
      onConflict: 'pha_code',
      ignoreDuplicates: false 
    })
    .select('id');

  if (error) {
    console.error('❌ Error upserting PHA record:', error);
    throw error;
  }
  
  console.log('✅ Successfully upserted PHA record');
  return true;
};
