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

async function getUpdatedZone(): Promise<Zone | null> {
  const location = await getLocation();
  if (location) {
    const zone = await updateZoneViaGps(
      location.coords.latitude,
      location.coords.longitude,
    );

    return zone;
  }

  return await zoneStore.load();
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

async function setupWaktuSolat(updateZone: boolean, updateNotifs: boolean) {
  const date = startOfMinute(new Date());

  const zone = updateZone ? await getUpdatedZone() : await zoneStore.load();
  if (!zone) {
    return;
  }

  const waktuSolat = await getOrRetrieveWaktuSolat(zone.zone, date);
  if (!waktuSolat) {
    return;
  }

  await requestWaktuSolatWidgetUpdate(date, zone, waktuSolat.prayerTime);

  if (updateNotifs) {
    await Notifications.cancelAllScheduledNotificationsAsync();
    await scheduleNextPrayerTime(waktuSolat.prayerTime, date);
  }
}

TaskManager.defineTask(BG_TASK, async () => {
  try {
    console.log("Start background task");
    await setupWaktuSolat(true, true);
  } catch (error) {
    console.error("Failed background task:", error);
    return BackgroundTask.BackgroundTaskResult.Failed;
  }

  console.log("Completed background task");
  return BackgroundTask.BackgroundTaskResult.Success;
});

TaskManager.defineTask<Notifications.NotificationTaskPayload>(
  NOTIF_TASK,
  async (payload) => {
    try {
      console.log("Start notification task", payload);
      await setupWaktuSolat(false, false);
    } catch (error) {
      console.error("Failed notification task:", error);
    }

    console.log("Completed notification task");
  },
);

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function registerUpdateWaktuSolatWidgetTask() {
  await BackgroundTask.registerTaskAsync(BG_TASK, {
    minimumInterval: 15,
  });

  await Notifications.registerTaskAsync(NOTIF_TASK);
  await Notifications.requestPermissionsAsync();

  await setupWaktuSolat(false, true);
}
