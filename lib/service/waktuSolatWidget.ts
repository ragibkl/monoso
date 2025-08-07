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

function sameWaktuSolat(left: WaktuSolat, right: WaktuSolat): boolean {
  return (
    left.year === right.year &&
    left.month === right.month &&
    left.date === right.date &&
    left.zone === right.zone
  );
}

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

export async function schedulePrayerNotification(
  waktuSolat: WaktuSolat,
  zone: Zone,
) {
  const date = new Date();
  const nextTime = getNextPrayerTime(waktuSolat.prayerTime, date);
  if (!nextTime) {
    return;
  }

  const toCancelNotif: Notifications.NotificationRequest[] = [];
  let existingNotif: Notifications.NotificationRequest | null = null;

  const notifications = await Notifications.getAllScheduledNotificationsAsync();
  notifications.forEach((n) => {
    // Assert notification trigger channel is WAKTU_SOLAT_NOTIFICATION_CHANNEL
    if (
      !n.trigger ||
      !("channelId" in n.trigger) ||
      n.trigger.channelId !== WAKTU_SOLAT_NOTIFICATION_CHANNEL
    ) {
      return;
    }

    // Check for notification that don't match the current WaktuSolat
    if (!sameWaktuSolat(n.content.data.waktuSolat as WaktuSolat, waktuSolat)) {
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

  await Notifications.scheduleNotificationAsync({
    content: {
      title: `Waktu Solat - ${nextTime[0]} at ${timeText}`,
      body: `The time is now ${timeText}. It is now ${nextTime[0]} in ${zone.district}, ${zone.state}`,
      data: {
        waktuSolat,
        zone,
        waktu: nextTime[0],
      },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      channelId: WAKTU_SOLAT_NOTIFICATION_CHANNEL,
      date: nextTime[1],
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

  const { zone, waktuSolat } = data;
  await requestWaktuSolatWidgetUpdate(date, zone, waktuSolat.prayerTime);

  if (updateNotifs) {
    await schedulePrayerNotification(waktuSolat, zone);
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
