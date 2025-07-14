import { Database } from "@/integrations/supabase/types";

// Base property type from Supabase
export type Property = Database['public']['Tables']['properties']['Row'];

// Property type enum
export enum PropertyType {
  PUBLIC_HOUSING = 'public_housing',
  SECTION_8 = 'section_8',
  TAX_CREDIT = 'tax_credit',
  OTHER = 'other'
}

// Bedroom type enum
export enum BedroomType {
  STUDIO = 'studio',
  ONE_BR = '1br',
  TWO_BR = '2br',
  THREE_BR = '3br',
  FOUR_BR_PLUS = '4br+'
}

// Property filters interface
export interface PropertyFilters {
  propertyType?: PropertyType[];
  bedroomTypes?: BedroomType[];
  minRent?: number;
  maxRent?: number;
  onlyAvailable?: boolean;
  waitlistOpen?: boolean;
  accessibilityFeatures?: string[];
  amenities?: string[];
  petFriendly?: boolean;
}

// Property search result
export interface PropertySearchResult {
  property: Property;
  distance?: number; // Miles from search location
  matchScore?: number; // Relevance score
}

// Property stats
export interface PropertyStats {
  totalProperties: number;
  availableUnits: number;
  averageRent: number;
  propertiesByType: Record<PropertyType, number>;
}
