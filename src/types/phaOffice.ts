
// Temporary type definition for PHA Agency until database is recreated
export interface PHAAgency {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
}

export type PHAOfficeType = PHAAgency;
