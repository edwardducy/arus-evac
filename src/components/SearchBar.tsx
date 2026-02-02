// src/components/SearchBar.tsx
import React, { useState } from 'react';
import { geocoder, GeocoderResult } from '../services/geocoder';

interface SearchBarProps {
  onSearchResult?: (result: GeocoderResult | null) => void;
  onSearchResults?: (results: GeocoderResult[]) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  onSearchResult, 
  onSearchResults 
}) => {
  const [query, setQuery] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [results, setResults] = useState<GeocoderResult[]>([]);

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    console.log('Search button clicked, query:', query); // Debug log
    
    setIsSearching(true);
    
    try {
      // Use our geocoder service
      const searchResults = await geocoder.search(query);
      
      // Update local state
      setResults(searchResults);
      
      // Call the callback functions if provided
      if (onSearchResults) {
        onSearchResults(searchResults);
      }
      
      if (onSearchResult && searchResults.length > 0) {
        onSearchResult(searchResults[0]);
      }
      
      // Log the results to console (for debugging)
      if (searchResults.length > 0) {
        console.log('Geocoder results:', searchResults);
        console.log('First result coordinates:', {
          latitude: searchResults[0].latitude,
          longitude: searchResults[0].longitude
        });
      } else {
        console.log('No results found for:', query);
      }
      
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="search-bar" style={{ padding: '10px' }}>
      <div style={{ display: 'flex', gap: '8px' }}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Search for a location (e.g., One Ayala)"
          style={{
            flex: 1,
            padding: '8px 12px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            fontSize: '14px'
          }}
        />
        <button
          onClick={handleSearch}
          disabled={isSearching || !query.trim()}
          style={{
            padding: '8px 16px',
            backgroundColor: isSearching ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isSearching ? 'not-allowed' : 'pointer',
            fontSize: '14px'
          }}
        >
          {isSearching ? 'Searching...' : 'Search'}
        </button>
      </div>
      
      {/* Simple results display */}
      {results.length > 0 && (
        <div style={{ 
          marginTop: '10px', 
          fontSize: '12px',
          color: '#666'
        }}>
          <div>Found {results.length} result(s)</div>
          <div>First result: {results[0].address}</div>
          <div>Lat: {results[0].latitude.toFixed(6)}, Lon: {results[0].longitude.toFixed(6)}</div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;