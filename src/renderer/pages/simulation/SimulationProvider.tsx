import {
  createContext,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

export const DEFAULT_SHELTER_RADIUS_MINUTES = 10;

export type Coordinates = [number, number];

type SimulationMode =
  | "idle"
  | "add-shelters"
  | "view-shelter"
  | "simulating"
  | "typhoon"
  | "returning-home";

type EvacuationStatus = "idle" | "running" | "completed" | "error";

type EvacuationZoneStatus =
  | "high-compliance"
  | "moderate-compliance"
  | "low-compliance";

type HazardType = "flood" | "debris";

type TyphoonStatus = "idle" | "running" | "completed" | "error";

type TyphoonHazard = {
  center: Coordinates;
  id: string;
  intensity: number;
  remainingSteps: number;
  sizeDegrees: number;
  type: HazardType;
};

export type Shelter = {
  color: [number, number, number];
  coordinates: Coordinates;
  id: string;
  isochroneGeojson: any;
  name: string;
  radiusMinutes: number;
};

export type ShelterDraft = {
  color: [number, number, number];
  coordinates: Coordinates | null;
  isochroneGeojson: any;
  name: string;
  radiusMinutes: number;
};

export type EvacuationZoneProgress = {
  complianceRate: number;
  evacuatedHouseholds: number;
  fillProgress: number;
  shelterId: string;
  shelterName: string;
  status: EvacuationZoneStatus;
  targetProgress: number;
  totalHouseholds: number;
};

export type EvacuationRun = {
  elapsedSteps: number;
  error: string | null;
  regionalProgressGeojson: any;
  status: EvacuationStatus;
  totalSteps: number;
  zones: EvacuationZoneProgress[];
};

export type TyphoonRun = {
  canReturnHome: boolean;
  debrisGeojson: any;
  elapsedSteps: number;
  error: string | null;
  floodedAreaGeojson: any;
  hazards: TyphoonHazard[];
  safetyLevel: number;
  status: TyphoonStatus;
  stormActive: boolean;
  totalHazards: number;
  totalSteps: number;
};

type ReturnBlockReason = "clear" | "flooded-area" | "debris-on-route";

export type ReturnHomeZoneProgress = {
  blockedReason: ReturnBlockReason;
  homeAnchor: Coordinates;
  householdsAtShelter: number;
  householdsReturned: number;
  returnProgress: number;
  shelterId: string;
  shelterName: string;
  totalHouseholds: number;
};

type ReturnHomeStatus = "idle" | "running" | "completed" | "error";

export type ReturnHomeRun = {
  elapsedSteps: number;
  error: string | null;
  returnProgressGeojson: any;
  status: ReturnHomeStatus;
  totalSteps: number;
  zones: ReturnHomeZoneProgress[];
};

export type SimulationState = {
  draftShelter: ShelterDraft | null;
  mode: SimulationMode;
  selectedShelterId: string | null;
};

type SimulationContextValue = {
  confirmDraftShelter: () => Shelter | null;
  deleteShelter: (shelterId: string) => void;
  evacuationRun: EvacuationRun;
  resetEvacuationSimulation: () => void;
  setSimulationState: Dispatch<SetStateAction<SimulationState>>;
  setShelters: Dispatch<SetStateAction<Shelter[]>>;
  shelters: Shelter[];
  simulationState: SimulationState;
  startAddShelter: () => void;
  startEvacuationSimulation: () => Promise<void>;
  startReturnHomePhase: () => void;
  startTyphoonPhase: () => void;
  returnHomeRun: ReturnHomeRun;
  typhoonRun: TyphoonRun;
  updateDraftShelter: (patch: Partial<ShelterDraft>) => void;
  viewShelter: (shelterId: string) => void;
};

const initialSimulationState: SimulationState = {
  draftShelter: null,
  mode: "idle",
  selectedShelterId: null,
};

const initialEvacuationRun: EvacuationRun = {
  elapsedSteps: 0,
  error: null,
  regionalProgressGeojson: {
    features: [],
    type: "FeatureCollection",
  },
  status: "idle",
  totalSteps: 0,
  zones: [],
};

const initialTyphoonRun: TyphoonRun = {
  canReturnHome: false,
  debrisGeojson: {
    features: [],
    type: "FeatureCollection",
  },
  elapsedSteps: 0,
  error: null,
  floodedAreaGeojson: {
    features: [],
    type: "FeatureCollection",
  },
  hazards: [],
  safetyLevel: 100,
  status: "idle",
  stormActive: false,
  totalHazards: 0,
  totalSteps: 0,
};

const initialReturnHomeRun: ReturnHomeRun = {
  elapsedSteps: 0,
  error: null,
  returnProgressGeojson: {
    features: [],
    type: "FeatureCollection",
  },
  status: "idle",
  totalSteps: 0,
  zones: [],
};

const EVACUATION_PROGRESS_STEP = 0.01;
const EVACUATION_ANIMATION_INTERVAL_MS = 1000;

const TYPHOON_ANIMATION_INTERVAL_MS = 1000;
const TYPHOON_TOTAL_STEPS = 90;
const TYPHOON_STORM_ACTIVE_STEPS = 50;
const FLOOD_MIN_TTL_STEPS = 18;
const FLOOD_MAX_TTL_STEPS = 44;
const RETURN_HOME_SAFETY_THRESHOLD = 78;
const RETURN_HOME_HAZARD_THRESHOLD = 10;
const RETURN_HOME_PROGRESS_STEP = 0.015;
const RETURN_HOME_ANIMATION_INTERVAL_MS = 1000;
const RETURN_HOME_MAX_STEPS = 150;
const DEBRIS_BLOCK_RADIUS_MULTIPLIER = 1.1;

const SimulationContext = createContext<SimulationContextValue | null>(null);

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  const saturation = s / 100;
  const lightness = l / 100;
  const c = (1 - Math.abs(2 * lightness - 1)) * saturation;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = lightness - c / 2;
  let r = 0;
  let g = 0;
  let b = 0;

  if (h < 60) {
    r = c;
    g = x;
  } else if (h < 120) {
    r = x;
    g = c;
  } else if (h < 180) {
    g = c;
    b = x;
  } else if (h < 240) {
    g = x;
    b = c;
  } else if (h < 300) {
    r = x;
    b = c;
  } else {
    r = c;
    b = x;
  }

  return [
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((b + m) * 255),
  ];
}

