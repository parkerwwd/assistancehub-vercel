
export interface USLocation {
  name: string;
  type: 'state' | 'county' | 'city';
  state?: string;
  stateCode?: string;
  latitude: number;
  longitude: number;
}
