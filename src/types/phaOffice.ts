import { Database } from "@/integrations/supabase/types";

// Keep the old PHAOffice interface for backward compatibility
export interface PHAOffice {
  id: number;
  name: string;
  address: string;
  phone: string;
  website: string;
  waitlistStatus: string;
  coordinates: [number, number]; // [lng, lat]
}

// Create a type alias for the new Supabase PHAAgency type
export type PHAAgency = Database['public']['Tables']['pha_agencies']['Row'];
