import PolygonLookup from "polygon-lookup";

import { zoneStore } from "@/lib/data/zoneStore";
import { ZoneResponse } from "@/lib/remote/waktusolat";

import jakimGeoData from "@/assets/geodata/malaysia-district-jakim.json";

const lookup = new PolygonLookup(jakimGeoData as any);

export function lookupZoneByGps(lat: number, lng: number): ZoneResponse | null {
  const result = lookup.search(lng, lat);
  console.log("lookupJakimZone", lat, lng, result);
  if (!result || !result.properties) {
    return null;
  }

  console.log("lookupJakimZone - properties", result.properties);
  const zone = result.properties.jakim_code;
  const state = result.properties.state;
  const district = result.properties.name;

  return {
    zone,
    state,
    district,
  };
}

export async function updateZoneViaGps(
  lat: number,
  lng: number,
): Promise<ZoneResponse> {
  const zoneData = lookupZoneByGps(lat, lng);
  await zoneStore.save(zoneData);
  return zoneData as ZoneResponse;
}
