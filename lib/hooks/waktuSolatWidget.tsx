import * as BackgroundTask from "expo-background-task";
import * as Notifications from "expo-notifications";
import { useEffect } from "react";

import { requestWaktuSolatWidgetUpdate } from "@/lib/widgets/WaktuSolatWidget";

import { useWaktuSolatCurrent } from "./waktuSolat";
import { useUpdatedZone } from "./zone";
import { useCurrentDate } from "./date";
import { BG_TASK, NOTIF_TASK } from "../tasks/waktuSolatWidgetTask";

export function useWaktuSolatWidgetUpdate() {
  const { date } = useCurrentDate();
  const { zone } = useUpdatedZone();
  const { waktuSolat } = useWaktuSolatCurrent();

  useEffect(() => {
    async function effect() {
      await Notifications.requestPermissionsAsync();
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
      }
    }
    effect();
  }, [date, zone, waktuSolat]);
}
