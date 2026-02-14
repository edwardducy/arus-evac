import type {
  ValhallaIsochroneRequest,
  ValhallaIsochroneResult,
  ValhallaRouteRequest,
  ValhallaRouteResult,
} from "../shared/valhalla";

declare global {
  interface Window {
    valhalla?: {
      getIsochrone: (
        request: ValhallaIsochroneRequest,
      ) => Promise<ValhallaIsochroneResult>;
      getRoute: (request: ValhallaRouteRequest) => Promise<ValhallaRouteResult>;
    };
  }
}

export {};
