import { zoneStore } from "@/lib/data/zoneStore";
import { ZoneResponse, getZoneByGps } from "@/lib/remote/waktusolat";

export async function updateZoneViaGps(
  lat: number,
  lng: number,
): Promise<ZoneResponse> {
  const zoneData = await getZoneByGps(lat, lng);
  zoneStore.save(zoneData);
  return zoneData;
}
