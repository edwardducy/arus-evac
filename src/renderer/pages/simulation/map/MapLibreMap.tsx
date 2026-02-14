import maplibre from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { GeoJsonLayer, ScatterplotLayer, TextLayer } from "@deck.gl/layers";
import { useEffect, useMemo, useRef } from "react";
import {
  Map as MapLibreMap,
  type MapRef,
  NavigationControl,
} from "react-map-gl/maplibre";
import {
  trimIsochroneByExistingBoundaries,
  useSimulationContext,
} from "../SimulationProvider";
import DeckGLOverlay from "./DeckGLOverlay";

type ShelterBoundaryFeature = {
  properties: {
    color: [number, number, number];
    id: string;
  };
};

type EvacuationProgressFeature = {
  properties: {
    color: [number, number, number];
    complianceRate: number;
    fillProgress: number;
    shelterId: string;
    status: "high-compliance" | "moderate-compliance" | "low-compliance";
  };
};

type FloodHazardFeature = {
  properties: {
    intensity: number;
    remainingSteps: number;
  };
};

type DebrisHazardFeature = {
  properties: {
    intensity: number;
  };
};

type ReturnProgressFeature = {
  properties: {
    blockedReason: "clear" | "flooded-area" | "debris-on-route";
    returnProgress: number;
  };
};

type ShelterMarker = {
  id: string;
  position: [number, number];
};

type ShelterProgressLabel = {
  position: [number, number];
  progressText: string;
  status: "high-compliance" | "moderate-compliance" | "low-compliance" | "idle";
};

