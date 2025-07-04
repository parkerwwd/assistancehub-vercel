import { Database } from "@/integrations/supabase/types";

// Create a type alias for the new Supabase PHAAgency type
export type PHAAgency = Database['public']['Tables']['pha_agencies']['Row'];

// Keep the old PHAOffice interface for backward compatibility if needed
// But convert PHAAgency to PHAOffice format when necessary
export interface PHAOffice {
  id: number;
  name: string;
  address: string;
  phone: string;
  website: string;
  waitlistStatus: string;
  coordinates: [number, number]; // [lng, lat]
}

// Helper function to convert PHAAgency to PHAOffice format
export const convertPHAAgencyToPHAOffice = (agency: PHAAgency): PHAOffice => {
  return {
    id: parseInt(agency.id.replace(/-/g, '').substring(0, 8), 16), // Convert UUID to number
    name: agency.name,
    address: agency.address || '',
    phone: agency.phone || '',
    website: '', // Field doesn't exist in current schema
    waitlistStatus: 'Unknown', // Field doesn't exist in current schema
    coordinates: [(agency as any).geocoded_longitude || 0, (agency as any).geocoded_latitude || 0] as [number, number]
  };
};
