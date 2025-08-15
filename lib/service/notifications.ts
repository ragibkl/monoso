import * as Notifications from "expo-notifications";

import { WaktuSolat, PrayerTime } from "@/lib/data/waktuSolatStore";
import { Zone } from "@/lib/data/zoneStore";

export const WAKTU_SOLAT_PREFIX = "waktu_solat";

function sameWaktuSolat(left: WaktuSolat, right: WaktuSolat): boolean {
  return (
    left.year === right.year &&
    left.month === right.month &&
    left.date === right.date &&
    left.zone === right.zone
  );
}

export function getEpochDate(epochSeconds: number): Date {
  const date = new Date(0);
  date.setUTCSeconds(epochSeconds);
  return date;
}

export async function setAllWaktuSolatChannels() {
  const waktu_keys = ["fajr", "syuruk", "dhuhr", "asr", "maghrib", "isha"];

  for (const waktu of waktu_keys) {
    const channelId = `${WAKTU_SOLAT_PREFIX}_${waktu}`;
    await Notifications.setNotificationChannelAsync(channelId, {
      name: waktu,
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }
}

export async function setupNotifications() {
  await Notifications.requestPermissionsAsync();
  await setAllWaktuSolatChannels();
}

export async function scheduleWaktuSolatNotification(
  waktuSolat: WaktuSolat,
  zone: Zone,
  waktu: keyof PrayerTime,
) {
  const channelId = `${WAKTU_SOLAT_PREFIX}_${waktu}`;
  const epochSeconds = waktuSolat.prayerTime[waktu];
  const date = getEpochDate(epochSeconds);
  const dateText = date.toLocaleString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  // skip if time already passed
  if (date.getTime() < Date.now()) {
    return;
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title: `Waktu Solat - ${waktu} at ${dateText}`,
      body: `It is now ${waktu} in ${zone.district}, ${zone.state}`,
      data: {
        waktuSolat,
        waktu,
        zone,
      },
    },
    trigger: {
      channelId,
      date,
      type: Notifications.SchedulableTriggerInputTypes.DATE,
    },
  });
}
export async function scheduleAllWaktuSolatNotifications(
  waktuSolat: WaktuSolat,
  zone: Zone,
) {
  const existingNotifs: {
    [k in keyof PrayerTime]: boolean;
  } = {
    fajr: false,
    syuruk: false,
    dhuhr: false,
    asr: false,
    maghrib: false,
    isha: false,
  };

  const notifications = await Notifications.getAllScheduledNotificationsAsync();
  for (const n of notifications) {
    // Assert notification trigger channel is waktu_solat_*
    if (
      !n.trigger ||
      !("channelId" in n.trigger) ||
      !n.trigger.channelId?.startsWith("waktu_solat")
    ) {
      continue;
    }

    // Check if notification matches the current WaktuSolat zone and date
    if (sameWaktuSolat(n.content.data.waktuSolat as WaktuSolat, waktuSolat)) {
      existingNotifs[n.content.data.waktu as keyof PrayerTime] = true;
    } else {
      await Notifications.cancelScheduledNotificationAsync(n.identifier);
    }
  }

  const waktuKeys = Object.keys(waktuSolat.prayerTime) as (keyof PrayerTime)[];
  for (const waktu of waktuKeys) {
    // Schedule notification if not yet scheduled
    if (!existingNotifs[waktu]) {
      await scheduleWaktuSolatNotification(waktuSolat, zone, waktu);
    }
  }
}
