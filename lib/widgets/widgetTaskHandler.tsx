import { startOfMinute } from "date-fns";
import React from "react";
import type { WidgetTaskHandlerProps } from "react-native-android-widget";

import { getOrRetrieveWaktuSolat } from "@/lib/service/waktuSolat";

import { WaktuSolatWidget } from "./WaktuSolatWidget";
import { zoneStore } from "@/lib/data/zoneStore";

async function renderWaktuSolatWidget(props: WidgetTaskHandlerProps) {
  const zone = await zoneStore.load();
  if (!zone) {
    console.log("Zone not set, rendering blank widget");
    props.renderWidget(<WaktuSolatWidget date={new Date()} />);
    return;
  }

  const date = startOfMinute(new Date());

  const waktuSolat = await getOrRetrieveWaktuSolat(zone.zone, date);
  if (waktuSolat) {
    console.log("Found WaktuSolat, rendering widget");
    props.renderWidget(
      <WaktuSolatWidget
        date={date}
        zone={zone}
        prayerTime={waktuSolat.prayerTime}
      />,
    );
  } else {
    console.log("WaktuSolat not found, rendering blank widget");
    props.renderWidget(<WaktuSolatWidget date={date} />);
  }
}

async function waktuSolatWidgetTaskHandler(props: WidgetTaskHandlerProps) {
  console.log(props.widgetAction, props.widgetInfo);

  switch (props.widgetAction) {
    case "WIDGET_ADDED":
      props.renderWidget(<WaktuSolatWidget date={startOfMinute(new Date())} />);
      await renderWaktuSolatWidget(props);
      break;

    case "WIDGET_UPDATE":
      await renderWaktuSolatWidget(props);
      break;

    case "WIDGET_RESIZED":
      // Not needed for now
      break;

    case "WIDGET_DELETED":
      // Not needed for now
      break;

    case "WIDGET_CLICK":
      // Not needed for now
      if (props.clickAction === "WAKTU_SOLAT_CLICK_ACTION") {
        await renderWaktuSolatWidget(props);
      }
      break;

    default:
      break;
  }
}

export async function widgetTaskHandler(props: WidgetTaskHandlerProps) {
  switch (props.widgetInfo.widgetName) {
    case "WaktuSolat":
      await waktuSolatWidgetTaskHandler(props);
      break;
    default:
      break;
  }
}
