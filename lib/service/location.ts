import * as Location from "expo-location";
import { Alert, AppState } from "react-native";

async function getLocationPermissions(): Promise<boolean> {
  try {
    const fgPermissionCurrent = await Location.getForegroundPermissionsAsync();
    if (fgPermissionCurrent.status !== "granted") {
      const fgPermission = await Location.requestForegroundPermissionsAsync();
      if (fgPermission.status !== "granted") {
        return false;
      }
    }

    const bgPermissionCurrent = await Location.getBackgroundPermissionsAsync();
    if (bgPermissionCurrent.status !== "granted") {
      const bgPermission: Location.LocationPermissionResponse =
        await new Promise((resolve, _reject) => {
          Alert.alert(
            "Background Location Permission",
            "This app needs access to your location in background in order to keep your Waktu Solat Zone up to date. Please allow permission in the app settings page",
            [
              {
                text: "Ok",
                style: "default",
                onPress: async () => {
                  const permission =
                    await Location.requestBackgroundPermissionsAsync();
                  resolve(permission);
                },
              },
            ],
          );
        });
      if (bgPermission.status !== "granted") {
        return false;
      }
    }

    return true;
  } catch (e) {
    console.log("Cannot get location permission", e);
    return false;
  }
}

export async function getLocation(
  fast: boolean = false,
): Promise<Location.LocationObject | null> {
  try {
    const permission = await getLocationPermissions();
    if (!permission) {
      return null;
    }

    const enabled = await Location.hasServicesEnabledAsync();
    if (!enabled) {
      return null;
    }

    if (AppState.currentState !== "active") {
      const bgEnabled = await Location.isBackgroundLocationAvailableAsync();
      if (!bgEnabled) {
        return null;
      }
    }

    if (fast) {
      return await Location.getLastKnownPositionAsync();
    } else {
      return await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Lowest,
      });
    }
  } catch (e) {
    console.log("Cannot get location", e);
    return null;
  }
}