export default function MapLibreMapCanvas() {
  const {
    evacuationRun,
    returnHomeRun,
    setSimulationState,
    simulationState,
    shelters,
    typhoonRun,
    updateDraftShelter,
  } = useSimulationContext();
  const mapRef = useRef<MapRef | null>(null);
  const isAddingShelter = simulationState.mode === "add-shelters";
  const shelterCoordinates = simulationState.draftShelter?.coordinates || null;
  const draftColor = simulationState.draftShelter?.color || [239, 68, 68];
  const shelterRadiusMinutes =
    simulationState.draftShelter?.radiusMinutes || 10;
  const shelterIsochroneGeojson =
    simulationState.draftShelter?.isochroneGeojson;
  const selectedShelter = shelters.find(
    (shelter) => shelter.id === simulationState.selectedShelterId,
  );
  const isSimulating = simulationState.mode === "simulating";
  const isTyphoonPhase = simulationState.mode === "typhoon";
  const isReturningHome = simulationState.mode === "returning-home";
  const modeLabel = isAddingShelter
    ? "Placement Mode: Click to set shelter coordinates"
    : isReturningHome
      ? "Return-home mode: only clear routes can send households back."
      : isTyphoonPhase
        ? "Typhoon mode: hazards are active. Flood can recede, debris remains."
        : isSimulating
          ? "Regional evacuation mode: area fill shows evacuation progress and compliance"
          : "Browse Mode: Select a shelter from the list";

  const deckLayers = useMemo(() => {
    const layers: any[] = [];

    if (shelters.length > 0 && !isReturningHome) {
      layers.push(
        new GeoJsonLayer({
          data: {
            features: shelters.flatMap((shelter) =>
              (shelter.isochroneGeojson?.features || []).map(
                (feature: any) => ({
                  ...feature,
                  properties: {
                    ...(feature.properties || {}),
                    color: shelter.color,
                    id: shelter.id,
                  },
                }),
              ),
            ),
            type: "FeatureCollection",
          },
          filled: true,
          getFillColor: (feature: ShelterBoundaryFeature) =>
            evacuationRun.status === "idle"
              ? [...feature.properties.color, 55]
              : [203, 213, 225, 35],
          getLineColor: (feature: ShelterBoundaryFeature) =>
            [...feature.properties.color, 210] as [
              number,
              number,
              number,
              number,
            ],
          getLineWidth: (feature: ShelterBoundaryFeature) =>
            feature.properties.id === simulationState.selectedShelterId ? 3 : 2,
          id: "saved-shelter-boundaries",
          lineWidthMinPixels: 2,
          pickable: false,
          stroked: true,
        }),
      );
    }

    if (evacuationRun.regionalProgressGeojson?.features?.length) {
      layers.push(
        new GeoJsonLayer({
          data: evacuationRun.regionalProgressGeojson,
          filled: true,
          getFillColor: (feature: EvacuationProgressFeature) => {
            const [r, g, b] = feature.properties.color;
            const alpha = Math.round(
              35 + feature.properties.fillProgress * 195,
            );
            return [r, g, b, alpha] as [number, number, number, number];
          },
          getLineColor: (feature: EvacuationProgressFeature) => {
            if (feature.properties.status === "low-compliance") {
              return [185, 28, 28, 245] as [number, number, number, number];
            }

            if (feature.properties.status === "moderate-compliance") {
              return [217, 119, 6, 230] as [number, number, number, number];
            }

            return [22, 163, 74, 230] as [number, number, number, number];
          },
          getLineWidth: 2.2,
          id: "regional-evacuation-progress",
          lineWidthMinPixels: 2,
          pickable: false,
          stroked: true,
        }),
      );
    }

    if (returnHomeRun.returnProgressGeojson?.features?.length) {
      layers.push(
        new GeoJsonLayer({
          data: returnHomeRun.returnProgressGeojson,
          filled: true,
          getFillColor: (feature: ReturnProgressFeature) => {
            const blocked = feature.properties.blockedReason !== "clear";
            if (blocked) {
              return [180, 83, 9, 150] as [number, number, number, number];
            }

            const alpha = Math.round(
              40 + feature.properties.returnProgress * 185,
            );
            return [22, 163, 74, alpha] as [number, number, number, number];
          },
          getLineColor: (feature: ReturnProgressFeature) => {
            if (feature.properties.blockedReason === "flooded-area") {
              return [3, 105, 161, 240] as [number, number, number, number];
            }
            if (feature.properties.blockedReason === "debris-on-route") {
              return [146, 64, 14, 240] as [number, number, number, number];
            }
            return [21, 128, 61, 240] as [number, number, number, number];
          },
          getLineWidth: 2.3,
          id: "return-home-progress",
          lineWidthMinPixels: 2,
          pickable: false,
          stroked: true,
        }),
      );
    }

    if (typhoonRun.floodedAreaGeojson?.features?.length) {
      layers.push(
        new GeoJsonLayer({
          data: typhoonRun.floodedAreaGeojson,
          filled: true,
          getFillColor: (feature: FloodHazardFeature) => {
            const tint = Math.round(90 + feature.properties.intensity * 120);
            return [14, 116, 210, tint] as [number, number, number, number];
          },
          getLineColor: [12, 74, 110, 235],
          getLineWidth: 2,
          id: "typhoon-flood-hazards",
          lineWidthMinPixels: 2,
          pickable: false,
          stroked: true,
        }),
      );
    }

    if (typhoonRun.debrisGeojson?.features?.length) {
      layers.push(
        new GeoJsonLayer({
          data: typhoonRun.debrisGeojson,
          filled: true,
          getFillColor: (feature: DebrisHazardFeature) => {
            const tint = Math.round(130 + feature.properties.intensity * 90);
            return [120, 53, 15, tint] as [number, number, number, number];
          },
          getLineColor: [254, 243, 199, 240],
          getLineWidth: 1.2,
          getPointRadius: (feature: DebrisHazardFeature) =>
            60 + feature.properties.intensity * 75,
          id: "typhoon-debris-hazards",
          lineWidthMinPixels: 1,
          pickable: false,
          pointRadiusMinPixels: 5,
          pointType: "circle",
          stroked: true,
        }),
      );
    }

    if (isAddingShelter && shelterCoordinates) {
      layers.push(
        new ScatterplotLayer({
          data: [{ position: shelterCoordinates }],
          filled: true,
          getFillColor: [...draftColor, 230] as [
            number,
            number,
            number,
            number,
          ],
          getLineColor: [...draftColor, 255] as [
            number,
            number,
            number,
            number,
          ],
          getPosition: (d: any) => d.position,
          getRadius: 40,
          id: "draft-shelter-marker",
          lineWidthMinPixels: 2,
          pickable: false,
          radiusMinPixels: 10,
          radiusUnits: "meters",
          stroked: true,
        }),
      );
    }

    if (isAddingShelter && shelterIsochroneGeojson) {
      layers.push(
        new GeoJsonLayer({
          data: shelterIsochroneGeojson,
          filled: true,
          getFillColor: [...draftColor, 55] as [number, number, number, number],
          getLineColor: [...draftColor, 255] as [
            number,
            number,
            number,
            number,
          ],
          getLineWidth: 2,
          id: "shelter-isochrone",
          lineWidthMinPixels: 2,
          pickable: false,
          stroked: true,
        }),
      );
    }

    if (shelters.length > 0) {
      layers.push(
        new ScatterplotLayer({
          data: shelters.map((shelter) => ({
            id: shelter.id,
            position: shelter.coordinates,
          })),
          filled: true,
          getFillColor: (marker: ShelterMarker) => {
            const shelterColor = shelters.find((item) => item.id === marker.id)
              ?.color || [30, 64, 175];
            return [...shelterColor, 230] as [number, number, number, number];
          },
          getLineColor: (marker: ShelterMarker) => {
            if (marker.id === simulationState.selectedShelterId) {
              return [255, 255, 255, 255] as [number, number, number, number];
            }

            const shelterColor = shelters.find((item) => item.id === marker.id)
              ?.color || [0, 0, 0];
            return [...shelterColor, 255] as [number, number, number, number];
          },
          getPosition: (marker: ShelterMarker) => marker.position,
          getRadius: 40,
          id: "saved-shelter-markers",
          lineWidthMinPixels: 2,
          pickable: false,
          radiusMinPixels: 10,
          radiusUnits: "meters",
          stroked: true,
        }),
      );

      layers.push(
        new TextLayer({
          billboard: true,
          data: shelters.map((shelter) => {
            const zone = evacuationRun.zones.find(
              (item) => item.shelterId === shelter.id,
            );
            return {
              position: shelter.coordinates,
              progressText: `${Math.round((zone?.fillProgress || 0) * 100)}%`,
              status: zone?.status || "idle",
            };
          }),
          getAlignmentBaseline: "bottom",
          getColor: (label: ShelterProgressLabel) => {
            if (label.status === "low-compliance") {
              return [185, 28, 28, 240] as [number, number, number, number];
            }

            if (label.status === "moderate-compliance") {
              return [180, 83, 9, 240] as [number, number, number, number];
            }

            if (label.status === "high-compliance") {
              return [21, 128, 61, 240] as [number, number, number, number];
            }

            return [15, 23, 42, 220] as [number, number, number, number];
          },
          getPixelOffset: [0, -20],
          getPosition: (label: ShelterProgressLabel) => label.position,
          getSize: 15,
          getText: (label: ShelterProgressLabel) => label.progressText,
          getTextAnchor: "middle",
          id: "shelter-progress-labels",
          pickable: false,
        }),
      );
    }

    return layers;
  }, [
    draftColor,
    evacuationRun.regionalProgressGeojson,
    returnHomeRun.returnProgressGeojson,
    evacuationRun.status,
    evacuationRun.zones,
    isAddingShelter,
    isReturningHome,
    shelterCoordinates,
    shelterIsochroneGeojson,
    shelters,
    simulationState.selectedShelterId,
    typhoonRun.debrisGeojson,
    typhoonRun.floodedAreaGeojson,
  ]);

  useEffect(() => {
    let isCancelled = false;

    async function fetchIsochrone() {
      if (!isAddingShelter || !shelterCoordinates) {
        updateDraftShelter({ isochroneGeojson: null });
        return;
      }

      if (!window.valhalla) {
        console.warn("Valhalla preload bridge is not available.");
        updateDraftShelter({ isochroneGeojson: null });
        return;
      }

      const [lon, lat] = shelterCoordinates;

      try {
        const result = await window.valhalla.getIsochrone({
          lat,
          lon,
          minutes: shelterRadiusMinutes,
        });

        if (isCancelled) {
          return;
        }

        if (!result.ok) {
          console.error(
            `Failed to fetch isochrone: ${"error" in result ? result.error : "Unknown error"}`,
          );
          updateDraftShelter({ isochroneGeojson: null });
          return;
        }

        const trimmedIsochrone = trimIsochroneByExistingBoundaries(
          result.data,
          shelters,
        );

        updateDraftShelter({ isochroneGeojson: trimmedIsochrone });
      } catch (error: any) {
        console.error("Failed to fetch isochrone:", error);
        updateDraftShelter({ isochroneGeojson: null });
      }
    }

    fetchIsochrone();

    return () => {
      isCancelled = true;
    };
  }, [
    isAddingShelter,
    shelterCoordinates,
    shelterRadiusMinutes,
    shelters,
    updateDraftShelter,
  ]);

  useEffect(() => {
    if (!selectedShelter) {
      return;
    }

    mapRef.current?.flyTo({
      center: selectedShelter.coordinates,
      duration: 700,
      zoom: 15,
    });
  }, [selectedShelter]);

  return (
    <MapLibreMap
      initialViewState={{
        latitude: 13,
        longitude: 121.2,
        zoom: 5.5,
      }}
      mapLib={maplibre}
      mapStyle={"https://tiles.openfreemap.org/styles/liberty"}
      onClick={(e) => {
        if (isAddingShelter) {
          const coordinates: [number, number] = [e.lngLat.lng, e.lngLat.lat];
          setSimulationState((previousState) => ({
            ...previousState,
            draftShelter: previousState.draftShelter
              ? {
                  ...previousState.draftShelter,
                  coordinates,
                }
              : null,
            mode: "add-shelters",
          }));
        }
      }}
      ref={mapRef}
    >
      <NavigationControl position="top-right" />
      <div className="pointer-events-none absolute top-3 left-3 z-10 max-w-sm rounded-xl border border-white/60 bg-white/88 p-3 text-sm shadow-lg backdrop-blur-sm">
        <p className="text-xs font-semibold tracking-[0.12em] text-slate-500 uppercase">
          Map Guidance
        </p>
        <p className="mt-1 text-slate-800">{modeLabel}</p>
        {selectedShelter && (
          <p className="mt-1 text-xs text-slate-600">
            Active shelter:{" "}
            <span className="font-semibold">{selectedShelter.name}</span>
          </p>
        )}
        {evacuationRun.status !== "idle" && (
          <p className="mt-1 text-xs text-slate-600">
            Evacuation status:{" "}
            <span className="font-semibold">{evacuationRun.status}</span>
          </p>
        )}
        {typhoonRun.status !== "idle" && (
          <>
            <p className="mt-1 text-xs text-slate-600">
              Typhoon:{" "}
              <span className="font-semibold">
                {typhoonRun.stormActive ? "Active" : "Passed"}
              </span>
            </p>
            <p className="text-xs text-slate-600">
              Safety level:{" "}
              <span className="font-semibold">{typhoonRun.safetyLevel}</span>
            </p>
          </>
        )}
        {returnHomeRun.status !== "idle" && (
          <p className="text-xs text-slate-600">
            Return-home:{" "}
            <span className="font-semibold">{returnHomeRun.status}</span>
          </p>
        )}
      </div>
      <div className="pointer-events-none absolute bottom-3 left-3 z-10 rounded-xl border border-white/60 bg-white/88 p-3 text-xs shadow-lg backdrop-blur-sm">
        <p className="font-semibold tracking-wide text-slate-600 uppercase">
          Legend
        </p>
        <div className="mt-2 space-y-1 text-slate-700">
          <p>
            <span className="mr-2 inline-block h-2.5 w-2.5 rounded-full bg-slate-900" />
            Shelter point
          </p>
          <p>
            <span className="mr-2 inline-block h-2.5 w-2.5 rounded-full border border-slate-500 bg-cyan-300/70" />
            Regional fill = evacuation progress
          </p>
          <p>
            <span className="mr-2 inline-block h-[2px] w-3 bg-emerald-600 align-middle" />
            High compliance area
          </p>
          <p>
            <span className="mr-2 inline-block h-[2px] w-3 bg-amber-600 align-middle" />
            Moderate compliance area
          </p>
          <p>
            <span className="mr-2 inline-block h-[2px] w-3 bg-red-700 align-middle" />
            Low compliance area
          </p>
          <p>
            <span className="mr-2 inline-block h-2.5 w-2.5 rounded-full bg-blue-600/80" />
            Flooded area (recedes over time)
          </p>
          <p>
            <span className="mr-2 inline-block h-2.5 w-2.5 rounded-full bg-amber-800/80" />
            Fallen debris (persistent)
          </p>
          <p>
            <span className="mr-2 inline-block h-2.5 w-2.5 rounded-full bg-emerald-600/80" />
            Home return progress (clear routes)
          </p>
          <p>
            <span className="mr-2 inline-block h-2.5 w-2.5 rounded-full bg-amber-700/80" />
            Return blocked (hazard on route)
          </p>
        </div>
      </div>
      <DeckGLOverlay layers={deckLayers} />
    </MapLibreMap>
  );
}
