import { useEffect } from "react";

import { scheduleAllWaktuSolatNotifications } from "@/lib/service/notifee";
import { registerBackgroundTasks } from "@/lib/tasks/backgroundTasks";
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
      await registerBackgroundTasks();
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
