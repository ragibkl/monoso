import * as Location from "expo-location";
import { useState, useEffect, useCallback } from "react";

import { useCurrentDate } from "@/lib/hooks/date";
import { getLocation } from "@/lib/service/location";

export function useLocation() {
  const { date } = useCurrentDate();
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null,
  );

  const updateLocation = useCallback(async () => {
    const location = await getLocation();
    setLocation(location);

    return location;
  }, []);

  useEffect(() => {
    updateLocation();
  }, [updateLocation, date]);

  return { location, updateLocation };
}
