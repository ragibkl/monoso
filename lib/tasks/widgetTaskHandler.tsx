import { startOfMinute } from "date-fns";
import React from "react";
import type { WidgetTaskHandlerProps } from "react-native-android-widget";

import { WaktuSolatWidget } from "@/lib/widgets/WaktuSolatWidget";
import { updateWaktuSolatAndRender } from "@/lib/service/waktuSolatWidget";

async function waktuSolatWidgetTaskHandler(props: WidgetTaskHandlerProps) {
  console.log(props.widgetAction, props.widgetInfo);

  switch (props.widgetAction) {
    case "WIDGET_ADDED":
      props.renderWidget(<WaktuSolatWidget date={startOfMinute(new Date())} />);
      await updateWaktuSolatAndRender(props);
      break;

    case "WIDGET_UPDATE":
      await updateWaktuSolatAndRender(props);
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
        await updateWaktuSolatAndRender(props);
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
