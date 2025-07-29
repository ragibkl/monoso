import "expo-router/entry";
import { registerWidgetTaskHandler } from "react-native-android-widget";

import { widgetTaskHandler } from "@/lib/widgets/widgetTaskHandler";
import "@/lib/tasks/waktuSolatWidgetTask";

registerWidgetTaskHandler(widgetTaskHandler);
