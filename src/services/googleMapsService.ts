
export interface StreetViewImageOptions {
  address: string;
  size?: string;
  fov?: number;
  heading?: number;
  pitch?: number;
}

export class GoogleMapsService {
  private static readonly API_KEY = 'AIzaSyDldtppRX48PKyBUvlP7mnRFzO_vb6sVgU';
  private static readonly STREET_VIEW_BASE_URL = 'https://maps.googleapis.com/maps/api/streetview';

  static getStreetViewImage(options: StreetViewImageOptions): string {
    const {
      address,
      size = '400x300',
      fov = 80,
      heading = 0,
      pitch = 0
    } = options;

    const params = new URLSearchParams({
      size,
      location: address,
      heading: heading.toString(),
      fov: fov.toString(),
      pitch: pitch.toString(),
      key: this.API_KEY
    });

    return `${this.STREET_VIEW_BASE_URL}?${params.toString()}`;
  }

  static getStreetViewImageByCoords(lat: number, lng: number, size: string = '400x300'): string {
    const params = new URLSearchParams({
      size,
      location: `${lat},${lng}`,
      heading: '0',
      fov: '80',
      pitch: '0',
      key: this.API_KEY
    });

    return `${this.STREET_VIEW_BASE_URL}?${params.toString()}`;
  }

  static getStaticMapImage(address: string, size: string = '400x300'): string {
    const params = new URLSearchParams({
      center: address,
      zoom: '16',
      size,
      maptype: 'roadmap',
      markers: `color:red|${address}`,
      key: this.API_KEY
    });

    return `https://maps.googleapis.com/maps/api/staticmap?${params.toString()}`;
  }

  static getStaticMapImageByCoords(lat: number, lng: number, size: string = '400x300'): string {
    const params = new URLSearchParams({
      center: `${lat},${lng}`,
      zoom: '16',
      size,
      maptype: 'satellite',
      markers: `color:red|${lat},${lng}`,
      key: this.API_KEY
    });

    return `https://maps.googleapis.com/maps/api/staticmap?${params.toString()}`;
  }

  // Check if Street View is available for a location
  static async checkStreetViewAvailability(lat: number, lng: number): Promise<boolean> {
    try {
      const metadataUrl = `https://maps.googleapis.com/maps/api/streetview/metadata?location=${lat},${lng}&key=${this.API_KEY}`;
      const response = await fetch(metadataUrl);
      const data = await response.json();
      return data.status === 'OK';
    } catch (error) {
      console.warn('Error checking Street View availability:', error);
      return false;
    }
  }
}
