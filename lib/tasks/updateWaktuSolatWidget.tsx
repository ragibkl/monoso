import * as BackgroundTask from "expo-background-task";
import * as TaskManager from "expo-task-manager";
import React from "react";
import { requestWidgetUpdate } from "react-native-android-widget";

import { getLocation } from "../service/location";
import { getOrRetrieveWaktuSolat } from "../service/waktuSolat";
import { WaktuSolatWidget } from "../widgets/WaktuSolatWidget";
import { zoneStore } from "../data/zoneStore";
import { updateZoneViaGps } from "@/lib/service/zone";

const TASK_NAME = "update-waktu-solat-widget";

TaskManager.defineTask(TASK_NAME, async () => {
  try {
    const date = new Date();
    console.log(`${date.toISOString()}: Start background task`);

    let zone = await zoneStore.load();
    try {
      console.log("Start zone update via GPS location");

      const location = await getLocation();
      if (location) {
        const zoneData = await updateZoneViaGps(
          location.coords.latitude,
          location.coords.longitude,
        );
        if (zoneData) {
          zone = zoneData;
        }
      }
    } catch (error) {
      console.log("Failed zone update via GPS location", error);
    }

    if (!zone) {
      console.log("Zone not set, returning");
      return BackgroundTask.BackgroundTaskResult.Success;
    }

    const waktuSolat = await getOrRetrieveWaktuSolat(zone.zone, date);
    if (!waktuSolat) {
      console.log("WaktuSolat not found, returning");
      return BackgroundTask.BackgroundTaskResult.Success;
    }

    console.log("Found WaktuSolat, updating widget");
    requestWidgetUpdate({
      widgetName: "WaktuSolat",
      renderWidget: () => (
        <WaktuSolatWidget
          date={date}
          zone={zone}
          prayerTime={waktuSolat.prayerTime}
        />
      ),
      widgetNotFound: () => {},
    });
  } catch (error) {
    console.error("Failed background task:", error);
    return BackgroundTask.BackgroundTaskResult.Failed;
  }

  return BackgroundTask.BackgroundTaskResult.Success;
});

export async function registerUpdateWaktuSolatWidgetTask() {
  if (!TaskManager.isTaskRegisteredAsync(TASK_NAME)) {
    return BackgroundTask.registerTaskAsync(TASK_NAME, {
      minimumInterval: 15,
    });
  }
}
