
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
}
