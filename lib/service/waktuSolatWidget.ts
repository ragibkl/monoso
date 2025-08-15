import { startOfMinute } from "date-fns";
import { WidgetTaskHandlerProps } from "react-native-android-widget";

import { WaktuSolat } from "@/lib/data/waktuSolatStore";
import { zoneStore, Zone } from "@/lib/data/zoneStore";
import {
  renderWaktuSolatWidget,
  requestWaktuSolatWidgetUpdate,
} from "@/lib/widgets/WaktuSolatWidget";

import { getOrRetrieveWaktuSolat } from "./waktuSolat";
import { getUpdatedZone } from "./zone";
import { scheduleAllWaktuSolatNotifications } from "./notifee";

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
    await scheduleAllWaktuSolatNotifications(waktuSolat, zone);
  }
}

export async function updateWaktuSolatAndRender(props: WidgetTaskHandlerProps) {
  const date = new Date();
  const data = await getPrayerData(date, false);
  if (!data) {
    console.log("Missing PrayerData, returning");
    return;
  }

  console.log("Found PrayerData, rendering widget");
  renderWaktuSolatWidget(date, data.zone, data.waktuSolat.prayerTime, props);
}
