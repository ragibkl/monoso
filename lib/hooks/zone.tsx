import { useCallback } from "react";

import { zoneStore } from "@/lib/data/zoneStore";
import { ZoneResponse } from "@/lib/remote/waktusolat";
import { lookupZoneByGps } from "@/lib/service/zone";

export function useZone() {
  const { data: zone, setData: setZone } = zoneStore.use();

  const updateZoneViaGps = useCallback(
    async (lat: number, lng: number): Promise<ZoneResponse | null> => {
      const zoneData = lookupZoneByGps(lat, lng);
      setZone(zoneData);

      return zoneData;
    },
    [setZone],
  );

  return { zone, setZone, updateZoneViaGps };
}
