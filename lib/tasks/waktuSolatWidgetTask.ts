import * as BackgroundTask from "expo-background-task";
import * as Notifications from "expo-notifications";
import * as TaskManager from "expo-task-manager";

import { updateWaktuSolatWidget } from "@/lib/service/waktuSolatWidget";

export const BG_TASK = "update-waktu-solat-widget";
export const NOTIF_TASK = "waktu-solat-notifications-task";

TaskManager.defineTask(BG_TASK, async () => {
  try {
    console.log("Start background task");
    await updateWaktuSolatWidget(false, true);
  } catch (error) {
    console.error("Failed background task:", error);
    return BackgroundTask.BackgroundTaskResult.Failed;
  }

  console.log("Completed background task");
  return BackgroundTask.BackgroundTaskResult.Success;
});

TaskManager.defineTask<Notifications.NotificationTaskPayload>(
  NOTIF_TASK,
  async (payload) => {
    try {
      console.log("Start notification task", payload);
      await updateWaktuSolatWidget(false, false);
    } catch (error) {
      console.error("Failed notification task:", error);
    }

    console.log("Completed notification task");
  },
);

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});
