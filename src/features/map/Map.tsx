import { useRef, useEffect } from "react";
import maplibregl from "maplibre-gl";

interface MapProps {
  coordinates?: {
    longitude: number;
    latitude: number;
  };
}

function Map({ coordinates }: MapProps) {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<maplibregl.Map | null>(null);

  // DEBUG: Log when coordinates change
  useEffect(() => {
    console.log('Map received coordinates:', coordinates);
  }, [coordinates]);

  useEffect(() => {
    if (mapContainer.current && !mapInstance.current) {
      console.log('Initializing map...');
      mapInstance.current = new maplibregl.Map({
        container: mapContainer.current,
        style: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
        center: [121.0244, 14.5547], // Manila coordinates
        zoom: 10,
      });
      
      // Wait for map to load
      mapInstance.current.on('load', () => {
        console.log('Map loaded successfully');
      });
    }

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  // New useEffect to handle panning to coordinates
  useEffect(() => {
    if (coordinates && mapInstance.current) {
      console.log('Panning map to:', coordinates.longitude, coordinates.latitude);
      
      mapInstance.current.flyTo({
        center: [coordinates.longitude, coordinates.latitude],
        zoom: 14,
        essential: true
      });
      
      // Clear existing markers first
      const markers = document.getElementsByClassName('maplibregl-marker');
      while(markers.length > 0) {
        markers[0].remove();
      }
      
      // Add a marker at the location
      new maplibregl.Marker()
        .setLngLat([coordinates.longitude, coordinates.latitude])
        .addTo(mapInstance.current);
    }
  }, [coordinates]);

  return <div ref={mapContainer} style={{ width: '100%', height: '500px' }} />;
}

export default Map;
