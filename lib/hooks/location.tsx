import { useState, useEffect, useCallback } from "react";

import * as Location from "expo-location";

export async function getLocation(): Promise<Location.LocationObject | null> {
  let fgPermission = await Location.requestForegroundPermissionsAsync();
  if (fgPermission.status !== "granted") {
    return null;
  }

  return await Location.getCurrentPositionAsync({});
}

export function useLocation() {
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
  }, [updateLocation]);

  return { location, updateLocation };
}
