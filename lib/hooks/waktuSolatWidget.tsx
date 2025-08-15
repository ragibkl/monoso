import { useEffect, useState } from "react";

import {
  scheduleAllWaktuSolatNotifications,
  setupNotifications,
} from "@/lib/service/notifications";
import { registerBackgroundTasks } from "@/lib/tasks/backgroundTasks";
import { requestWaktuSolatWidgetUpdate } from "@/lib/widgets/WaktuSolatWidget";

import { useCurrentDate } from "./date";
import { useWaktuSolatCurrent } from "./waktuSolat";
import { useUpdatedZone } from "./zone";

export function useWaktuSolatWidgetUpdate() {
  const { date } = useCurrentDate();
  const { zone } = useUpdatedZone();
  const { waktuSolat } = useWaktuSolatCurrent();

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function effect() {
      await setupNotifications();
      await registerBackgroundTasks();

      setIsLoading(false);
    }
    effect();
  }, []);

  useEffect(() => {
    async function effect() {
      if (!isLoading && zone && waktuSolat) {
        await requestWaktuSolatWidgetUpdate(date, zone, waktuSolat.prayerTime);
        await scheduleAllWaktuSolatNotifications(waktuSolat, zone);
      }
    }
    effect();
  }, [isLoading, date, zone, waktuSolat]);
}
