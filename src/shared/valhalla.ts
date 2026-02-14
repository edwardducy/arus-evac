export type ValhallaCosting =
  | "auto"
  | "bicycle"
  | "pedestrian"
  | "bus"
  | "truck";

export type ValhallaIsochroneRequest = {
  costing?: ValhallaCosting;
  lat: number;
  lon: number;
  minutes: number;
};

export type ValhallaIsochroneSuccess = {
  data: any;
  ok: true;
};

export type ValhallaIsochroneFailure = {
  error: string;
  ok: false;
  status?: number;
};

export type ValhallaIsochroneResult =
  | ValhallaIsochroneSuccess
  | ValhallaIsochroneFailure;

export type ValhallaRouteRequest = {
  costing?: ValhallaCosting;
  destination: {
    lat: number;
    lon: number;
  };
  origin: {
    lat: number;
    lon: number;
  };
};

export type ValhallaRouteSuccess = {
  data: {
    distanceKm: number;
    durationSeconds: number;
    geometry: {
      coordinates: [number, number][];
      type: "LineString";
    };
  };
  ok: true;
};

export type ValhallaRouteFailure = {
  error: string;
  ok: false;
  status?: number;
};

export type ValhallaRouteResult = ValhallaRouteSuccess | ValhallaRouteFailure;
