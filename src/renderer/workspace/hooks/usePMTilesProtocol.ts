import maplibregl from "maplibre-gl";
import { Protocol } from "pmtiles";
import { useEffect } from "react";

// Currently unused because the MapCanvas component is using OpenFreeMap public tiles.
// Will be used in the future when we want to host our own tiles with PMTiles.
export default function usePMTilesProtocol() {
  useEffect(() => {
    const protocol = new Protocol();
    maplibregl.addProtocol("pmtiles", protocol.tile);

    return () => {
      maplibregl.removeProtocol("pmtiles");
    };
  }, []);
}
