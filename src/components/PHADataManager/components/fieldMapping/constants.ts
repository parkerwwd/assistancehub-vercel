
export const DATABASE_FIELDS = [
  { key: 'pha_code', label: 'PHA Code', description: 'Unique identifier for the PHA' },
  { key: 'name', label: 'PHA Name', description: 'Official name of the housing authority', required: true },
  { key: 'address', label: 'Address', description: 'Street address' },
  { key: 'phone', label: 'Phone', description: 'Contact phone number' },
  { key: 'email', label: 'Email', description: 'Contact email address' },
  { key: 'exec_dir_email', label: 'Executive Director Email', description: 'Executive director email address' },
  { key: 'program_type', label: 'Program Type', description: 'Type of housing program' },
];

// Fixed mappings - corrected field assignments based on typical HUD CSV format
export const COMMON_MAPPINGS: { [key: string]: string } = {
  'PARTICIPANT_CODE': 'pha_code',
  'PHA_CODE': 'pha_code',
  'FORMAL_PARTICIPANT_NAME': 'name',
  'PARTICIPANT_NAME': 'name',
  'PHA_NAME': 'name',
  'FULL_ADDRESS': 'address',
  'ADDRESS': 'address',
  'STREET_ADDRESS': 'address',
  'HA_PHN_NUM': 'phone',
  'PHONE': 'phone',
  'PHONE_NUMBER': 'phone',
  'HA_EMAIL_ADDR_TEXT': 'email',
  'EMAIL': 'email',
  'EMAIL_ADDRESS': 'email',
  'CONTACT_EMAIL': 'email',
  'EXEC_DIR_EMAIL': 'exec_dir_email',
  'EXECUTIVE_DIRECTOR_EMAIL': 'exec_dir_email',
  'HA_PROGRAM_TYPE': 'program_type',
  'PROGRAM_TYPE': 'program_type',
  'SIZE_CATEGORY': 'program_type',
  // Additional common field mappings
  'ZIP': null, // Skip ZIP field as we don't have a separate column for it
  'ZIP_CODE': null,
  'CITY': null, // Skip CITY field 
  'STATE': null, // Skip STATE field
  'FAX': 'fax',
  'FAX_NUMBER': 'fax',
};

// Essential fields that should be auto-checked
export const ESSENTIAL_FIELDS = [
  'pha_code',
  'name', 
  'address',
  'phone',
  'email',
  'exec_dir_email',
  'program_type'
];
