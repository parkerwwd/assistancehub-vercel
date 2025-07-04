
// Field mapping constants for HUD CSV import
export interface FieldMapping {
  csvField: string;
  dbField: string;
  required?: boolean;
  dataType?: 'text' | 'integer' | 'decimal' | 'phone' | 'email';
}

// Database field definitions
export interface DatabaseField {
  key: string;
  label: string;
  description: string;
  required?: boolean;
  dataType?: 'text' | 'integer' | 'decimal' | 'phone' | 'email';
}

// Available database fields for mapping
export const DATABASE_FIELDS: DatabaseField[] = [
  // Basic PHA Information
  { key: 'pha_code', label: 'PHA Code', description: 'Public Housing Authority identifier code', dataType: 'text' },
  { key: 'name', label: 'PHA Name', description: 'Official name of the Public Housing Authority', required: true, dataType: 'text' },
  { key: 'address', label: 'Address', description: 'Full address of the PHA', dataType: 'text' },
  
  // Contact Information
  { key: 'phone', label: 'Phone', description: 'Main phone number', dataType: 'phone' },
  { key: 'fax', label: 'Fax', description: 'Fax number', dataType: 'phone' },
  { key: 'email', label: 'Email', description: 'Email address', dataType: 'email' },
  
  // Executive Director Information
  { key: 'exec_dir_phone', label: 'Executive Director Phone', description: 'Executive director phone number', dataType: 'phone' },
  { key: 'exec_dir_fax', label: 'Executive Director Fax', description: 'Executive director fax number', dataType: 'phone' },
  { key: 'exec_dir_email', label: 'Executive Director Email', description: 'Executive director email address', dataType: 'email' },
  
  // Program Information
  { key: 'phas_designation', label: 'PHAS Designation', description: 'Public Housing Assessment System designation', dataType: 'text' },
  { key: 'program_type', label: 'Program Type', description: 'Type of housing program', dataType: 'text' },
  
  // Size Categories
  { key: 'low_rent_size_category', label: 'Low Rent Size Category', description: 'Size category for low rent housing', dataType: 'text' },
  { key: 'section8_size_category', label: 'Section 8 Size Category', description: 'Size category for Section 8 housing', dataType: 'text' },
  { key: 'combined_size_category', label: 'Combined Size Category', description: 'Combined size category', dataType: 'text' },
  
  // Financial Information
  { key: 'fiscal_year_end', label: 'Fiscal Year End', description: 'Fiscal year end date', dataType: 'text' },
  
  // Unit Counts
  { key: 'total_units', label: 'Total Units', description: 'Total number of units', dataType: 'integer' },
  { key: 'total_dwelling_units', label: 'Total Dwelling Units', description: 'Total dwelling units', dataType: 'integer' },
  { key: 'acc_units', label: 'ACC Units', description: 'Annual Contributions Contract units', dataType: 'integer' },
  { key: 'ph_occupied', label: 'Public Housing Occupied', description: 'Occupied public housing units', dataType: 'integer' },
  { key: 'section8_units_count', label: 'Section 8 Units Count', description: 'Number of Section 8 units', dataType: 'integer' },
  { key: 'section8_occupied', label: 'Section 8 Occupied', description: 'Occupied Section 8 units', dataType: 'integer' },
  { key: 'total_occupied', label: 'Total Occupied', description: 'Total occupied units', dataType: 'integer' },
  { key: 'regular_vacant', label: 'Regular Vacant', description: 'Regular vacant units', dataType: 'integer' },
  { key: 'pha_total_units', label: 'PHA Total Units', description: 'PHA total units', dataType: 'integer' },
  { key: 'number_reported', label: 'Number Reported', description: 'Number of units reported', dataType: 'integer' },
  
  // Percentages
  { key: 'pct_occupied', label: 'Percent Occupied', description: 'Percentage of occupied units', dataType: 'decimal' },
  { key: 'pct_reported', label: 'Percent Reported', description: 'Percentage of units reported', dataType: 'decimal' },
  
  // Financial Amounts
  { key: 'opfund_amount', label: 'Operating Fund Amount', description: 'Operating fund amount', dataType: 'decimal' },
  { key: 'opfund_amount_prev_yr', label: 'Operating Fund Amount Previous Year', description: 'Previous year operating fund amount', dataType: 'decimal' },
  { key: 'capfund_amount', label: 'Capital Fund Amount', description: 'Capital fund amount', dataType: 'decimal' }
];

// Common field mappings for auto-detection
export const COMMON_MAPPINGS: Record<string, string> = {
  'PARTICIPANT_CODE': 'pha_code',
  'FORMAL_PARTICIPANT_NAME': 'name',
  'FULL_ADDRESS': 'address',
  'HA_PHN_NUM': 'phone',
  'HA_FAX_NUM': 'fax',
  'HA_EMAIL_ADDR_TEXT': 'email',
  'EXEC_DIR_PHONE': 'exec_dir_phone',
  'EXEC_DIR_FAX': 'exec_dir_fax',
  'EXEC_DIR_EMAIL': 'exec_dir_email',
  'PHAS_DESIGNATION': 'phas_designation',
  'HA_PROGRAM_TYPE': 'program_type',
  'HA_LOW_RENT_SIZE_CATEGORY': 'low_rent_size_category',
  'HA_SECTION_8_SIZE_CATEGORY': 'section8_size_category',
  'HA_COMBINED_SIZE_CATEGORY': 'combined_size_category',
  'HA_FYE': 'fiscal_year_end',
  'TOTAL_UNITS': 'total_units',
  'TOTAL_DWELLING_UNITS': 'total_dwelling_units',
  'ACC_UNITS': 'acc_units',
  'PH_OCCUPIED': 'ph_occupied',
  'SECTION8_UNITS_CNT': 'section8_units_count',
  'SECTION8_OCCUPIED': 'section8_occupied',
  'TOTAL_OCCUPIED': 'total_occupied',
  'REGULAR_VACANT': 'regular_vacant',
  'PHA_TOTAL_UNITS': 'pha_total_units',
  'NUMBER_REPORTED': 'number_reported',
  'PCT_OCCUPIED': 'pct_occupied',
  'PCT_REPORTED': 'pct_reported',
  'OPFUND_AMNT': 'opfund_amount',
  'OPFUND_AMNT_PREV_YR': 'opfund_amount_prev_yr',
  'CAPFUND_AMNT': 'capfund_amount'
};

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
