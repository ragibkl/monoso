import { useState, useEffect } from "react";

import * as Location from "expo-location";

export async function getLocation(): Promise<Location.LocationObject | null> {
  let { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== "granted") {
    return null;
  }

  return await Location.getCurrentPositionAsync({});
}

export function useLocation() {
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null,
  );

  useEffect(() => {
    async function getCurrentLocation() {
      let location = await getLocation();
      setLocation(location);
    }

    getCurrentLocation();
  }, []);

  return { location };
}
