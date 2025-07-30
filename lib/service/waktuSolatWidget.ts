import { startOfMinute } from "date-fns";
import * as Notifications from "expo-notifications";

import { WaktuSolat } from "@/lib/data/waktuSolatStore";
import { zoneStore } from "@/lib/data/zoneStore";
import { requestWaktuSolatWidgetUpdate } from "@/lib/widgets/WaktuSolatWidget";

import { getNextPrayerTime, getOrRetrieveWaktuSolat } from "./waktuSolat";
import { getUpdatedZone } from "./zone";

export const WAKTU_SOLAT_NOTIFICATION_CHANNEL = "waktu_solat";

async function schedulePrayerNotification(waktuSolat: WaktuSolat, date: Date) {
  const nextTime = getNextPrayerTime(waktuSolat, date);
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

export async function updateWaktuSolatWidget(
  updateZone: boolean,
  updateNotifs: boolean,
) {
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
    await schedulePrayerNotification(waktuSolat, date);
  }
}
