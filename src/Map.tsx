import ReactMapGL, {
  useControl,
  type ControlPosition,
  type MapProps as ReactMapProps,
} from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { MaplibreTerradrawControl } from "@watergis/maplibre-gl-terradraw";
import "@watergis/maplibre-gl-terradraw/dist/maplibre-gl-terradraw.css";

type DrawControlProps = {
  position?: ControlPosition;
};

function DrawControl({ position = "top-left" }: DrawControlProps) {
  useControl(
    () =>
      new MaplibreTerradrawControl({
        modes: [
          "render",
          "point",
          "marker",
          "linestring",
          "polygon",
          "rectangle",
          "circle",
          "freehand",
          "freehand-linestring",
          "angled-rectangle",
          "sensor",
          "sector",
          "select",
          "delete-selection",
          "delete",
          "download",
        ],
        open: true,
        showDeleteConfirmation: false,
      }),
    { position }
  );

  return null;
}

type MapProps = Omit<ReactMapProps, "mapStyle"> & {
  mapStyle?: ReactMapProps["mapStyle"];
};

function Map({
  mapStyle = "/positron.json",
  initialViewState = { longitude: 121, latitude: 13, zoom: 5 },
  style = { width: "100%", height: "100%" },
  ...props
}: MapProps) {
  return (
    <ReactMapGL
      mapStyle={mapStyle}
      initialViewState={initialViewState}
      style={style}
      {...props}
    >
      <DrawControl position="top-left" />
    </ReactMapGL>
  );
}

export default Map;
