import * as Location from "expo-location";

export async function getLocation(): Promise<Location.LocationObject | null> {
  try {
    let permission = await Location.requestForegroundPermissionsAsync();
    if (permission.status !== "granted") {
      return null;
    }

    return await Location.getCurrentPositionAsync({});
  } catch (e) {
    console.log("Cannot get location", e);
    return null;
  }
}
