
interface WalkabilityScores {
  walkScore: number;
  transitScore: number;
  bikeScore: number;
  loading: boolean;
  error?: string;
  breakdown?: {
    nearbyAmenities: Array<{
      type: string;
      count: number;
      avgDistance: number;
    }>;
    transitStops: number;
    bikeInfrastructure: number;
  };
}

interface Coordinates {
  lat: number;
  lng: number;
}

export class WalkScoreService {
  private static readonly OVERPASS_API = 'https://overpass-api.de/api/interpreter';
  
  static async calculateScores(address: string, coordinates?: Coordinates): Promise<WalkabilityScores> {
    try {
      // If no coordinates provided, try to geocode the address
      let coords = coordinates;
      if (!coords && address) {
        coords = await this.geocodeAddress(address);
      }
      
      if (!coords) {
        throw new Error('Unable to determine location coordinates');
      }

      // Fetch nearby amenities using Overpass API (OpenStreetMap)
      const amenities = await this.fetchNearbyAmenities(coords);
      const transitStops = await this.fetchTransitStops(coords);
      const bikeInfrastructure = await this.fetchBikeInfrastructure(coords);

      // Calculate scores based on proximity and availability
      const walkScore = this.calculateWalkScore(amenities);
      const transitScore = this.calculateTransitScore(transitStops);
      const bikeScore = this.calculateBikeScore(bikeInfrastructure, amenities);

      return {
        walkScore,
        transitScore,
        bikeScore,
        loading: false,
        breakdown: {
          nearbyAmenities: amenities,
          transitStops: transitStops.length,
          bikeInfrastructure: bikeInfrastructure.length
        }
      };
    } catch (error) {
      console.error('Error calculating walkability scores:', error);
      return {
        walkScore: 0,
        transitScore: 0,
        bikeScore: 0,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to calculate scores'
      };
    }
  }

  private static async geocodeAddress(address: string): Promise<Coordinates | null> {
    try {
      // Using Nominatim (free OpenStreetMap geocoding)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon)
        };
      }
      return null;
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  }

  private static async fetchNearbyAmenities(coords: Coordinates) {
    const radius = 1600; // 1 mile in meters
    const query = `
      [out:json][timeout:25];
      (
        node["amenity"~"^(restaurant|cafe|grocery|supermarket|pharmacy|hospital|school|bank|post_office)$"](around:${radius},${coords.lat},${coords.lng});
        way["amenity"~"^(restaurant|cafe|grocery|supermarket|pharmacy|hospital|school|bank|post_office)$"](around:${radius},${coords.lat},${coords.lng});
      );
      out center;
    `;

    try {
      const response = await fetch(this.OVERPASS_API, {
        method: 'POST',
        body: query
      });
      const data = await response.json();
      
      // Process and categorize amenities
      const amenityTypes = ['restaurant', 'grocery', 'pharmacy', 'hospital', 'school', 'bank'];
      const categorized = amenityTypes.map(type => {
        const items = data.elements.filter((el: any) => 
          el.tags?.amenity === type || 
          (type === 'grocery' && ['supermarket', 'convenience'].includes(el.tags?.amenity))
        );
        
        const distances = items.map((item: any) => {
          const itemLat = item.lat || item.center?.lat;
          const itemLng = item.lon || item.center?.lon;
          return this.calculateDistance(coords.lat, coords.lng, itemLat, itemLng);
        });
        
        return {
          type,
          count: items.length,
          avgDistance: distances.length > 0 ? distances.reduce((a, b) => a + b, 0) / distances.length : 0
        };
      });

      return categorized;
    } catch (error) {
      console.error('Error fetching amenities:', error);
      return [];
    }
  }

  private static async fetchTransitStops(coords: Coordinates) {
    const radius = 800; // 0.5 mile
    const query = `
      [out:json][timeout:25];
      (
        node["public_transport"="stop_position"](around:${radius},${coords.lat},${coords.lng});
        node["highway"="bus_stop"](around:${radius},${coords.lat},${coords.lng});
        node["railway"~"^(station|halt|tram_stop)$"](around:${radius},${coords.lat},${coords.lng});
      );
      out;
    `;

    try {
      const response = await fetch(this.OVERPASS_API, {
        method: 'POST',
        body: query
      });
      const data = await response.json();
      return data.elements || [];
    } catch (error) {
      console.error('Error fetching transit stops:', error);
      return [];
    }
  }

  private static async fetchBikeInfrastructure(coords: Coordinates) {
    const radius = 1600; // 1 mile
    const query = `
      [out:json][timeout:25];
      (
        way["highway"="cycleway"](around:${radius},${coords.lat},${coords.lng});
        way["cycleway"]["cycleway"!="no"](around:${radius},${coords.lat},${coords.lng});
        node["amenity"="bicycle_rental"](around:${radius},${coords.lat},${coords.lng});
      );
      out;
    `;

    try {
      const response = await fetch(this.OVERPASS_API, {
        method: 'POST',
        body: query
      });
      const data = await response.json();
      return data.elements || [];
    } catch (error) {
      console.error('Error fetching bike infrastructure:', error);
      return [];
    }
  }

  private static calculateWalkScore(amenities: Array<{type: string; count: number; avgDistance: number}>): number {
    let score = 0;
    
    amenities.forEach(amenity => {
      if (amenity.count > 0) {
        // Score based on count and proximity
        const proximityScore = Math.max(0, 100 - (amenity.avgDistance / 1600) * 100);
        const countScore = Math.min(amenity.count * 10, 30);
        score += (proximityScore + countScore) / 2;
      }
    });

    return Math.min(Math.round(score / amenities.length), 100);
  }

  private static calculateTransitScore(transitStops: any[]): number {
    if (transitStops.length === 0) return 0;
    
    // Base score on number of transit stops within walking distance
    const score = Math.min(transitStops.length * 15, 100);
    return Math.round(score);
  }

  private static calculateBikeScore(bikeInfrastructure: any[], amenities: Array<{type: string; count: number; avgDistance: number}>): number {
    let score = 0;
    
    // Score based on bike infrastructure
    const infraScore = Math.min(bikeInfrastructure.length * 8, 60);
    
    // Score based on bike-friendly destinations
    const destinationScore = amenities.reduce((total, amenity) => {
      return total + Math.min(amenity.count * 3, 10);
    }, 0);
    
    score = infraScore + Math.min(destinationScore, 40);
    return Math.min(Math.round(score), 100);
  }

  private static calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lng2-lng1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  }
}
