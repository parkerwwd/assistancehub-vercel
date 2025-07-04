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
  { key: 'website', label: 'Website', description: 'Official website URL' },
  { key: 'exec_dir_phone', label: 'Executive Director Phone', description: 'Executive director phone number' },
  { key: 'exec_dir_fax', label: 'Executive Director Fax', description: 'Executive director fax number' },
  { key: 'exec_dir_email', label: 'Executive Director Email', description: 'Executive director email address' },
  { key: 'supports_hcv', label: 'Supports HCV', description: 'Housing Choice Voucher support (Section 8)' },
  { key: 'waitlist_open', label: 'Waitlist Open', description: 'Whether waitlist is currently open' },
  { key: 'waitlist_status', label: 'Waitlist Status', description: 'Current waitlist status' },
  { key: 'latitude', label: 'Latitude', description: 'Geographic latitude coordinate' },
  { key: 'longitude', label: 'Longitude', description: 'Geographic longitude coordinate' },
  { key: 'total_units', label: 'Total Units', description: 'Total number of units' },
  { key: 'total_dwelling_units', label: 'Total Dwelling Units', description: 'Total dwelling units' },
  { key: 'ph_occupied', label: 'Public Housing Occupied', description: 'Number of occupied public housing units' },
  { key: 'section8_units_count', label: 'Section 8 Units Count', description: 'Number of Section 8 units' },
  { key: 'section8_occupied', label: 'Section 8 Occupied', description: 'Number of occupied Section 8 units' },
  { key: 'performance_status', label: 'Performance Status', description: 'HUD performance rating' },
  { key: 'program_type', label: 'Program Type', description: 'Type of housing program' },
  { key: 'low_rent_size_category', label: 'Low Rent Size Category', description: 'Size category for low rent units' },
  { key: 'section8_size_category', label: 'Section 8 Size Category', description: 'Size category for Section 8 program' },
  { key: 'combined_size_category', label: 'Combined Size Category', description: 'Combined size category' },
  { key: 'fiscal_year_end', label: 'Fiscal Year End', description: 'Fiscal year end date' },
  { key: 'jurisdictions', label: 'Jurisdictions', description: 'Areas of jurisdiction' },
];

// Updated field mappings based on actual HUD CSV format and database table
export const COMMON_MAPPINGS = {
  // Basic PHA Information
  'PARTICIPANT_CODE': 'pha_code',
  'PHA_CODE': 'pha_code',
  'CODE': 'pha_code',
  
  // PHA Name - Multiple possible field names
  'FORMAL_PARTICIPANT_NAME': 'name',
  'PARTICIPANT_NAME': 'name',
  'PHA_NAME': 'name',
  'NAME': 'name',
  'AGENCY_NAME': 'name',
  
  // Address Components - HUD typically separates these
  'STD_ADDR': 'address',
  'ADDRESS': 'address',
  'STREET_ADDRESS': 'address',
  'FULL_ADDRESS': 'address',
  'MAILING_ADDRESS': 'address',
  
  'STD_CITY': 'city',
  'CITY': 'city',
  'MAILING_CITY': 'city',
  
  'STD_ST': 'state',
  'STATE': 'state',
  'ST': 'state',
  'MAILING_STATE': 'state',
  
  'STD_ZIP5': 'zip',
  'ZIP': 'zip',
  'ZIP_CODE': 'zip',
  'POSTAL_CODE': 'zip',
  'MAILING_ZIP': 'zip',
  
  // Contact Information
  'HA_PHN_NUM': 'phone',
  'PHONE': 'phone',
  'PHONE_NUMBER': 'phone',
  'CONTACT_PHONE': 'phone',
  
  'HA_FAX_NUM': 'fax',
  'FAX': 'fax',
  'FAX_NUMBER': 'fax',
  
  'HA_EMAIL_ADDR_TEXT': 'email',
  'EMAIL': 'email',
  'EMAIL_ADDRESS': 'email',
  'CONTACT_EMAIL': 'email',
  
  'WEBSITE': 'website',
  'WEB_SITE': 'website',
  'URL': 'website',
  'WEB_ADDRESS': 'website',
  
  // Executive Director Information
  'EXEC_DIR_PHN_NUM': 'exec_dir_phone',
  'EXECUTIVE_DIRECTOR_PHONE': 'exec_dir_phone',
  'ED_PHONE': 'exec_dir_phone',
  
  'EXEC_DIR_FAX_NUM': 'exec_dir_fax',
  'EXECUTIVE_DIRECTOR_FAX': 'exec_dir_fax',
  'ED_FAX': 'exec_dir_fax',
  
  'EXEC_DIR_EMAIL': 'exec_dir_email',
  'EXECUTIVE_DIRECTOR_EMAIL': 'exec_dir_email',
  'ED_EMAIL': 'exec_dir_email',
  
  // Geographic Coordinates
  'LAT': 'latitude',
  'LATITUDE': 'latitude',
  'Y_COORD': 'latitude',
  
  'LON': 'longitude',
  'LONGITUDE': 'longitude',
  'LONG': 'longitude',
  'X_COORD': 'longitude',
  
  // Program Information
  'HA_PROGRAM_TYPE': 'program_type',
  'PROGRAM_TYPE': 'program_type',
  'PROGRAMS': 'program_type',
  
  // Unit Counts
  'TOTAL_UNITS': 'total_units',
  'UNITS_TOTAL': 'total_units',
  'ALL_UNITS': 'total_units',
  
  'TOTAL_DWELLING_UNITS': 'total_dwelling_units',
  'DWELLING_UNITS': 'total_dwelling_units',
  'DU_TOTAL': 'total_dwelling_units',
  
  'PH_OCCUPIED': 'ph_occupied',
  'PUBLIC_HOUSING_OCCUPIED': 'ph_occupied',
  'PH_OCC': 'ph_occupied',
  
  'SECTION8_UNITS_CNT': 'section8_units_count',
  'SECTION_8_UNITS': 'section8_units_count',
  'S8_UNITS': 'section8_units_count',
  'HCV_UNITS': 'section8_units_count',
  
  'SECTION8_OCCUPIED': 'section8_occupied',
  'SECTION_8_OCCUPIED': 'section8_occupied',
  'S8_OCCUPIED': 'section8_occupied',
  'HCV_OCCUPIED': 'section8_occupied',
  
  // Status Information
  'WAITLIST_STATUS': 'waitlist_status',
  'WL_STATUS': 'waitlist_status',
  'WAITING_LIST_STATUS': 'waitlist_status',
  
  'PERFORMANCE_STATUS': 'performance_status',
  'HUD_PERFORMANCE': 'performance_status',
  'RATING': 'performance_status',
  
  // Size Categories
  'LOW_RENT_SIZE_CATEGORY': 'low_rent_size_category',
  'LR_SIZE_CAT': 'low_rent_size_category',
  
  'SECTION8_SIZE_CATEGORY': 'section8_size_category',
  'S8_SIZE_CAT': 'section8_size_category',
  
  'COMBINED_SIZE_CATEGORY': 'combined_size_category',
  'COMB_SIZE_CAT': 'combined_size_category',
  
  // Other Information
  'FISCAL_YEAR_END': 'fiscal_year_end',
  'FYE': 'fiscal_year_end',
  'FY_END': 'fiscal_year_end',
  
  'JURISDICTIONS': 'jurisdictions',
  'JURISDICTION': 'jurisdictions',
  'SERVICE_AREA': 'jurisdictions',
};
