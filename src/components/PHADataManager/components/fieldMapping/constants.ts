
export const DATABASE_FIELDS = [
  { key: 'pha_code', label: 'PHA Code', description: 'Unique identifier for the PHA' },
  { key: 'name', label: 'PHA Name', description: 'Official name of the housing authority', required: true },
  { key: 'address', label: 'Address', description: 'Full street address including city, state, zip' },
  { key: 'phone', label: 'Phone', description: 'Contact phone number' },
  { key: 'fax', label: 'Fax', description: 'Fax number' },
  { key: 'email', label: 'Email', description: 'Contact email address' },
  { key: 'exec_dir_phone', label: 'Executive Director Phone', description: 'Executive director phone number' },
  { key: 'exec_dir_fax', label: 'Executive Director Fax', description: 'Executive director fax number' },
  { key: 'exec_dir_email', label: 'Executive Director Email', description: 'Executive director email address' },
  { key: 'phas_designation', label: 'PHAS Designation', description: 'Public Housing Assessment System designation' },
  { key: 'total_units', label: 'Total Units', description: 'Total number of units' },
  { key: 'total_dwelling_units', label: 'Total Dwelling Units', description: 'Total dwelling units' },
  { key: 'acc_units', label: 'ACC Units', description: 'Annual Contributions Contract units' },
  { key: 'ph_occupied', label: 'Public Housing Occupied', description: 'Number of occupied public housing units' },
  { key: 'section8_units_count', label: 'Section 8 Units Count', description: 'Number of Section 8 units' },
  { key: 'section8_occupied', label: 'Section 8 Occupied', description: 'Number of occupied Section 8 units' },
  { key: 'total_occupied', label: 'Total Occupied', description: 'Total occupied units' },
  { key: 'pct_occupied', label: 'Percent Occupied', description: 'Percentage of units occupied' },
  { key: 'regular_vacant', label: 'Regular Vacant', description: 'Number of regular vacant units' },
  { key: 'pha_total_units', label: 'PHA Total Units', description: 'PHA total unit count' },
  { key: 'number_reported', label: 'Number Reported', description: 'Number of units reported' },
  { key: 'pct_reported', label: 'Percent Reported', description: 'Percentage reported' },
  { key: 'opfund_amount', label: 'Operating Fund Amount', description: 'Operating fund amount' },
  { key: 'opfund_amount_prev_yr', label: 'Operating Fund Previous Year', description: 'Operating fund amount from previous year' },
  { key: 'capfund_amount', label: 'Capital Fund Amount', description: 'Capital fund amount' },
  { key: 'program_type', label: 'Program Type', description: 'Type of housing program' },
  { key: 'low_rent_size_category', label: 'Low Rent Size Category', description: 'Size category for low rent units' },
  { key: 'section8_size_category', label: 'Section 8 Size Category', description: 'Size category for Section 8 program' },
  { key: 'combined_size_category', label: 'Combined Size Category', description: 'Combined size category' },
  { key: 'fiscal_year_end', label: 'Fiscal Year End', description: 'Fiscal year end date' },
];

// Updated field mappings based on actual HUD CSV format analysis
export const COMMON_MAPPINGS = {
  // Basic PHA Information
  'PARTICIPANT_CODE': 'pha_code',
  'PHA_CODE': 'pha_code',
  'CODE': 'pha_code',
  
  // PHA Name
  'FORMAL_PARTICIPANT_NAME': 'name',
  'PARTICIPANT_NAME': 'name',
  'PHA_NAME': 'name',
  'NAME': 'name',
  'AGENCY_NAME': 'name',
  
  // Address Components - These are the problematic fields
  'STD_ADDR': 'address',
  'ADDRESS': 'address',
  'STREET_ADDRESS': 'address',
  'MAILING_ADDRESS': 'address',
  'FULL_ADDRESS': 'address',
  
  // Contact Information - Fix the mapping order
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
  
  // Executive Director Information
  'EXEC_DIR_PHONE': 'exec_dir_phone',
  'EXECUTIVE_DIRECTOR_PHONE': 'exec_dir_phone',
  'ED_PHONE': 'exec_dir_phone',
  
  'EXEC_DIR_FAX': 'exec_dir_fax',
  'EXECUTIVE_DIRECTOR_FAX': 'exec_dir_fax',
  'ED_FAX': 'exec_dir_fax',
  
  'EXEC_DIR_EMAIL': 'exec_dir_email',
  'EXECUTIVE_DIRECTOR_EMAIL': 'exec_dir_email',
  'ED_EMAIL': 'exec_dir_email',
  
  // PHAS Designation
  'PHAS_DESIGNATION': 'phas_designation',
  'DESIGNATION': 'phas_designation',
  
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
  
  'ACC_UNITS': 'acc_units',
  'ANNUAL_CONTRIBUTIONS_CONTRACT_UNITS': 'acc_units',
  
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
  
  'TOTAL_OCCUPIED': 'total_occupied',
  'TOT_OCCUPIED': 'total_occupied',
  
  'PCT_OCCUPIED': 'pct_occupied',
  'PERCENT_OCCUPIED': 'pct_occupied',
  'OCCUPANCY_RATE': 'pct_occupied',
  
  'REGULAR_VACANT': 'regular_vacant',
  'REG_VACANT': 'regular_vacant',
  'VACANT_UNITS': 'regular_vacant',
  
  'PHA_TOTAL_UNITS': 'pha_total_units',
  'PHA_UNITS_TOTAL': 'pha_total_units',
  
  'NUMBER_REPORTED': 'number_reported',
  'NUM_REPORTED': 'number_reported',
  'UNITS_REPORTED': 'number_reported',
  
  'PCT_REPORTED': 'pct_reported',
  'PERCENT_REPORTED': 'pct_reported',
  'REPORTING_RATE': 'pct_reported',
  
  // Financial Information
  'OPFUND_AMNT': 'opfund_amount',
  'OPERATING_FUND_AMOUNT': 'opfund_amount',
  'OP_FUND_AMT': 'opfund_amount',
  
  'OPFUND_AMNT_PREV_YR': 'opfund_amount_prev_yr',
  'OPERATING_FUND_PREV_YEAR': 'opfund_amount_prev_yr',
  'OP_FUND_PREV_YR': 'opfund_amount_prev_yr',
  
  'CAPFUND_AMNT': 'capfund_amount',
  'CAPITAL_FUND_AMOUNT': 'capfund_amount',
  'CAP_FUND_AMT': 'capfund_amount',
  
  // Size Categories
  'HA_LOW_RENT_SIZE_CATEGORY': 'low_rent_size_category',
  'LR_SIZE_CAT': 'low_rent_size_category',
  'LOW_RENT_CATEGORY': 'low_rent_size_category',
  
  'HA_SECTION_8_SIZE_CATEGORY': 'section8_size_category',
  'S8_SIZE_CAT': 'section8_size_category',
  'SECTION8_CATEGORY': 'section8_size_category',
  
  'HA_COMBINED_SIZE_CATEGORY': 'combined_size_category',
  'COMB_SIZE_CAT': 'combined_size_category',
  'COMBINED_CATEGORY': 'combined_size_category',
  
  // Other Information
  'HA_FYE': 'fiscal_year_end',
  'FISCAL_YEAR_END': 'fiscal_year_end',
  'FYE': 'fiscal_year_end',
  'FY_END': 'fiscal_year_end',
};
