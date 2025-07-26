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

async function renderWaktuSolatWidget(props: WidgetTaskHandlerProps) {
  const zone = await getZoneData();
  if (!zone) {
    return;
  }

  const date = new Date();
  let waktuSolat = await getWaktuSolatData();
  if (!waktuSolat || isWaktuSolatExpired(waktuSolat, zone.zone)) {
    waktuSolat = await getWaktuSolatByZone(zone.zone);
    await setWaktuSolatData(waktuSolat);
  }

  const zoneText = `${zone.zone} - ${zone.district}, ${zone.state}`;
  const prayer = waktuSolat.prayers[date.getDate() - 1];
  props.renderWidget(<WaktuSolatWidget zone={zoneText} {...prayer} />);
}

async function waktuSolatWidgetTaskHandler(props: WidgetTaskHandlerProps) {
  console.log(props.widgetAction, props.widgetInfo);

  switch (props.widgetAction) {
    case "WIDGET_ADDED":
      {
        props.renderWidget(
          <WaktuSolatWidget
            zone="invalid location"
            fajr={0}
            syuruk={0}
            dhuhr={0}
            asr={0}
            maghrib={0}
            isha={0}
          />,
        );

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
