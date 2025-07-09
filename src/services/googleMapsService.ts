
export interface StreetViewImageOptions {
  address: string;
  size?: string;
  fov?: number;
  heading?: number;
  pitch?: number;
}

export class GoogleMapsService {
  private static readonly API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
  private static readonly STREET_VIEW_BASE_URL = 'https://maps.googleapis.com/maps/api/streetview';
  private static readonly STATIC_MAP_BASE_URL = 'https://maps.googleapis.com/maps/api/staticmap';
  
  // Image cache for performance optimization
  private static imageCache = new Map<string, string>();
  private static readonly CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

  static getStreetViewImage(options: StreetViewImageOptions): string {
    const {
      address,
      size = '400x300',
      fov = 90,
      heading = 0,
      pitch = 0
    } = options;

    // Create cache key
    const cacheKey = `streetview-${address}-${size}-${heading}-${fov}-${pitch}`;
    
    // Check cache first
    if (this.imageCache.has(cacheKey)) {
      return this.imageCache.get(cacheKey)!;
    }

    // Clean and encode the address properly
    const cleanAddress = address.trim().replace(/\s+/g, ' ');
    
    const params = new URLSearchParams({
      size,
      location: cleanAddress,
      heading: heading.toString(),
      fov: fov.toString(),
      pitch: pitch.toString(),
      key: this.API_KEY,
      source: 'outdoor', // Prefer outdoor imagery
      format: 'webp' // Use WebP for better compression
    });

    const imageUrl = `${this.STREET_VIEW_BASE_URL}?${params.toString()}`;
    
    // Cache the result
    this.imageCache.set(cacheKey, imageUrl);
    
    return imageUrl;
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
    // Create cache key
    const cacheKey = `staticmap-${address}-${size}`;
    
    // Check cache first
    if (this.imageCache.has(cacheKey)) {
      return this.imageCache.get(cacheKey)!;
    }

    // Clean and encode the address properly
    const cleanAddress = address.trim().replace(/\s+/g, ' ');
    
    const params = new URLSearchParams({
      center: cleanAddress,
      zoom: '16',
      size,
      maptype: 'roadmap',
      markers: `color:red|${cleanAddress}`,
      key: this.API_KEY,
      format: 'webp' // Use WebP for better compression
    });

    const imageUrl = `${this.STATIC_MAP_BASE_URL}?${params.toString()}`;
    
    // Cache the result
    this.imageCache.set(cacheKey, imageUrl);
    
    return imageUrl;
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

  // Optimized batch loading for multiple addresses
  static preloadImagesForOffices(offices: Array<{ address: string; name: string }>): void {
    // Preload images for visible offices to improve perceived performance
    offices.slice(0, 10).forEach(office => { // Only preload first 10
      if (office.address) {
        // Create optimized smaller images for list view
        this.getStreetViewImage({ address: office.address, size: '200x150' });
        this.getStaticMapImage(office.address, '200x150');
      }
    });
  }

  // Clear cache periodically to prevent memory leaks
  static clearCache(): void {
    this.imageCache.clear();
  }

  // Get cache stats for monitoring
  static getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.imageCache.size,
      keys: Array.from(this.imageCache.keys())
    };
  }

  // Enhanced method to get the best available image for an address
  static getBestImageForAddress(address: string, size: string = '800x400'): { streetView: string; staticMap: string } {
    if (!address || address.trim().length === 0) {
      // Return optimized placeholder URLs
      return {
        streetView: `https://via.placeholder.com/${size}/e5e7eb/6b7280?text=No+Address+Available&format=webp`,
        staticMap: `https://via.placeholder.com/${size}/e5e7eb/6b7280?text=No+Address+Available&format=webp`
      };
    }

    return {
      streetView: this.getStreetViewImage({ address, size }),
      staticMap: this.getStaticMapImage(address, size)
    };
  }
}
