import "expo-router/entry";
import { registerWidgetTaskHandler } from "react-native-android-widget";

import "@/lib/tasks/backgroundTasks";
import { widgetTaskHandler } from "@/lib/tasks/widgetTaskHandler";

registerWidgetTaskHandler(widgetTaskHandler);
