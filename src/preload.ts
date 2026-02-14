import { contextBridge, ipcRenderer } from "electron";
import type {
  ValhallaIsochroneRequest,
  ValhallaIsochroneResult,
  ValhallaRouteRequest,
  ValhallaRouteResult,
} from "./shared/valhalla";

contextBridge.exposeInMainWorld("valhalla", {
  getIsochrone: (request: ValhallaIsochroneRequest) =>
    ipcRenderer.invoke(
      "valhalla:isochrone",
      request,
    ) as Promise<ValhallaIsochroneResult>,
  getRoute: (request: ValhallaRouteRequest) =>
    ipcRenderer.invoke(
      "valhalla:route",
      request,
    ) as Promise<ValhallaRouteResult>,
});