function createDefaultDraftShelter(index: number): ShelterDraft {
  return {
    color: getShelterColor(index),
    coordinates: null,
    isochroneGeojson: null,
    name: `Shelter ${index}`,
    radiusMinutes: DEFAULT_SHELTER_RADIUS_MINUTES,
  };
}

function getShelterColor(index: number): [number, number, number] {
  const hue = (index * 137.508) % 360;
  return hslToRgb(hue, 72, 45);
}

type Point = [number, number];
type Ring = Point[];
type Polygon = Ring[];

function extractPolygonsFromGeojson(geojson: any): Polygon[] {
  if (!geojson?.features || !Array.isArray(geojson.features)) {
    return [];
  }

  const polygons: Polygon[] = [];
  for (const feature of geojson.features) {
    const geometry = feature?.geometry;
    if (!geometry) {
      continue;
    }

    if (geometry.type === "Polygon") {
      polygons.push(geometry.coordinates as Polygon);
      continue;
    }

    if (geometry.type === "MultiPolygon") {
      polygons.push(...(geometry.coordinates as Polygon[]));
    }
  }

  return polygons;
}

function getRingBoundingBox(ring: Ring) {
  const longitudes = ring.map((point) => point[0]);
  const latitudes = ring.map((point) => point[1]);
  return {
    maxX: Math.max(...longitudes),
    maxY: Math.max(...latitudes),
    minX: Math.min(...longitudes),
    minY: Math.min(...latitudes),
  };
}

function boundingBoxesOverlap(ringA: Ring, ringB: Ring) {
  const bboxA = getRingBoundingBox(ringA);
  const bboxB = getRingBoundingBox(ringB);
  return !(
    bboxA.maxX < bboxB.minX ||
    bboxA.minX > bboxB.maxX ||
    bboxA.maxY < bboxB.minY ||
    bboxA.minY > bboxB.maxY
  );
}

function orientation(a: Point, b: Point, c: Point) {
  const value = (b[1] - a[1]) * (c[0] - b[0]) - (b[0] - a[0]) * (c[1] - b[1]);
  if (value === 0) {
    return 0;
  }

  return value > 0 ? 1 : 2;
}

function onSegment(a: Point, b: Point, c: Point) {
  return (
    b[0] <= Math.max(a[0], c[0]) &&
    b[0] >= Math.min(a[0], c[0]) &&
    b[1] <= Math.max(a[1], c[1]) &&
    b[1] >= Math.min(a[1], c[1])
  );
}

