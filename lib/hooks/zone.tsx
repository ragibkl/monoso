import { useCallback } from "react";

import { zoneStore } from "@/lib/data/zoneStore";
import { getZoneByGps, ZoneResponse } from "@/lib/remote/waktusolat";

export function useZone() {
  const { data: zone, setData: setZone } = zoneStore.use();

  const updateZoneViaGps = useCallback(
    async (lat: number, lng: number): Promise<ZoneResponse> => {
      const zoneData = await getZoneByGps(lat, lng);
      setZone(zoneData);

      return zoneData;
    },
    [setZone],
  );

  return { zone, setZone, updateZoneViaGps };
}
