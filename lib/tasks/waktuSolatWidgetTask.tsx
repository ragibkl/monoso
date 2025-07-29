import { startOfMinute } from "date-fns";
import * as BackgroundTask from "expo-background-task";
import * as Notifications from "expo-notifications";
import * as TaskManager from "expo-task-manager";
import React from "react";
import { requestWidgetUpdate } from "react-native-android-widget";

import { PrayerTime } from "@/lib/data/waktuSolatStore";
import { zoneStore, Zone } from "@/lib/data/zoneStore";
import { getLocation } from "@/lib/service/location";
import { getOrRetrieveWaktuSolat } from "@/lib/service/waktuSolat";
import { updateZoneViaGps } from "@/lib/service/zone";
import { WaktuSolatWidget } from "@/lib/widgets/WaktuSolatWidget";

const BG_TASK = "update-waktu-solat-widget";
const NOTIF_TASK = "waktu-solat-notifications-task";

async function getUpdatedZone(): Promise<[Zone | null, boolean]> {
  const prevZone = await zoneStore.load();

  const location = await getLocation();
  if (location) {
    const zone = await updateZoneViaGps(
      location.coords.latitude,
      location.coords.longitude,
    );

    return [zone, prevZone?.zone !== zone.zone];
  }

  return [prevZone, false];
}

async function requestWaktuSolatWidgetUpdate(
  date: Date,
  zone: Zone,
  prayerTime: PrayerTime,
) {
  await requestWidgetUpdate({
    widgetName: "WaktuSolat",
    renderWidget: () => (
      <WaktuSolatWidget date={date} zone={zone} prayerTime={prayerTime} />
    ),
    widgetNotFound: () => {},
  });
}

function getNextPrayerTime(
  prayerTime: PrayerTime,
  date: Date,
): [string, number] | null {
  const { fajr, syuruk, dhuhr, asr, maghrib, isha } = prayerTime;
  const epoch = date.getTime() / 1000;

  if (epoch < fajr) {
    return ["fajr", fajr - epoch];
  }

  if (epoch < syuruk) {
    return ["syuruk", syuruk - epoch];
  }

  if (epoch < dhuhr) {
    return ["dhuhr", dhuhr - epoch];
  }

  if (epoch < asr) {
    return ["asr", asr - epoch];
  }

  if (epoch < maghrib) {
    return ["maghrib", maghrib - epoch];
  }

  if (epoch < isha) {
    return ["isha", isha - epoch];
  }

  return null;
}

async function scheduleNextPrayerTime(prayerTime: PrayerTime, date: Date) {
  const nextTime = getNextPrayerTime(prayerTime, date);
  if (nextTime) {
    console.log("Schedule nextTime", nextTime);
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `Waktu Solat - ${nextTime[0]}`,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: nextTime[1] + 10,
        repeats: false,
      },
    });
  }
}

TaskManager.defineTask(BG_TASK, async () => {
  try {
    const date = startOfMinute(new Date());
    console.log(`${date.toISOString()}: Start background task`);

    const [zone, updatedZone] = await getUpdatedZone();
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
    await requestWaktuSolatWidgetUpdate(date, zone, waktuSolat.prayerTime);

    if (updatedZone) {
      console.log("Cancel all notifications");
      await Notifications.cancelAllScheduledNotificationsAsync();
      await scheduleNextPrayerTime(waktuSolat.prayerTime, date);
    } else {
      const notifs = await Notifications.getAllScheduledNotificationsAsync();
      console.log("notifs.length", notifs.length);
      if (!notifs.length) {
        await scheduleNextPrayerTime(waktuSolat.prayerTime, date);
      }
    }
  } catch (error) {
    console.error("Failed background task:", error);
    return BackgroundTask.BackgroundTaskResult.Failed;
  }

  return BackgroundTask.BackgroundTaskResult.Success;
});

TaskManager.defineTask(NOTIF_TASK, async () => {
  try {
    const date = startOfMinute(new Date());
    console.log(`${date.toISOString()}: Start notif task`);

    const zone = await zoneStore.load();
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
    await requestWaktuSolatWidgetUpdate(date, zone, waktuSolat.prayerTime);
  } catch (error) {
    console.error("Failed background task:", error);
    return BackgroundTask.BackgroundTaskResult.Failed;
  }

  return BackgroundTask.BackgroundTaskResult.Success;
});

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: false,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export async function registerUpdateWaktuSolatWidgetTask() {
  await BackgroundTask.registerTaskAsync(BG_TASK, {
    minimumInterval: 15,
  });

  await Notifications.registerTaskAsync(NOTIF_TASK);
}