function segmentsIntersect(p1: Point, q1: Point, p2: Point, q2: Point) {
  const o1 = orientation(p1, q1, p2);
  const o2 = orientation(p1, q1, q2);
  const o3 = orientation(p2, q2, p1);
  const o4 = orientation(p2, q2, q1);

  if (o1 !== o2 && o3 !== o4) {
    return true;
  }

  if (o1 === 0 && onSegment(p1, p2, q1)) {
    return true;
  }
  if (o2 === 0 && onSegment(p1, q2, q1)) {
    return true;
  }
  if (o3 === 0 && onSegment(p2, p1, q2)) {
    return true;
  }
  if (o4 === 0 && onSegment(p2, q1, q2)) {
    return true;
  }

  return false;
}

function pointInRing(point: Point, ring: Ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0];
    const yi = ring[i][1];
    const xj = ring[j][0];
    const yj = ring[j][1];

    const intersect =
      yi > point[1] !== yj > point[1] &&
      point[0] <
        ((xj - xi) * (point[1] - yi)) / (yj - yi + Number.EPSILON) + xi;
    if (intersect) {
      inside = !inside;
    }
  }

  return inside;
}

function ringsOverlap(ringA: Ring, ringB: Ring) {
  if (!boundingBoxesOverlap(ringA, ringB)) {
    return false;
  }

  for (let i = 0; i < ringA.length - 1; i += 1) {
    const aStart = ringA[i];
    const aEnd = ringA[i + 1];
    for (let j = 0; j < ringB.length - 1; j += 1) {
      const bStart = ringB[j];
      const bEnd = ringB[j + 1];
      if (segmentsIntersect(aStart, aEnd, bStart, bEnd)) {
        return true;
      }
    }
  }

  if (pointInRing(ringA[0], ringB) || pointInRing(ringB[0], ringA)) {
    return true;
  }

  return false;
}

function getComplianceStatus(rate: number): EvacuationZoneStatus {
  if (rate < 0.5) {
    return "low-compliance";
  }

  if (rate < 0.75) {
    return "moderate-compliance";
  }

  return "high-compliance";
}

function buildRegionalProgressGeojson(
  shelters: Shelter[],
  zones: EvacuationZoneProgress[],
) {
  return {
    features: shelters.flatMap((shelter) => {
      const zone = zones.find((item) => item.shelterId === shelter.id);
      if (!zone) {
        return [];
      }

      return (shelter.isochroneGeojson?.features || []).map((feature: any) => ({
        ...feature,
        properties: {
          ...(feature.properties || {}),
          color: shelter.color,
          complianceRate: zone.complianceRate,
          fillProgress: zone.fillProgress,
          shelterId: shelter.id,
          shelterName: shelter.name,
          status: zone.status,
        },
      }));
    }),
    type: "FeatureCollection",
  };
}

function createCirclePolygon(
  center: Coordinates,
  radiusDegrees: number,
  sides = 28,
): Coordinates[] {
  const points: Coordinates[] = [];
  for (let index = 0; index <= sides; index += 1) {
    const angle = (Math.PI * 2 * index) / sides;
    points.push([
      center[0] + Math.cos(angle) * radiusDegrees,
      center[1] + Math.sin(angle) * radiusDegrees,
    ]);
  }

  return points;
}

function buildTyphoonHazardsGeojson(hazards: TyphoonHazard[]) {
  const floodFeatures = hazards
    .filter((hazard) => hazard.type === "flood")
    .map((hazard) => ({
      geometry: {
        coordinates: [[createCirclePolygon(hazard.center, hazard.sizeDegrees)]],
        type: "MultiPolygon",
      },
      properties: {
        hazardId: hazard.id,
        intensity: hazard.intensity,
        remainingSteps: hazard.remainingSteps,
      },
      type: "Feature",
    }));

  const debrisFeatures = hazards
    .filter((hazard) => hazard.type === "debris")
    .map((hazard) => ({
      geometry: {
        coordinates: hazard.center,
        type: "Point",
      },
      properties: {
        hazardId: hazard.id,
        intensity: hazard.intensity,
      },
      type: "Feature",
    }));

  return {
    debrisGeojson: {
      features: debrisFeatures,
      type: "FeatureCollection",
    },
    floodedAreaGeojson: {
      features: floodFeatures,
      type: "FeatureCollection",
    },
  };
}

