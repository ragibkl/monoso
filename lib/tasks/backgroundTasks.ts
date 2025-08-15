import * as BackgroundTask from "expo-background-task";
import * as Notifications from "expo-notifications";
import * as TaskManager from "expo-task-manager";

import { WaktuSolat } from "@/lib/data/waktuSolatStore";
import { Zone } from "@/lib/data/zoneStore";
import { updateWaktuSolatAndWidget } from "@/lib/service/waktuSolatWidget";
import { requestWaktuSolatWidgetUpdate } from "@/lib/widgets/WaktuSolatWidget";

export const BG_TASK = "update-waktu-solat-widget";
export const NOTIF_TASK = "waktu-solat-notifications-task";

TaskManager.defineTask(BG_TASK, async () => {
  try {
    console.log("Start background task");
    await updateWaktuSolatAndWidget(true, true);
  } catch (error) {
    console.error("Failed background task:", error);
    return BackgroundTask.BackgroundTaskResult.Failed;
  }

  console.log("Completed background task");
  return BackgroundTask.BackgroundTaskResult.Success;
});

TaskManager.defineTask<Notifications.NotificationTaskPayload>(
  NOTIF_TASK,
  async ({ data, error, executionInfo }) => {
    try {
      const isNotificationResponse = "actionIdentifier" in data;
      if (isNotificationResponse) {
        // Do something with the notification response from user
        await updateWaktuSolatAndWidget(false, false);
      } else {
        // Do something with the data from notification that was received
        if ("waktuSolat" in data.data && "zone" in data.data) {
          const { prayerTime } = data.data.waktuSolat as WaktuSolat;
          const zone = data.data.zone as Zone;
          await requestWaktuSolatWidgetUpdate(new Date(), zone, prayerTime);
        }
      }
    } catch (error) {
      console.error("Failed notification task:", error);
    }
  },
);

export async function registerBackgroundTasks() {
  await BackgroundTask.registerTaskAsync(BG_TASK, {
    minimumInterval: 15,
  });
  // await Notifications.registerTaskAsync(NOTIF_TASK);
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});
