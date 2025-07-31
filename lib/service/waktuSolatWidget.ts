import { startOfMinute } from "date-fns";
import * as Notifications from "expo-notifications";

import { PrayerTime } from "@/lib/data/waktuSolatStore";
import { zoneStore, Zone } from "@/lib/data/zoneStore";
import {
  renderWaktuSolatWidget,
  requestWaktuSolatWidgetUpdate,
} from "@/lib/widgets/WaktuSolatWidget";

import { getNextPrayerTime, getOrRetrieveWaktuSolat } from "./waktuSolat";
import { getUpdatedZone } from "./zone";
import { WidgetTaskHandlerProps } from "react-native-android-widget";

export const WAKTU_SOLAT_NOTIFICATION_CHANNEL = "waktu_solat";

export async function getPrayerData(
  date: Date,
  updateZone: boolean,
): Promise<{ zone: Zone; prayerTime: PrayerTime } | null> {
  const zone = updateZone ? await getUpdatedZone() : await zoneStore.load();
  if (!zone) {
    return null;
  }

  const waktuSolat = await getOrRetrieveWaktuSolat(zone.zone, date);
  if (!waktuSolat) {
    return null;
  }

  return { zone, prayerTime: waktuSolat.prayerTime };
}

export async function schedulePrayerNotification(prayerTime: PrayerTime) {
  const date = new Date();
  const nextTime = getNextPrayerTime(prayerTime, date);
  if (nextTime) {
    console.log("Schedule nextTime", nextTime);
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `Waktu Solat - ${nextTime[0]}`,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: nextTime[1],
        channelId: WAKTU_SOLAT_NOTIFICATION_CHANNEL,
        repeats: false,
      },
    });
  }
}

export async function updateWaktuSolatAndWidget(
  updateZone: boolean,
  updateNotifs: boolean,
) {
  const date = startOfMinute(new Date());
  const data = await getPrayerData(date, updateZone);
  if (!data) {
    return;
  }

  await requestWaktuSolatWidgetUpdate(date, data.zone, data.prayerTime);

  if (updateNotifs) {
    await Notifications.cancelAllScheduledNotificationsAsync();
    await schedulePrayerNotification(data.prayerTime);
  }
}

export async function updateWaktuSolatAndRender(props: WidgetTaskHandlerProps) {
  const date = startOfMinute(new Date());
  const data = await getPrayerData(date, false);
  if (!data) {
    console.log("Missing PrayerData, returning");
    return;
  }

  console.log("Found PrayerData, rendering widget");
  renderWaktuSolatWidget(date, data.zone, data.prayerTime, props);
}
