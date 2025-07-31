import * as BackgroundTask from "expo-background-task";
import * as Notifications from "expo-notifications";
import { useEffect } from "react";

import {
  schedulePrayerNotification,
  WAKTU_SOLAT_NOTIFICATION_CHANNEL,
} from "@/lib/service/waktuSolatWidget";
import { BG_TASK, NOTIF_TASK } from "@/lib/tasks/backgroundTasks";
import { requestWaktuSolatWidgetUpdate } from "@/lib/widgets/WaktuSolatWidget";

import { useCurrentDate } from "./date";
import { useWaktuSolatCurrent } from "./waktuSolat";
import { useUpdatedZone } from "./zone";

export function useWaktuSolatWidgetUpdate() {
  const { date } = useCurrentDate();
  const { zone } = useUpdatedZone();
  const { waktuSolat } = useWaktuSolatCurrent();

  useEffect(() => {
    async function effect() {
      await Notifications.requestPermissionsAsync();
      await Notifications.setNotificationChannelAsync(
        WAKTU_SOLAT_NOTIFICATION_CHANNEL,
        {
          name: "Waktu Solat Notifications",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#FF231F7C",
        },
      );
      await Notifications.registerTaskAsync(NOTIF_TASK);

      await BackgroundTask.registerTaskAsync(BG_TASK, {
        minimumInterval: 15,
      });
    }
    effect();
  }, []);

  useEffect(() => {
    async function effect() {
      if (zone && waktuSolat) {
        await requestWaktuSolatWidgetUpdate(date, zone, waktuSolat.prayerTime);
        await Notifications.cancelAllScheduledNotificationsAsync();
        await schedulePrayerNotification(waktuSolat.prayerTime);
      }
    }
    effect();
  }, [date, zone, waktuSolat]);
}
