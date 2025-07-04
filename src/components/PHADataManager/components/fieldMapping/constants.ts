
export const DATABASE_FIELDS = [
  { key: 'pha_code', label: 'PHA Code', description: 'Unique identifier for the PHA' },
  { key: 'name', label: 'PHA Name', description: 'Official name of the housing authority', required: true },
  { key: 'address', label: 'Address', description: 'Street address' },
  { key: 'phone', label: 'Phone', description: 'Contact phone number' },
  { key: 'email', label: 'Email', description: 'Contact email address' },
  { key: 'exec_dir_email', label: 'Executive Director Email', description: 'Executive director email address' },
  { key: 'program_type', label: 'Program Type', description: 'Type of housing program' },
];

// Updated mappings - removed state, city, zip and other unwanted fields
export const COMMON_MAPPINGS: { [key: string]: string } = {
  'PARTICIPANT_CODE': 'pha_code',
  'FORMAL_PARTICIPANT_NAME': 'name',
  'PARTICIPANT_NAME': 'name',
  'PHA_NAME': 'name',
  'FULL_ADDRESS': 'address',
  'ADDRESS': 'address',
  'HA_PHN_NUM': 'phone',
  'PHONE': 'phone',
  'HA_EMAIL_ADDR_TEXT': 'email',
  'EMAIL': 'email',
  'EXEC_DIR_EMAIL': 'exec_dir_email',
  'HA_PROGRAM_TYPE': 'program_type',
  'PROGRAM_TYPE': 'program_type',
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