function calculateSafetyLevel(hazards: TyphoonHazard[], stormActive: boolean) {
  const floodRisk = hazards
    .filter((hazard) => hazard.type === "flood")
    .reduce((total, hazard) => total + hazard.intensity * 15, 0);
  const debrisRisk = hazards
    .filter((hazard) => hazard.type === "debris")
    .reduce((total, hazard) => total + hazard.intensity * 22, 0);
  const stormPenalty = stormActive ? 10 : 0;

  const safetyLevel = Math.round(
    Math.max(0, Math.min(100, 100 - floodRisk - debrisRisk - stormPenalty)),
  );

  return safetyLevel;
}

function randomHazardSpawnCenter(shelters: Shelter[]): Coordinates {
  if (shelters.length === 0) {
    return [121.2, 13];
  }

  const shelter = shelters[Math.floor(Math.random() * shelters.length)];
  const spread = Math.max(0.01, shelter.radiusMinutes * 0.0035);
  const angle = Math.random() * Math.PI * 2;
  const distance = Math.sqrt(Math.random()) * spread;

  return [
    shelter.coordinates[0] + Math.cos(angle) * distance,
    shelter.coordinates[1] + Math.sin(angle) * distance,
  ];
}

function createHazard(shelters: Shelter[]): TyphoonHazard {
  const isFlood = Math.random() < 0.82;
  const intensity = Number((0.45 + Math.random() * 0.5).toFixed(2));

  if (isFlood) {
    return {
      center: randomHazardSpawnCenter(shelters),
      id: `${Date.now()}-f-${Math.random().toString(36).slice(2, 8)}`,
      intensity,
      remainingSteps:
        FLOOD_MIN_TTL_STEPS +
        Math.floor(Math.random() * (FLOOD_MAX_TTL_STEPS - FLOOD_MIN_TTL_STEPS)),
      sizeDegrees: 0.0035 + intensity * 0.01,
      type: "flood",
    };
  }

  return {
    center: randomHazardSpawnCenter(shelters),
    id: `${Date.now()}-d-${Math.random().toString(36).slice(2, 8)}`,
    intensity,
    remainingSteps: -1,
    sizeDegrees: 0.0014 + intensity * 0.0025,
    type: "debris",
  };
}

function getIsochroneRepresentativePoint(
  isochroneGeojson: any,
  fallback: Coordinates,
): Coordinates {
  const polygons = extractPolygonsFromGeojson(isochroneGeojson);
  const firstRing = polygons[0]?.[0];
  if (!firstRing?.length) {
    return fallback;
  }

  const points = firstRing.slice(0, Math.max(1, firstRing.length - 1));
  const sum = points.reduce(
    (acc, point) => [acc[0] + point[0], acc[1] + point[1]] as Coordinates,
    [0, 0] as Coordinates,
  );
  return [sum[0] / points.length, sum[1] / points.length];
}

function distanceBetween(a: Coordinates, b: Coordinates) {
  const dx = a[0] - b[0];
  const dy = a[1] - b[1];
  return Math.sqrt(dx * dx + dy * dy);
}

function buildReturnProgressGeojson(
  shelters: Shelter[],
  zones: ReturnHomeZoneProgress[],
) {
  return {
    features: shelters.flatMap((shelter) => {
      const zone = zones.find((item) => item.shelterId === shelter.id);
      if (!zone) {
        return [];
      }

      return (shelter.isochroneGeojson?.features || []).map((feature: any) => ({
        ...feature,
        properties: {
          ...(feature.properties || {}),
          blockedReason: zone.blockedReason,
          color: shelter.color,
          householdsReturned: zone.householdsReturned,
          returnProgress: zone.returnProgress,
          shelterId: shelter.id,
          shelterName: shelter.name,
          totalHouseholds: zone.totalHouseholds,
        },
      }));
    }),
    type: "FeatureCollection",
  };
}

function interpolateLine(start: Coordinates, end: Coordinates, segments = 28) {
  return Array.from({ length: segments + 1 }).map((_, index) => {
    const t = index / segments;
    return [
      start[0] + (end[0] - start[0]) * t,
      start[1] + (end[1] - start[1]) * t,
    ] as Coordinates;
  });
}

