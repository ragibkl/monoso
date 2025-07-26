import React from "react";
import type { WidgetTaskHandlerProps } from "react-native-android-widget";
import { HelloWidget } from "./HelloWidget";
import { getLocation } from "../hooks/location";
import { getWaktuSolat } from "../remote/waktusolat";

async function helloWidgetTaskHandler(props: WidgetTaskHandlerProps) {
  switch (props.widgetAction) {
    case "WIDGET_ADDED":
      const location = await getLocation();
      const lat = location?.coords.latitude;
      const lng = location?.coords.longitude;

      if (!lat || !lng) {
        props.renderWidget(
          <HelloWidget
            zone="invalid location"
            fajr={0}
            syuruk={0}
            dhuhr={0}
            asr={0}
            maghrib={0}
            isha={0}
          />,
        );
      } else {
        const waktu = await getWaktuSolat(lat, lng);
        const date = new Date();
        const day = date.getDay();

        props.renderWidget(
          <HelloWidget zone={waktu.zone} {...waktu.prayers[day]} />,
        );
      }
      break;

    case "WIDGET_UPDATE":
      // Not needed for now
      break;

    case "WIDGET_RESIZED":
      // Not needed for now
      break;

    case "WIDGET_DELETED":
      // Not needed for now
      break;

    case "WIDGET_CLICK":
      // Not needed for now
      break;

    default:
      break;
  }
}

const nameToTaskHandler = {
  // Hello will be the **name** with which we will reference our widget.
  Hello: helloWidgetTaskHandler,
};

export async function widgetTaskHandler(props: WidgetTaskHandlerProps) {
  const widgetInfo = props.widgetInfo;
  const handler =
    nameToTaskHandler[widgetInfo.widgetName as keyof typeof nameToTaskHandler];

  await handler(props);
}
