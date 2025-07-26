import React from "react";
import type { WidgetTaskHandlerProps } from "react-native-android-widget";

import { WaktuSolatWidget } from "./WaktuSolatWidget";
import { getWaktuSolatByZone } from "../remote/waktusolat";
import {
  getWaktuSolatData,
  isWaktuSolatExpired,
  setWaktuSolatData,
} from "../hooks/waktu";
import { getZoneData } from "../hooks/zone";

async function waktuSolatWidgetTaskHandler(props: WidgetTaskHandlerProps) {
  console.log(props.widgetInfo, props.widgetAction);
  switch (props.widgetAction) {
    case "WIDGET_ADDED":
      {
        props.renderWidget(
          <WaktuSolatWidget
            zone="invalid location"
            date={new Date()}
            fajr={0}
            syuruk={0}
            dhuhr={0}
            asr={0}
            maghrib={0}
            isha={0}
          />,
        );

        const zone = await getZoneData();
        if (!zone) {
          return;
        }

        let waktuSolat = await getWaktuSolatData();
        if (!waktuSolat || isWaktuSolatExpired(waktuSolat, zone.zone)) {
          waktuSolat = await getWaktuSolatByZone(zone.zone);
          await setWaktuSolatData(waktuSolat);
        }

        const date = new Date();
        const zoneText = `${zone.zone} - ${zone.district}, ${zone.state}`;

        props.renderWidget(
          <WaktuSolatWidget
            zone={zoneText}
            date={date}
            {...waktuSolat.prayers[date.getDay()]}
          />,
        );
      }

      break;

    case "WIDGET_UPDATE":
      {
        const zone = await getZoneData();
        if (!zone) {
          return;
        }

        let waktuSolat = await getWaktuSolatData();
        if (!waktuSolat || isWaktuSolatExpired(waktuSolat, zone.zone)) {
          waktuSolat = await getWaktuSolatByZone(zone.zone);
          await setWaktuSolatData(waktuSolat);
        }

        const date = new Date();
        const zoneText = `${zone.zone} - ${zone.district}, ${zone.state}`;

        props.renderWidget(
          <WaktuSolatWidget
            zone={zoneText}
            date={date}
            {...waktuSolat.prayers[date.getDay()]}
          />,
        );
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
