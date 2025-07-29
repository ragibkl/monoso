import { useCallback } from "react";

import { zoneStore, Zone } from "@/lib/data/zoneStore";
import { lookupZoneByGps } from "@/lib/service/zone";

export function useZone() {
  const { data: zone, setData: setZone } = zoneStore.use();

  const updateZoneViaGps = useCallback(
    async (lat: number, lng: number): Promise<Zone | null> => {
      const zoneData = lookupZoneByGps(lat, lng);
      setZone(zoneData);

      return zoneData;
    },
    [setZone],
  );

  return { zone, setZone, updateZoneViaGps };
}
