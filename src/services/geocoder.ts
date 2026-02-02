// src/services/geocoder.ts

// Interface for the geocoder result
export interface GeocoderResult {
  latitude: number;
  longitude: number;
  address: string;
  label?: string;
}

// Main geocoder class
export class PeliasGeocoder {
  // Using a public Pelias instance (OpenStreetMap based)
  private baseUrl: string = 'https://photon.komoot.io/api';
  
  // You can optionally add an API key later
  private apiKey: string | null = null;
  
  constructor() {

  }
  
  async search(query: string): Promise<GeocoderResult[]> {
    try {
      // Build the URL with query parameters
      let url = `${this.baseUrl}?q=${encodeURIComponent(query)}&limit=5`;

      url += '&lat=14.5995&lon=120.9842&location_bias_scale=0.5';

      console.log('Geocoder fetching:', url);
      
      // Make the API call
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Geocoder API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Extract results from the response
      if (!data.features || !Array.isArray(data.features)) {
        return [];
      }
      
      // Map the results to our interface
      return data.features.map((feature: any) => ({
        latitude: feature.geometry.coordinates[1],
        longitude: feature.geometry.coordinates[0],
        address: feature.properties.name || 'No address',
        label: feature.properties.name
      }));
      
      
    } catch (error) {
      console.error('Geocoder error:', error);
      // Return empty array on error
      return [];
    }
  }
  
  /**
   * Simple search that returns just the first result
   * Useful for getting coordinates quickly
   */
  async searchFirst(query: string): Promise<GeocoderResult | null> {
    const results = await this.search(query);
    return results.length > 0 ? results[0] : null;
  }
}

// Create a default instance for easy use
export const geocoder = new PeliasGeocoder();