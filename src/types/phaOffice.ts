
export interface PHAOffice {
  id: number;
  name: string;
  address: string;
  phone: string;
  website: string;
  waitlistStatus: string;
  coordinates: [number, number]; // [lng, lat]
}
