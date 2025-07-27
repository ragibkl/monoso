import { useState, useEffect, useCallback } from "react";

import * as Location from "expo-location";
import { useCurrentDate } from "./date";

export async function getLocation(): Promise<Location.LocationObject | null> {
  let fgPermission = await Location.requestForegroundPermissionsAsync();
  if (fgPermission.status !== "granted") {
    return null;
  }

  return await Location.getCurrentPositionAsync({});
}

export function useLocation() {
  const { year, month, day, hour } = useCurrentDate();
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
  }, [updateLocation, year, month, day, hour]);

  return { location, updateLocation };
}
