export const DATABASE_FIELDS = [
  { key: 'pha_code', label: 'PHA Code', description: 'Unique identifier for the PHA' },
  { key: 'name', label: 'PHA Name', description: 'Official name of the housing authority', required: true },
  { key: 'address', label: 'Address', description: 'Full address of the PHA' },
  { key: 'phone', label: 'Phone', description: 'Contact phone number' },
  { key: 'email', label: 'Email', description: 'Contact email address' },
  { key: 'exec_dir_email', label: 'Executive Director Email', description: 'Executive director email address' },
  { key: 'program_type', label: 'Program Type', description: 'Type of housing program' },
];

// Updated mappings based on the actual CSV field names from your debug output
export const COMMON_MAPPINGS: { [key: string]: string } = {
  'PARTICIPANT_CODE': 'pha_code',
  'FORMAL_PARTICIPANT_NAME': 'name',
  'FULL_ADDRESS': 'address',
  'PHAS_DESIGNATION': 'phone',  // This contains "(787) 712-1100" - the actual phone number
  'EXEC_DIR_EMAIL': 'email',    // This contains "djesus@gurabopr.com" - the actual email
  'HA_PROGRAM_TYPE': 'program_type',
  // Keep exec_dir_email mapping separate
  'EXEC_DIR_EMAIL': 'exec_dir_email',
};
