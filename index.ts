import "expo-router/entry";
import { registerWidgetTaskHandler } from "react-native-android-widget";

import "@/lib/tasks/waktuSolatWidgetTask";
import { widgetTaskHandler } from "@/lib/widgets/widgetTaskHandler";

registerWidgetTaskHandler(widgetTaskHandler);
