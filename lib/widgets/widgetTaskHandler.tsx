import React from "react";
import type { WidgetTaskHandlerProps } from "react-native-android-widget";

import { getOrRetrieveWaktuSolat } from "@/lib/service/waktuSolat";

import { WaktuSolatWidget } from "./WaktuSolatWidget";
import { zoneStore } from "../data/zoneStore";

async function renderWaktuSolatWidget(props: WidgetTaskHandlerProps) {
  const zone = await zoneStore.load();
  if (!zone) {
    console.log("Zone not set, rendering blank widget");
    props.renderWidget(<WaktuSolatWidget date={new Date()} />);
    return;
  }

  const date = new Date();

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
    props.renderWidget(<WaktuSolatWidget date={new Date()} />);
  }
}

async function waktuSolatWidgetTaskHandler(props: WidgetTaskHandlerProps) {
  console.log(props.widgetAction, props.widgetInfo);

  switch (props.widgetAction) {
    case "WIDGET_ADDED":
      {
        props.renderWidget(<WaktuSolatWidget date={new Date()} />);
        await renderWaktuSolatWidget(props);
      }

      break;

    case "WIDGET_UPDATE":
      {
        await renderWaktuSolatWidget(props);
      }
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

const nameToTaskHandler = {
  // WaktuSolat will be the **name** with which we will reference our widget.
  WaktuSolat: waktuSolatWidgetTaskHandler,
};

export async function widgetTaskHandler(props: WidgetTaskHandlerProps) {
  const widgetInfo = props.widgetInfo;
  const handler =
    nameToTaskHandler[widgetInfo.widgetName as keyof typeof nameToTaskHandler];

  await handler(props);
}
