import maplibre from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import MapCanvas from "react-map-gl/maplibre";

export default function BaseMap() {
  return (
    <MapCanvas
      initialViewState={{
        latitude: 13,
        longitude: 121.2,
        zoom: 5.5,
      }}
      mapLib={maplibre}
      mapStyle={"https://tiles.openfreemap.org/styles/liberty"}
      style={{ height: "100%", width: "100%" }}
    />
  );
}
