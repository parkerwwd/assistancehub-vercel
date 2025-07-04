
export const DATABASE_FIELDS = [
  { key: 'pha_code', label: 'PHA Code', description: 'Unique identifier for the PHA' },
  { key: 'name', label: 'PHA Name', description: 'Official name of the housing authority', required: true },
  { key: 'address', label: 'Address', description: 'Street address' },
  { key: 'city', label: 'City', description: 'City name' },
  { key: 'state', label: 'State', description: 'State abbreviation (2 letters)' },
  { key: 'zip', label: 'ZIP Code', description: 'Postal code' },
  { key: 'phone', label: 'Phone', description: 'Contact phone number' },
  { key: 'fax', label: 'Fax', description: 'Fax number' },
  { key: 'email', label: 'Email', description: 'Contact email address' },
  { key: 'exec_dir_phone', label: 'Executive Director Phone', description: 'Executive director phone number' },
  { key: 'exec_dir_fax', label: 'Executive Director Fax', description: 'Executive director fax number' },
  { key: 'exec_dir_email', label: 'Executive Director Email', description: 'Executive director email address' },
  { key: 'website', label: 'Website', description: 'Official website URL' },
  { key: 'supports_hcv', label: 'Supports HCV', description: 'Housing Choice Voucher support (Section 8)' },
  { key: 'waitlist_status', label: 'Waitlist Status', description: 'Current waitlist status' },
  { key: 'latitude', label: 'Latitude', description: 'Geographic latitude coordinate' },
  { key: 'longitude', label: 'Longitude', description: 'Geographic longitude coordinate' },
  { key: 'performance_status', label: 'Performance Status', description: 'PHAS designation or performance rating' },
  { key: 'program_type', label: 'Program Type', description: 'Type of housing programs offered' },
  { key: 'low_rent_size_category', label: 'Low Rent Size Category', description: 'Size category for low rent programs' },
  { key: 'section8_size_category', label: 'Section 8 Size Category', description: 'Size category for Section 8 programs' },
  { key: 'combined_size_category', label: 'Combined Size Category', description: 'Combined size category' },
  { key: 'fiscal_year_end', label: 'Fiscal Year End', description: 'Fiscal year end date' },
  { key: 'total_units', label: 'Total Units', description: 'Total housing units' },
  { key: 'total_dwelling_units', label: 'Total Dwelling Units', description: 'Total dwelling units' },
  { key: 'ph_occupied', label: 'Public Housing Occupied', description: 'Number of occupied public housing units' },
  { key: 'section8_units_count', label: 'Section 8 Units Count', description: 'Number of Section 8 voucher units' },
  { key: 'section8_occupied', label: 'Section 8 Occupied', description: 'Number of occupied Section 8 units' },
];

// Updated common mappings to match actual HUD CSV format
export const COMMON_MAPPINGS = {
  // Core identifiers
  'PARTICIPANT_CODE': 'pha_code',
  'FORMAL_PARTICIPANT_NAME': 'name',
  'PARTICIPANT_NAME': 'name',
  'PHA_NAME': 'name',
  
  // Address components (actual HUD format)
  'STD_ADDR': 'address',
  'ADDRESS': 'address',
  'FULL_ADDRESS': 'address', // Fallback
  'STD_CITY': 'city',
  'CITY': 'city',
  'STD_ST': 'state',
  'STATE': 'state',
  'STD_ZIP5': 'zip',
  'ZIP': 'zip',
  
  // Contact information
  'HA_PHN_NUM': 'phone',
  'PHONE': 'phone',
  'HA_FAX_NUM': 'fax',
  'FAX': 'fax',
  'HA_EMAIL_ADDR_TEXT': 'email',
  'EMAIL': 'email',
  'EXEC_DIR_PHONE': 'exec_dir_phone',
  'EXEC_DIR_FAX': 'exec_dir_fax',
  'EXEC_DIR_EMAIL': 'exec_dir_email',
  'WEBSITE': 'website',
  
  // Geographic coordinates  
  'LAT': 'latitude',
  'LATITUDE': 'latitude',
  'LON': 'longitude',
  'LONGITUDE': 'longitude',
  
  // PHA details
  'PHAS_DESIGNATION': 'performance_status',
  'PERFORMANCE_STATUS': 'performance_status',
  'HA_PROGRAM_TYPE': 'program_type',
  'PROGRAM_TYPE': 'program_type',
  
  // Size categories
  'HA_LOW_RENT_SIZE_CATEGORY': 'low_rent_size_category',
  'HA_SECTION_8_SIZE_CATEGORY': 'section8_size_category', 
  'HA_COMBINED_SIZE_CATEGORY': 'combined_size_category',
  
  // Financial and operational
  'HA_FYE': 'fiscal_year_end',
  'FISCAL_YEAR_END': 'fiscal_year_end',
  'TOTAL_UNITS': 'total_units',
  'TOTAL_DWELLING_UNITS': 'total_dwelling_units',
  'PH_OCCUPIED': 'ph_occupied',
  'SECTION8_UNITS_CNT': 'section8_units_count',
  'SECTION8_OCCUPIED': 'section8_occupied',
  
  // Waitlist
  'WAITLIST_STATUS': 'waitlist_status',
};
