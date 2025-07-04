
// Temporary type definition for PHA Agency until database is recreated
export interface PHAAgency {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  waitlistStatus?: string;
  coordinates?: [number, number];
  // Additional fields that components expect
  section8_units_count?: number;
  pha_code?: string;
  total_units?: number;
  pha_total_units?: number;
  total_dwelling_units?: number;
  last_updated?: string;
}

export type PHAOfficeType = PHAAgency;

// Export PHAOffice as an alias for backward compatibility
export type PHAOffice = PHAAgency;
