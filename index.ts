import "expo-router/entry";
import { registerWidgetTaskHandler } from "react-native-android-widget";

import { widgetTaskHandler } from "./components/widget-task-handler";

registerWidgetTaskHandler(widgetTaskHandler);
