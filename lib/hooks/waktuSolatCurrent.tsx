import { useState, useEffect } from "react";

import { useCurrentDate } from "./date";
import { useWaktuSolatStore, type WaktuSolat } from "./waktuSolatStore";
import { useZone } from "./zone";

export function useWaktuSolatCurrent() {
  const { day, month, year } = useCurrentDate();
  const { getOrRetrieveWaktuSolat } = useWaktuSolatStore();
  const { zone } = useZone();

  const [waktuSolat, setWaktuSolat] = useState<WaktuSolat | null>(null);

  useEffect(() => {
    async function effect() {
      if (zone) {
        const date = new Date(year, month, day);
        const w = await getOrRetrieveWaktuSolat(zone.zone, date);
        if (w) {
          setWaktuSolat(w);
        }
      }
    }

    effect();
  }, [zone, getOrRetrieveWaktuSolat, year, month, day]);

  return { waktuSolat };
}
