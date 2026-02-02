// src/App.tsx
import { useState } from 'react';
import SearchBar from './components/SearchBar';
import Map from './features/map/Map';
import { GeocoderResult } from './services/geocoder';

function App() {
  const [mapCoordinates, setMapCoordinates] = useState<GeocoderResult | null>(null);

  const handleSearchResult = (result: GeocoderResult | null) => {
    if (result) {
      console.log('App received geocoder result:', result);
      console.log('Moving map to:', result.latitude, result.longitude);
      setMapCoordinates(result);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Arus Evac - Geocoder with Map</h1>
      <p>Search for a location and watch the map pan to it!</p>
      
      <div style={{ marginBottom: '20px' }}>
        <SearchBar onSearchResult={handleSearchResult} />
      </div>
      
      <div style={{ border: '1px solid #ccc', borderRadius: '8px', overflow: 'hidden', height: '500px' }}>
        <Map coordinates={mapCoordinates ? {
          longitude: mapCoordinates.longitude,
          latitude: mapCoordinates.latitude
        } : undefined} />
      </div>
      
      <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
        <p>Try searching for:</p>
        <ul>
          <li>"One Ayala" - Makati</li>
          <li>"Rizal Park" - Manila</li>
          <li>"SM Mall of Asia" - Pasay</li>
          <li>"Baguio City"</li>
        </ul>
        {mapCoordinates && (
          <div style={{ backgroundColor: '#f0f8ff', padding: '10px', borderRadius: '4px' }}>
            <p><strong>Current Location:</strong> {mapCoordinates.address}</p>
            <p><strong>Latitude:</strong> {mapCoordinates.latitude.toFixed(6)}</p>
            <p><strong>Longitude:</strong> {mapCoordinates.longitude.toFixed(6)}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
