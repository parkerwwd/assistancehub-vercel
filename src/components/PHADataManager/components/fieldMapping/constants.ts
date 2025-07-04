
// Field mapping constants for HUD CSV import
export interface FieldMapping {
  csvField: string;
  dbField: string;
  required?: boolean;
  dataType?: 'text' | 'integer' | 'decimal' | 'phone' | 'email';
}

// Standard HUD CSV field mappings - based on actual HUD format
export const DEFAULT_FIELD_MAPPINGS: FieldMapping[] = [
  // Basic PHA Information
  { csvField: 'PARTICIPANT_CODE', dbField: 'pha_code', dataType: 'text' },
  { csvField: 'FORMAL_PARTICIPANT_NAME', dbField: 'name', required: true, dataType: 'text' },
  { csvField: 'FULL_ADDRESS', dbField: 'address', dataType: 'text' },
  
  // Contact Information
  { csvField: 'HA_PHN_NUM', dbField: 'phone', dataType: 'phone' },
  { csvField: 'HA_FAX_NUM', dbField: 'fax', dataType: 'phone' },
  { csvField: 'HA_EMAIL_ADDR_TEXT', dbField: 'email', dataType: 'email' },
  
  // Executive Director Information
  { csvField: 'EXEC_DIR_PHONE', dbField: 'exec_dir_phone', dataType: 'phone' },
  { csvField: 'EXEC_DIR_FAX', dbField: 'exec_dir_fax', dataType: 'phone' },
  { csvField: 'EXEC_DIR_EMAIL', dbField: 'exec_dir_email', dataType: 'email' },
  
  // Program Information
  { csvField: 'PHAS_DESIGNATION', dbField: 'phas_designation', dataType: 'text' },
  { csvField: 'HA_PROGRAM_TYPE', dbField: 'program_type', dataType: 'text' },
  
  // Size Categories
  { csvField: 'HA_LOW_RENT_SIZE_CATEGORY', dbField: 'low_rent_size_category', dataType: 'text' },
  { csvField: 'HA_SECTION_8_SIZE_CATEGORY', dbField: 'section8_size_category', dataType: 'text' },
  { csvField: 'HA_COMBINED_SIZE_CATEGORY', dbField: 'combined_size_category', dataType: 'text' },
  
  // Financial Information
  { csvField: 'HA_FYE', dbField: 'fiscal_year_end', dataType: 'text' },
  
  // Unit Counts
  { csvField: 'TOTAL_UNITS', dbField: 'total_units', dataType: 'integer' },
  { csvField: 'TOTAL_DWELLING_UNITS', dbField: 'total_dwelling_units', dataType: 'integer' },
  { csvField: 'ACC_UNITS', dbField: 'acc_units', dataType: 'integer' },
  { csvField: 'PH_OCCUPIED', dbField: 'ph_occupied', dataType: 'integer' },
  { csvField: 'SECTION8_UNITS_CNT', dbField: 'section8_units_count', dataType: 'integer' },
  { csvField: 'SECTION8_OCCUPIED', dbField: 'section8_occupied', dataType: 'integer' },
  { csvField: 'TOTAL_OCCUPIED', dbField: 'total_occupied', dataType: 'integer' },
  { csvField: 'REGULAR_VACANT', dbField: 'regular_vacant', dataType: 'integer' },
  { csvField: 'PHA_TOTAL_UNITS', dbField: 'pha_total_units', dataType: 'integer' },
  { csvField: 'NUMBER_REPORTED', dbField: 'number_reported', dataType: 'integer' },
  
  // Percentages
  { csvField: 'PCT_OCCUPIED', dbField: 'pct_occupied', dataType: 'decimal' },
  { csvField: 'PCT_REPORTED', dbField: 'pct_reported', dataType: 'decimal' },
  
  // Financial Amounts
  { csvField: 'OPFUND_AMNT', dbField: 'opfund_amount', dataType: 'decimal' },
  { csvField: 'OPFUND_AMNT_PREV_YR', dbField: 'opfund_amount_prev_yr', dataType: 'decimal' },
  { csvField: 'CAPFUND_AMNT', dbField: 'capfund_amount', dataType: 'decimal' }
];

// Analyze CSV structure and create intelligent mappings
export const analyzeCSVStructure = (csvData: any[]): FieldMapping[] => {
  if (!csvData || csvData.length === 0) return DEFAULT_FIELD_MAPPINGS;
  
  const headers = Object.keys(csvData[0]);
  console.log('CSV Headers found:', headers);
  
  // Create mappings based on exact header matches
  const mappings: FieldMapping[] = [];
  
  DEFAULT_FIELD_MAPPINGS.forEach(defaultMapping => {
    if (headers.includes(defaultMapping.csvField)) {
      mappings.push(defaultMapping);
      console.log(`✅ Matched: ${defaultMapping.csvField} -> ${defaultMapping.dbField}`);
    } else {
      console.log(`⚠️ Missing CSV field: ${defaultMapping.csvField}`);
    }
  });
  
  console.log(`Created ${mappings.length} field mappings from ${headers.length} CSV headers`);
  return mappings;
};
