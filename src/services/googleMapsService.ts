
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
      fov = 90,
      heading = 0,
      pitch = 0
    } = options;

    // Clean and encode the address properly
    const cleanAddress = address.trim().replace(/\s+/g, ' ');
    
    const params = new URLSearchParams({
      size,
      location: cleanAddress,
      heading: heading.toString(),
      fov: fov.toString(),
      pitch: pitch.toString(),
      key: this.API_KEY,
      source: 'outdoor' // Prefer outdoor imagery
    });

    return `${this.STREET_VIEW_BASE_URL}?${params.toString()}`;
  }

  static getStreetViewImageByCoords(lat: number, lng: number, size: string = '400x300'): string {
    const params = new URLSearchParams({
      size,
      location: `${lat},${lng}`,
      heading: '0',
      fov: '90',
      pitch: '0',
      key: this.API_KEY,
      source: 'outdoor'
    });

    return `${this.STREET_VIEW_BASE_URL}?${params.toString()}`;
  }

  static getStaticMapImage(address: string, size: string = '400x300'): string {
    // Clean and encode the address properly
    const cleanAddress = address.trim().replace(/\s+/g, ' ');
    
    const params = new URLSearchParams({
      center: cleanAddress,
      zoom: '16',
      size,
      maptype: 'roadmap',
      markers: `color:red|${cleanAddress}`,
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

  // Enhanced method to get the best available image for an address
  static getBestImageForAddress(address: string, size: string = '800x400'): { streetView: string; staticMap: string } {
    if (!address || address.trim().length === 0) {
      // Return placeholder URLs for empty addresses
      return {
        streetView: `https://via.placeholder.com/${size}/cccccc/666666?text=No+Address+Available`,
        staticMap: `https://via.placeholder.com/${size}/cccccc/666666?text=No+Address+Available`
      };
    }

    return {
      streetView: this.getStreetViewImage({ address, size }),
      staticMap: this.getStaticMapImage(address, size)
    };
  }
}