function detectReturnBlockReason(
  shelter: Shelter,
  zone: ReturnHomeZoneProgress,
  hazards: TyphoonHazard[],
): ReturnBlockReason {
  const routeLine = interpolateLine(shelter.coordinates, zone.homeAnchor);

  const flooded = hazards.filter((hazard) => hazard.type === "flood");
  const isFloodBlocked = routeLine.some((point) =>
    flooded.some(
      (hazard) => distanceBetween(point, hazard.center) <= hazard.sizeDegrees,
    ),
  );
  if (isFloodBlocked) {
    return "flooded-area";
  }

  const debris = hazards.filter((hazard) => hazard.type === "debris");
  const isDebrisBlocked = routeLine.some((point) =>
    debris.some(
      (hazard) =>
        distanceBetween(point, hazard.center) <=
        hazard.sizeDegrees * DEBRIS_BLOCK_RADIUS_MULTIPLIER,
    ),
  );
  if (isDebrisBlocked) {
    return "debris-on-route";
  }

  return "clear";
}

export function boundariesOverlap(geojsonA: any, geojsonB: any) {
  const polygonsA = extractPolygonsFromGeojson(geojsonA);
  const polygonsB = extractPolygonsFromGeojson(geojsonB);

  for (const polygonA of polygonsA) {
    const outerRingA = polygonA[0];
    if (!outerRingA?.length) {
      continue;
    }

    for (const polygonB of polygonsB) {
      const outerRingB = polygonB[0];
      if (!outerRingB?.length) {
        continue;
      }

      if (ringsOverlap(outerRingA, outerRingB)) {
        return true;
      }
    }
  }

  return false;
}

export function isPointWithinBoundary(point: Point, geojson: any) {
  const polygons = extractPolygonsFromGeojson(geojson);
  for (const polygon of polygons) {
    const outerRing = polygon[0];
    if (outerRing?.length && pointInRing(point, outerRing)) {
      return true;
    }
  }

  return false;
}

export function trimIsochroneByExistingBoundaries(
  draftIsochroneGeojson: any,
  existingShelters: Shelter[],
) {
  if (
    !draftIsochroneGeojson?.features?.length ||
    existingShelters.length === 0
  ) {
    return draftIsochroneGeojson;
  }

  const keptFeatures = (draftIsochroneGeojson.features || []).filter(
    (feature: any) => {
      const geometry = feature?.geometry;
      if (!geometry) {
        return false;
      }

      const polygons =
        geometry.type === "Polygon"
          ? [geometry.coordinates]
          : geometry.type === "MultiPolygon"
            ? geometry.coordinates
            : [];
      if (polygons.length === 0) {
        return false;
      }

      return polygons.some((polygon: any) => {
        const ring = polygon?.[0];
        if (!Array.isArray(ring) || ring.length === 0) {
          return false;
        }

        return ring.some((point: Point) => {
          return !existingShelters.some((shelter) =>
            isPointWithinBoundary(point, shelter.isochroneGeojson),
          );
        });
      });
    },
  );

  return {
    ...draftIsochroneGeojson,
    features: keptFeatures,
  };
}

