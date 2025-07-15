
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
  // Remove city, state, zip mappings since they don't exist in the CSV
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

// State name to abbreviation mapping
const STATE_ABBREVIATIONS: Record<string, string> = {
  'alabama': 'AL', 'alaska': 'AK', 'arizona': 'AZ', 'arkansas': 'AR', 'california': 'CA',
  'colorado': 'CO', 'connecticut': 'CT', 'delaware': 'DE', 'florida': 'FL', 'georgia': 'GA',
  'hawaii': 'HI', 'idaho': 'ID', 'illinois': 'IL', 'indiana': 'IN', 'iowa': 'IA',
  'kansas': 'KS', 'kentucky': 'KY', 'louisiana': 'LA', 'maine': 'ME', 'maryland': 'MD',
  'massachusetts': 'MA', 'michigan': 'MI', 'minnesota': 'MN', 'mississippi': 'MS', 'missouri': 'MO',
  'montana': 'MT', 'nebraska': 'NE', 'nevada': 'NV', 'new hampshire': 'NH', 'new jersey': 'NJ',
  'new mexico': 'NM', 'new york': 'NY', 'north carolina': 'NC', 'north dakota': 'ND', 'ohio': 'OH',
  'oklahoma': 'OK', 'oregon': 'OR', 'pennsylvania': 'PA', 'rhode island': 'RI', 'south carolina': 'SC',
  'south dakota': 'SD', 'tennessee': 'TN', 'texas': 'TX', 'utah': 'UT', 'vermont': 'VT',
  'virginia': 'VA', 'washington': 'WA', 'west virginia': 'WV', 'wisconsin': 'WI', 'wyoming': 'WY',
  'district of columbia': 'DC', 'washington dc': 'DC', 'washington d.c.': 'DC'
};

// Valid database columns (only include mapped columns)
const VALID_DB_COLUMNS = [
  'pha_code', 'name', 'address', 'city', 'state', 'zip', 
  'phone', 'email', 'exec_dir_email', 'website', 'program_type',
  'latitude', 'longitude', 'supports_hcv', 
  'jurisdictions'
];

// Simple sanitization - only trim whitespace and limit length
const sanitizeInput = (input: string | null | undefined, maxLength: number = 255): string | null => {
  if (!input) return null;
  const trimmed = input.trim();
  return trimmed.length > 0 ? trimmed.substring(0, maxLength) : null;
};

// Standardize state to 2-letter abbreviation
const standardizeState = (state: string | null | undefined): string | null => {
  if (!state) return null;
  
  const trimmed = state.trim();
  if (trimmed.length === 0) return null;
  
  // If already 2 letters, just uppercase it
  if (trimmed.length === 2) {
    return trimmed.toUpperCase();
  }
  
  // Try to find the abbreviation for the full state name
  const stateLower = trimmed.toLowerCase();
  return STATE_ABBREVIATIONS[stateLower] || trimmed.substring(0, 2).toUpperCase();
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

  // Always parse city/state/zip from the address since they don't exist as separate fields in the CSV
  if (mappedRow.address) {
    console.log('🏙️ Parsing city/state/zip from address:', mappedRow.address);
    
    // Clean up "nan" placeholder in addresses
    if (mappedRow.address.toLowerCase().startsWith('nan,')) {
      mappedRow.address = mappedRow.address.substring(4).trim();
    }
    
    // Parse address in format: "Street, City, State, Zip" or "City, State, Zip"
    const addressParts = mappedRow.address.split(',').map((part: string) => part.trim());
    
    if (addressParts.length >= 2) {
      // Handle different address formats
      let cityIndex = -1;
      let stateZipIndex = -1;
      
      // Find the state/zip part (format: "ST 12345" or "ST, 12345" or just "ST")
      for (let i = addressParts.length - 1; i >= 0; i--) {
        const part = addressParts[i];
        // Check if this is just a zip code (last part)
        if (i === addressParts.length - 1 && part.match(/^\d{5}(-\d{4})?$/)) {
          // Zip is separate, state should be the previous part
          if (i > 0 && addressParts[i-1].match(/^[A-Z]{2}$/)) {
            stateZipIndex = i - 1;
            cityIndex = i - 2;
            mappedRow.state = standardizeState(addressParts[i-1]);
            mappedRow.zip = part;
            break;
          }
        }
        // Check for state + zip format (with space)
        else if (part.match(/^[A-Z]{2}\s+\d{5}(-\d{4})?$/)) {
          stateZipIndex = i;
          cityIndex = i - 1;
          break;
        }
        // Check for just state code at the end (in case zip is missing)
        else if (i === addressParts.length - 1 && part.match(/^[A-Z]{2}$/)) {
          stateZipIndex = i;
          cityIndex = i - 1;
          break;
        }
      }
      
      // Extract city
      if (cityIndex >= 0 && cityIndex < addressParts.length) {
        mappedRow.city = addressParts[cityIndex];
      }
      
      // Extract state and zip
      if (stateZipIndex >= 0) {
        const stateZipPart = addressParts[stateZipIndex];
        
        // Try to match state + zip
        const stateZipMatch = stateZipPart.match(/^([A-Z]{2})\s+(\d{5}(-\d{4})?)$/);
        if (stateZipMatch) {
          mappedRow.state = standardizeState(stateZipMatch[1]);
          mappedRow.zip = stateZipMatch[2];
        } else {
          // Just state code
          const stateMatch = stateZipPart.match(/^([A-Z]{2})$/);
          if (stateMatch) {
            mappedRow.state = standardizeState(stateMatch[1]);
          }
        }
      }
      
      // If we still don't have a state, check if any part contains a full state name
      if (!mappedRow.state) {
        for (const part of addressParts) {
          const standardized = standardizeState(part);
          if (standardized && standardized.length === 2) {
            mappedRow.state = standardized;
            break;
          }
        }
      }
      
      console.log('✅ Parsed location:', { 
        city: mappedRow.city, 
        state: mappedRow.state, 
        zip: mappedRow.zip 
      });
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
