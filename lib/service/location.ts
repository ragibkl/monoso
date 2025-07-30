import * as Location from "expo-location";

export async function getLocation(): Promise<Location.LocationObject | null> {
  let fgPermission = await Location.requestForegroundPermissionsAsync();
  if (fgPermission.status !== "granted") {
    return null;
  }

  return await Location.getCurrentPositionAsync({});
}
