import type {
  ValhallaIsochroneRequest,
  ValhallaIsochroneResult,
  ValhallaRouteRequest,
  ValhallaRouteResult,
} from "./shared/valhalla";

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function validateIsochroneRequest(
  request: ValhallaIsochroneRequest,
): ValhallaIsochroneResult | null {
  if (!isFiniteNumber(request.lat) || request.lat < -90 || request.lat > 90) {
    return { error: "Invalid latitude", ok: false };
  }

  if (!isFiniteNumber(request.lon) || request.lon < -180 || request.lon > 180) {
    return { error: "Invalid longitude", ok: false };
  }

  if (
    !isFiniteNumber(request.minutes) ||
    request.minutes <= 0 ||
    request.minutes > 240
  ) {
    return { error: "Invalid minutes range", ok: false };
  }

  return null;
}

function validateRouteRequest(
  request: ValhallaRouteRequest,
): ValhallaRouteResult | null {
  const origin = request.origin;
  const destination = request.destination;

  if (
    !isFiniteNumber(origin.lat) ||
    origin.lat < -90 ||
    origin.lat > 90 ||
    !isFiniteNumber(origin.lon) ||
    origin.lon < -180 ||
    origin.lon > 180
  ) {
    return { error: "Invalid origin coordinates", ok: false };
  }

  if (
    !isFiniteNumber(destination.lat) ||
    destination.lat < -90 ||
    destination.lat > 90 ||
    !isFiniteNumber(destination.lon) ||
    destination.lon < -180 ||
    destination.lon > 180
  ) {
    return { error: "Invalid destination coordinates", ok: false };
  }

  return null;
}

function decodePolyline(encoded: string, precision = 6): [number, number][] {
  let index = 0;
  let lat = 0;
  let lon = 0;
  const factor = 10 ** precision;
  const coordinates: [number, number][] = [];

  while (index < encoded.length) {
    let shift = 0;
    let result = 0;
    let byte = 0;

    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    const deltaLat = result & 1 ? ~(result >> 1) : result >> 1;
    lat += deltaLat;

    shift = 0;
    result = 0;
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    const deltaLon = result & 1 ? ~(result >> 1) : result >> 1;
    lon += deltaLon;

    coordinates.push([lon / factor, lat / factor]);
  }

  return coordinates;
}

export async function getValhallaIsochrone(
  request: ValhallaIsochroneRequest,
): Promise<ValhallaIsochroneResult> {
  const validationError = validateIsochroneRequest(request);
  if (validationError) {
    return validationError;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);

  try {
    const valhallaBaseUrl = process.env.VALHALLA_URL || "http://127.0.0.1:8002";
    const response = await fetch(`${valhallaBaseUrl}/isochrone`, {
      body: JSON.stringify({
        contours: [{ time: request.minutes }],
        costing: request.costing || "auto",
        locations: [{ lat: request.lat, lon: request.lon }],
        polygons: true,
      }),
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      signal: controller.signal,
    });

    if (!response.ok) {
      const text = await response.text();
      return {
        error: `Valhalla request failed (${response.status}): ${text || "Unknown error"}`,
        ok: false,
        status: response.status,
      };
    }

    const data = await response.json();
    return { data, ok: true };
  } catch (error: any) {
    if (error?.name === "AbortError") {
      return { error: "Valhalla request timed out", ok: false };
    }

    return {
      error: `Valhalla request failed: ${error?.message || "Unknown error"}`,
      ok: false,
    };
  } finally {
    clearTimeout(timeout);
  }
}

export async function getValhallaRoute(
  request: ValhallaRouteRequest,
): Promise<ValhallaRouteResult> {
  const validationError = validateRouteRequest(request);
  if (validationError) {
    return validationError;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12_000);

  try {
    const valhallaBaseUrl = process.env.VALHALLA_URL || "http://127.0.0.1:8002";
    const response = await fetch(`${valhallaBaseUrl}/route`, {
      body: JSON.stringify({
        costing: request.costing || "auto",
        directions_options: {
          units: "kilometers",
        },
        locations: [
          {
            lat: request.origin.lat,
            lon: request.origin.lon,
            type: "break",
          },
          {
            lat: request.destination.lat,
            lon: request.destination.lon,
            type: "break",
          },
        ],
      }),
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      signal: controller.signal,
    });

    if (!response.ok) {
      const text = await response.text();
      return {
        error: `Valhalla route failed (${response.status}): ${text || "Unknown error"}`,
        ok: false,
        status: response.status,
      };
    }

    const data = await response.json();
    const route = data?.trip?.legs?.[0];
    const encodedShape = route?.shape;

    if (typeof encodedShape !== "string" || encodedShape.length === 0) {
      return { error: "Missing route shape from Valhalla response", ok: false };
    }

    const coordinates = decodePolyline(encodedShape, 6);
    const summary = route?.summary || {};
    return {
      data: {
        distanceKm: Number(summary.length || 0),
        durationSeconds: Number(summary.time || 0),
        geometry: {
          coordinates,
          type: "LineString",
        },
      },
      ok: true,
    };
  } catch (error: any) {
    if (error?.name === "AbortError") {
      return { error: "Valhalla route request timed out", ok: false };
    }

    return {
      error: `Valhalla route request failed: ${error?.message || "Unknown error"}`,
      ok: false,
    };
  } finally {
    clearTimeout(timeout);
  }
}
