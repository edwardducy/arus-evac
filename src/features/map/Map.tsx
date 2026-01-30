import { useRef, useEffect } from "react";
import maplibregl from "maplibre-gl";

function Map() {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<maplibregl.Map | null>(null);
  const markers = useRef<maplibregl.Marker[]>([]);

  async function getRoute(start: [number, number], end: [number, number]) {
  const url = `http://localhost:5000/route/v1/foot/${start[0]},${start[1]};${end[0]},${end[1]}?geometries=geojson&overview=full`;
  
  const res = await fetch (url);
  const data = await res.json();
  const coordinates = data.routes[0].geometry.coordinates;


  const source = mapInstance.current!.getSource("route") as maplibregl.GeoJSONSource;

  source.setData({
    type: "Feature",
    properties: {},
    geometry: { 
      type: "LineString",
      coordinates,
    },
  })
}

  useEffect(() => {
    if (mapContainer.current && !mapInstance.current) {
      mapInstance.current = new maplibregl.Map({
        container: mapContainer.current,
        style: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json", //working tile server
        center: [121.0, 12.5], //starting point Philippines
        zoom: 5,
      });


      let points: [number, number][] = [];

      mapInstance.current.on("click", async (e) => {  
        const lngLat: [number, number] = [e.lngLat.lng, e.lngLat.lat];
        points.push(lngLat);

        markers.current.forEach((marker) => marker.remove());
        markers.current = [];

        points.forEach((point, index) => {
          const color = index === 0 ? "green" : index === points.length - 1 ? "red" : "blue";
          const marker = new maplibregl.Marker({ color })
            .setLngLat(point)
            .addTo(mapInstance.current!);
          markers.current.push(marker);
        });

        if (points.length === 2) {
          getRoute(points[0], points[1]);
          points = [];
        }
      });

        
    mapInstance.current.on("load", () => {
      mapInstance.current!.addSource("route", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates: [],
          }
        }
      });
    

    mapInstance.current!.addLayer({
      id: "route-line",
      type: "line",
      source: "route",
      paint: {
        "line-color": "#2563eb",
        "line-width": 4,
      },
    });
  });
    }

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  return <div ref={mapContainer} style={{width: '100%', height: '100vh'}} className="" />;
}

export default Map

