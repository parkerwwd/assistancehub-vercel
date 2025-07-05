
// Common field mappings for HUD PHA data
export const COMMON_MAPPINGS: Record<string, string> = {
  // PHA Code mappings
  'PARTICIPANT_CODE': 'pha_code',
  'PHA_CODE': 'pha_code',
  'CODE': 'pha_code',
  
  // Name mappings
  'FORMAL_PARTICIPANT_NAME': 'name',
  'PARTICIPANT_NAME': 'name',
  'PHA_NAME': 'name',
  'NAME': 'name',
  'AGENCY_NAME': 'name',
  
  // Address mappings - handle full address field
  'FULL_ADDRESS': 'address',
  'FULLADDRESS': 'address',
  'STD_ADDR': 'address',
  'ADDRESS': 'address',
  'MAILING_ADDRESS': 'address',
  'PHYSICAL_ADDRESS': 'address',
  
  // Phone mappings
  'HA_PHN_NUM': 'phone',
  'PHONE': 'phone',
  'PHONE_NUMBER': 'phone',
  'CONTACT_PHONE': 'phone',
  'PHA_PHONE': 'phone',
  
  // Email mappings
  'HA_EMAIL_ADDR_TEXT': 'email',
  'EMAIL': 'email',
  'EMAIL_ADDRESS': 'email',
  'CONTACT_EMAIL': 'email',
  'PHA_EMAIL': 'email',
  
  // Executive Director Email mappings
  'EXEC_DIR_EMAIL': 'exec_dir_email',
  'EXECUTIVE_DIRECTOR_EMAIL': 'exec_dir_email',
  'DIRECTOR_EMAIL': 'exec_dir_email',
  'ED_EMAIL': 'exec_dir_email',
  
  // Program Type mappings
  'HA_PROGRAM_TYPE': 'program_type',
  'PROGRAM_TYPE': 'program_type',
  'PROGRAM': 'program_type',
  'TYPE': 'program_type'
};

// Required fields that must be present for import
export const REQUIRED_FIELDS = ['name'];

// Fields that should be excluded from automatic mapping
export const EXCLUDED_FIELDS = [
  'state', 'city', 'zip', 'std_st', 'std_city', 'std_zip5',
  'latitude', 'longitude', 'lat', 'lon', 'coords'
];
