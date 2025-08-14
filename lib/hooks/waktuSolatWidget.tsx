import * as BackgroundTask from "expo-background-task";
import * as Notifications from "expo-notifications";
import { useEffect } from "react";

import {
  scheduleAllWaktuSolatNotifications,
  setAllWaktuSolatChannels,
} from "@/lib/service/waktuSolatWidget";
import { BG_TASK } from "@/lib/tasks/backgroundTasks";
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
      await setAllWaktuSolatChannels();
      // await Notifications.registerTaskAsync(NOTIF_TASK);

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
        await scheduleAllWaktuSolatNotifications(waktuSolat, zone);
      }
    }
    effect();
  }, [date, zone, waktuSolat]);
}
