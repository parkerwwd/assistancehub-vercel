
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
  
  // Address mappings - use FULL_ADDRESS directly, don't separate
  'FULL_ADDRESS': 'address',
  'FULLADDRESS': 'address',
  'ADDRESS': 'address',
  'MAILING_ADDRESS': 'address',
  'PHYSICAL_ADDRESS': 'address',
  
  // Phone mappings - use HA_PHN_NUM specifically
  'HA_PHN_NUM': 'phone',
  'PHONE': 'phone',
  'PHONE_NUMBER': 'phone',
  'CONTACT_PHONE': 'phone',
  'PHA_PHONE': 'phone',
  
  // Email mappings - use HA_EMAIL_ADDR_TEXT specifically
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

// Database fields available for mapping
export const DATABASE_FIELDS = [
  { key: 'pha_code', label: 'PHA Code', description: 'Unique identifier for the PHA', required: false },
  { key: 'name', label: 'Agency Name', description: 'Official name of the housing authority', required: true },
  { key: 'address', label: 'Address', description: 'Full mailing address', required: false },
  { key: 'phone', label: 'Phone Number', description: 'Contact phone number', required: false },
  { key: 'email', label: 'Email Address', description: 'General contact email', required: false },
  { key: 'exec_dir_email', label: 'Executive Director Email', description: 'Direct email for executive director', required: false },
  { key: 'program_type', label: 'Program Type', description: 'Type of housing program (e.g., Section 8, Public Housing)', required: false }
];

// Required fields that must be present for import
export const REQUIRED_FIELDS = ['name'];

// Fields that should be excluded from automatic mapping to prevent incorrect assignments
export const EXCLUDED_FIELDS = [
  'STD_ST', 'STD_CITY', 'STD_ZIP5', 'STD_ADDR', // Don't auto-map these address components
  'state', 'city', 'zip', 'std_st', 'std_city', 'std_zip5',
  'latitude', 'longitude', 'lat', 'lon', 'coords'
];
