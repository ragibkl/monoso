import { startOfMinute } from "date-fns";
import * as Notifications from "expo-notifications";

import { WaktuSolat } from "@/lib/data/waktuSolatStore";
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
): Promise<{ zone: Zone; waktuSolat: WaktuSolat } | null> {
  const zone = updateZone ? await getUpdatedZone() : await zoneStore.load();
  if (!zone) {
    return null;
  }

  const waktuSolat = await getOrRetrieveWaktuSolat(zone.zone, date);
  if (!waktuSolat) {
    return null;
  }

  return { zone, waktuSolat };
}

export async function schedulePrayerNotification(waktuSolat: WaktuSolat) {
  const date = new Date();
  const nextTime = getNextPrayerTime(waktuSolat.prayerTime, date);
  if (!nextTime) {
    return;
  }

  const toCancelNotif: Notifications.NotificationRequest[] = [];
  let existingNotif = null;

  const notifications = await Notifications.getAllScheduledNotificationsAsync();
  notifications.forEach((n) => {
    // Assert notification type is TIME_INTERVAL
    // Assert notification trigger channel is WAKTU_SOLAT_NOTIFICATION_CHANNEL
    if (
      !n.trigger ||
      !("type" in n.trigger) ||
      n.trigger?.type !==
        Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL ||
      n.trigger.channelId !== WAKTU_SOLAT_NOTIFICATION_CHANNEL
    ) {
      return;
    }

    // Check for notification that don't match the current day and zone
    if (
      n.content.data.year !== waktuSolat.year ||
      n.content.data.month !== waktuSolat.month ||
      n.content.data.date !== waktuSolat.date ||
      n.content.data.zone !== waktuSolat.zone
    ) {
      toCancelNotif.push(n);

      // Check for pre-existing notification that matches current desired schedule
    } else if (n.content.data.waktu === nextTime[0]) {
      existingNotif = n;
    }
  });

  await Promise.all(
    toCancelNotif.map((n) =>
      Notifications.cancelScheduledNotificationAsync(n.identifier),
    ),
  );

  if (existingNotif) {
    console.log("Existing notification exists -", existingNotif);
    return;
  }

  console.log("Schedule next notification", nextTime);
  const timeText = nextTime[1].toLocaleString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  const now = new Date();
  const seconds = (nextTime[1].getTime() - now.getTime()) / 1000;
  const body = JSON.stringify(
    {
      waktuSolat,
      date: date.toLocaleString(),
      nextTime: [nextTime[0], nextTime[1].toLocaleString()],
      now: now.toLocaleString(),
      seconds,
    },
    undefined,
    4,
  );

  await Notifications.scheduleNotificationAsync({
    content: {
      title: `Waktu Solat - ${nextTime[0]} at ${timeText}`,
      body,
      data: {
        year: waktuSolat.year,
        month: waktuSolat.month,
        date: waktuSolat.date,
        zone: waktuSolat.zone,
        waktu: nextTime[0],
      },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds,
      channelId: WAKTU_SOLAT_NOTIFICATION_CHANNEL,
      repeats: false,
    },
  });
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

  await requestWaktuSolatWidgetUpdate(
    date,
    data.zone,
    data.waktuSolat.prayerTime,
  );

  if (updateNotifs) {
    await schedulePrayerNotification(data.waktuSolat);
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
  renderWaktuSolatWidget(date, data.zone, data.waktuSolat.prayerTime, props);
}