export function SimulationProvider({ children }: { children: ReactNode }) {
  const [simulationState, setSimulationState] = useState<SimulationState>(
    initialSimulationState,
  );
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [evacuationRun, setEvacuationRun] =
    useState<EvacuationRun>(initialEvacuationRun);
  const [returnHomeRun, setReturnHomeRun] =
    useState<ReturnHomeRun>(initialReturnHomeRun);
  const [typhoonRun, setTyphoonRun] = useState<TyphoonRun>(initialTyphoonRun);
  const nextColorIndexRef = useRef(0);
  const evacuationTimerRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );
  const typhoonTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const returnHomeTimerRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );

  const clearEvacuationTimer = useCallback(() => {
    if (evacuationTimerRef.current) {
      clearInterval(evacuationTimerRef.current);
      evacuationTimerRef.current = null;
    }
  }, []);

  const clearTyphoonTimer = useCallback(() => {
    if (typhoonTimerRef.current) {
      clearInterval(typhoonTimerRef.current);
      typhoonTimerRef.current = null;
    }
  }, []);

  const clearReturnHomeTimer = useCallback(() => {
    if (returnHomeTimerRef.current) {
      clearInterval(returnHomeTimerRef.current);
      returnHomeTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      clearEvacuationTimer();
      clearTyphoonTimer();
      clearReturnHomeTimer();
    };
  }, [clearEvacuationTimer, clearTyphoonTimer, clearReturnHomeTimer]);

  const resetEvacuationSimulation = useCallback(() => {
    clearEvacuationTimer();
    clearTyphoonTimer();
    clearReturnHomeTimer();
    setEvacuationRun(initialEvacuationRun);
    setReturnHomeRun(initialReturnHomeRun);
    setTyphoonRun(initialTyphoonRun);
    setSimulationState((previousState) => ({
      ...previousState,
      mode: previousState.selectedShelterId ? "view-shelter" : "idle",
    }));
  }, [clearEvacuationTimer, clearTyphoonTimer, clearReturnHomeTimer]);

  const startAddShelter = useCallback(() => {
    resetEvacuationSimulation();
    nextColorIndexRef.current += 1;
    const colorIndex = nextColorIndexRef.current;
    setSimulationState((previousState) => ({
      ...previousState,
      draftShelter: createDefaultDraftShelter(colorIndex),
      mode: "add-shelters",
      selectedShelterId: null,
    }));
  }, [resetEvacuationSimulation]);

  const updateDraftShelter = useCallback((patch: Partial<ShelterDraft>) => {
    setSimulationState((previousState) => {
      if (!previousState.draftShelter) {
        return previousState;
      }

      return {
        ...previousState,
        draftShelter: {
          ...previousState.draftShelter,
          ...patch,
        },
      };
    });
  }, []);

  const confirmDraftShelter = useCallback((): Shelter | null => {
    const draft = simulationState.draftShelter;
    if (
      !draft ||
      !draft.coordinates ||
      !draft.name.trim() ||
      !draft.isochroneGeojson
    ) {
      return null;
    }

    const shelter: Shelter = {
      color: draft.color,
      coordinates: draft.coordinates,
      id:
        typeof crypto?.randomUUID === "function"
          ? crypto.randomUUID()
          : `${Date.now()}`,
      isochroneGeojson: draft.isochroneGeojson,
      name: draft.name.trim(),
      radiusMinutes: draft.radiusMinutes,
    };

    setShelters((previousShelters) => [...previousShelters, shelter]);
    setSimulationState((previousState) => ({
      ...previousState,
      draftShelter: null,
      mode: "view-shelter",
      selectedShelterId: shelter.id,
    }));

    return shelter;
  }, [simulationState.draftShelter]);

  const deleteShelter = useCallback(
    (shelterId: string) => {
      resetEvacuationSimulation();
      const remainingShelters = shelters.filter(
        (shelter) => shelter.id !== shelterId,
      );
      setShelters(remainingShelters);
      setSimulationState((previousState) => {
        const nextSelectedShelterId =
          previousState.selectedShelterId === shelterId
            ? (remainingShelters[0]?.id ?? null)
            : previousState.selectedShelterId;

        return {
          ...previousState,
          draftShelter: null,
          mode: nextSelectedShelterId ? "view-shelter" : "idle",
          selectedShelterId: nextSelectedShelterId,
        };
      });
    },
    [resetEvacuationSimulation, shelters],
  );

  const startEvacuationSimulation = useCallback(async () => {
    if (shelters.length === 0) {
      setEvacuationRun({
        ...initialEvacuationRun,
        error: "Add at least one shelter before starting the simulation.",
        status: "error",
      });
      return;
    }

    clearEvacuationTimer();
    clearReturnHomeTimer();

    const zones: EvacuationZoneProgress[] = shelters.map((shelter) => {
      const baseHouseholds = 180 + shelter.radiusMinutes * 28;
      const randomHouseholds = Math.floor(Math.random() * 220);
      const totalHouseholds = Math.max(
        80,
        Math.round(baseHouseholds + randomHouseholds),
      );
      const complianceRate = Number((0.35 + Math.random() * 0.6).toFixed(2));

      return {
        complianceRate,
        evacuatedHouseholds: 0,
        fillProgress: 0,
        shelterId: shelter.id,
        shelterName: shelter.name,
        status: getComplianceStatus(complianceRate),
        targetProgress: complianceRate,
        totalHouseholds,
      };
    });

    setSimulationState((previousState) => ({
      ...previousState,
      mode: "simulating",
      selectedShelterId: previousState.selectedShelterId || shelters[0].id,
    }));

    setEvacuationRun({
      elapsedSteps: 0,
      error: null,
      regionalProgressGeojson: buildRegionalProgressGeojson(shelters, zones),
      status: "running",
      totalSteps: Math.max(
        1,
        Math.ceil(Math.max(...zones.map((zone) => zone.targetProgress)) * 100),
      ),
      zones,
    });

    let currentStep = 0;
    evacuationTimerRef.current = setInterval(() => {
      currentStep += 1;

      setEvacuationRun((previousRun) => {
        const nextZones = previousRun.zones.map((zone) => {
          const fillProgress = Math.min(
            zone.targetProgress,
            zone.fillProgress + EVACUATION_PROGRESS_STEP,
          );
          return {
            ...zone,
            evacuatedHouseholds: Math.round(
              zone.totalHouseholds * fillProgress,
            ),
            fillProgress,
          };
        });
        const allZonesReachedTarget = nextZones.every(
          (zone) => zone.fillProgress >= zone.targetProgress,
        );

        return {
          ...previousRun,
          elapsedSteps: currentStep,
          regionalProgressGeojson: buildRegionalProgressGeojson(
            shelters,
            nextZones,
          ),
          status: allZonesReachedTarget ? "completed" : "running",
          zones: nextZones,
        };
      });

      if (currentStep >= 100) {
        clearEvacuationTimer();
      }
    }, EVACUATION_ANIMATION_INTERVAL_MS);
  }, [clearEvacuationTimer, clearReturnHomeTimer, shelters]);

  const startTyphoonPhase = useCallback(() => {
    if (shelters.length === 0) {
      setTyphoonRun({
        ...initialTyphoonRun,
        error: "Add shelters before starting the typhoon phase.",
        status: "error",
      });
      return;
    }

    clearTyphoonTimer();
    clearReturnHomeTimer();

    setSimulationState((previousState) => ({
      ...previousState,
      mode: "typhoon",
      selectedShelterId: previousState.selectedShelterId || shelters[0].id,
    }));

    setTyphoonRun({
      ...initialTyphoonRun,
      status: "running",
      stormActive: true,
      totalSteps: TYPHOON_TOTAL_STEPS,
    });

    let currentStep = 0;
    typhoonTimerRef.current = setInterval(() => {
      currentStep += 1;

      setTyphoonRun((previousRun) => {
        const stormActive = currentStep <= TYPHOON_STORM_ACTIVE_STEPS;

        let nextHazards = previousRun.hazards
          .map((hazard) => {
            if (hazard.type !== "flood") {
              return hazard;
            }

            return {
              ...hazard,
              remainingSteps: hazard.remainingSteps - 1,
            };
          })
          .filter((hazard) => {
            return hazard.type !== "flood" || hazard.remainingSteps > 0;
          });

        if (stormActive) {
          const spawnRoll = Math.random();
          const spawnCount = spawnRoll > 0.9 ? 2 : spawnRoll > 0.72 ? 1 : 0;
          const spawnedHazards = Array.from({ length: spawnCount }).map(() =>
            createHazard(shelters),
          );
          nextHazards = [...nextHazards, ...spawnedHazards].slice(-18);
        }

        const { debrisGeojson, floodedAreaGeojson } =
          buildTyphoonHazardsGeojson(nextHazards);
        const safetyLevel = calculateSafetyLevel(nextHazards, stormActive);
        const totalHazards = nextHazards.length;
        const status =
          currentStep >= TYPHOON_TOTAL_STEPS
            ? "completed"
            : ("running" as const);
        const canReturnHome =
          status === "completed" &&
          safetyLevel >= RETURN_HOME_SAFETY_THRESHOLD &&
          totalHazards <= RETURN_HOME_HAZARD_THRESHOLD;

        return {
          canReturnHome,
          debrisGeojson,
          elapsedSteps: currentStep,
          error: null,
          floodedAreaGeojson,
          hazards: nextHazards,
          safetyLevel,
          status,
          stormActive,
          totalHazards,
          totalSteps: TYPHOON_TOTAL_STEPS,
        };
      });

      if (currentStep >= TYPHOON_TOTAL_STEPS) {
        clearTyphoonTimer();
      }
    }, TYPHOON_ANIMATION_INTERVAL_MS);
  }, [clearReturnHomeTimer, clearTyphoonTimer, shelters]);

  const startReturnHomePhase = useCallback(() => {
    if (!typhoonRun.canReturnHome) {
      setReturnHomeRun({
        ...initialReturnHomeRun,
        error:
          "Return phase is not ready. Wait for typhoon to end, improve safety level, and reduce hazards.",
        status: "error",
      });
      return;
    }

    const evacuationZones = evacuationRun.zones;
    if (evacuationZones.length === 0) {
      setReturnHomeRun({
        ...initialReturnHomeRun,
        error: "Run evacuation first before starting return-home phase.",
        status: "error",
      });
      return;
    }

    clearReturnHomeTimer();

    const initialZones: ReturnHomeZoneProgress[] = evacuationZones.map(
      (zone) => {
        const shelter = shelters.find((item) => item.id === zone.shelterId);
        const homeAnchor = shelter
          ? getIsochroneRepresentativePoint(
              shelter.isochroneGeojson,
              shelter.coordinates,
            )
          : ([121.2, 13] as Coordinates);

        return {
          blockedReason: "clear",
          homeAnchor,
          householdsAtShelter: zone.evacuatedHouseholds,
          householdsReturned: 0,
          returnProgress: 0,
          shelterId: zone.shelterId,
          shelterName: zone.shelterName,
          totalHouseholds: zone.evacuatedHouseholds,
        };
      },
    );

    const zonesWithBlocks = initialZones.map((zone) => {
      const shelter = shelters.find((item) => item.id === zone.shelterId);
      if (!shelter) {
        return { ...zone, blockedReason: "debris-on-route" as const };
      }

      return {
        ...zone,
        blockedReason: detectReturnBlockReason(
          shelter,
          zone,
          typhoonRun.hazards,
        ),
      };
    });

    setSimulationState((previousState) => ({
      ...previousState,
      mode: "returning-home",
    }));

    setReturnHomeRun({
      elapsedSteps: 0,
      error: null,
      returnProgressGeojson: buildReturnProgressGeojson(
        shelters,
        zonesWithBlocks,
      ),
      status: "running",
      totalSteps: RETURN_HOME_MAX_STEPS,
      zones: zonesWithBlocks,
    });

    let currentStep = 0;
    returnHomeTimerRef.current = setInterval(() => {
      currentStep += 1;

      setReturnHomeRun((previousRun) => {
        const nextZones = previousRun.zones.map((zone) => {
          const shelter = shelters.find((item) => item.id === zone.shelterId);
          if (!shelter) {
            return { ...zone, blockedReason: "debris-on-route" as const };
          }

          const blockedReason = detectReturnBlockReason(
            shelter,
            zone,
            typhoonRun.hazards,
          );
          if (blockedReason !== "clear") {
            return {
              ...zone,
              blockedReason,
            };
          }

          const returnProgress = Math.min(
            1,
            zone.returnProgress + RETURN_HOME_PROGRESS_STEP,
          );
          return {
            ...zone,
            blockedReason,
            householdsAtShelter: Math.round(
              zone.totalHouseholds * (1 - returnProgress),
            ),
            householdsReturned: Math.round(
              zone.totalHouseholds * returnProgress,
            ),
            returnProgress,
          };
        });

        const allReturned = nextZones.every((zone) => zone.returnProgress >= 1);
        return {
          ...previousRun,
          elapsedSteps: currentStep,
          returnProgressGeojson: buildReturnProgressGeojson(
            shelters,
            nextZones,
          ),
          status:
            allReturned || currentStep >= RETURN_HOME_MAX_STEPS
              ? "completed"
              : "running",
          zones: nextZones,
        };
      });

      if (currentStep >= RETURN_HOME_MAX_STEPS) {
        clearReturnHomeTimer();
      }
    }, RETURN_HOME_ANIMATION_INTERVAL_MS);
  }, [
    clearReturnHomeTimer,
    evacuationRun.zones,
    shelters,
    typhoonRun.canReturnHome,
    typhoonRun.hazards,
  ]);

  const viewShelter = useCallback((shelterId: string) => {
    setSimulationState((previousState) => ({
      ...previousState,
      draftShelter: null,
      mode: "view-shelter",
      selectedShelterId: shelterId,
    }));
  }, []);

  const contextValue = useMemo(
    () => ({
      confirmDraftShelter,
      deleteShelter,
      evacuationRun,
      resetEvacuationSimulation,
      returnHomeRun,
      setShelters,
      setSimulationState,
      shelters,
      simulationState,
      startAddShelter,
      startEvacuationSimulation,
      startReturnHomePhase,
      startTyphoonPhase,
      typhoonRun,
      updateDraftShelter,
      viewShelter,
    }),
    [
      confirmDraftShelter,
      deleteShelter,
      evacuationRun,
      returnHomeRun,
      resetEvacuationSimulation,
      shelters,
      simulationState,
      startAddShelter,
      startEvacuationSimulation,
      startReturnHomePhase,
      startTyphoonPhase,
      typhoonRun,
      updateDraftShelter,
      viewShelter,
    ],
  );

  return (
    <SimulationContext.Provider value={contextValue}>
      {children}
    </SimulationContext.Provider>
  );
}

export function useSimulationContext() {
  const context = useContext(SimulationContext);
  if (!context) {
    throw new Error(
      "useSimulationContext must be used within SimulationProvider",
    );
  }

  return context;
}
