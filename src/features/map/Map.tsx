import { useRef, useEffect } from "react";
import maplibregl from "maplibre-gl";

function Map() {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<maplibregl.Map | null>(null);

  useEffect(() => {
    if (mapContainer.current && !mapInstance.current) {
      mapInstance.current = new maplibregl.Map({
        container: mapContainer.current,
        style: "positron.json",
        center: [0, 0],
        zoom: 2,
      });
    }

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  return <div ref={mapContainer} className="" />;
}

export default Map;
