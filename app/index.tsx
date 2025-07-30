import * as Notifications from "expo-notifications";
import { Text, View, Button } from "react-native";
import { WidgetPreview } from "react-native-android-widget";

import { useCurrentDate } from "@/lib/hooks/date";
import { useWaktuSolatCurrent } from "@/lib/hooks/waktuSolat";
import { useUpdatedZone } from "@/lib/hooks/zone";
import { WaktuSolatWidget } from "@/lib/widgets/WaktuSolatWidget";

export default function Index() {
  const { date } = useCurrentDate();
  const { zone } = useUpdatedZone();
  const { waktuSolat } = useWaktuSolatCurrent();

  const zoneText = zone
    ? `${zone.zone} - ${zone.district}, ${zone.state}`
    : "Location not set";

  return (
    <View style={{ flex: 1 }}>
      <View style={{ padding: 10 }}>
        <Text>Location: {zoneText}</Text>
      </View>

      <View style={{ alignItems: "center" }}>
        <WidgetPreview
          renderWidget={() => (
            <WaktuSolatWidget
              date={date}
              zone={zone || undefined}
              prayerTime={waktuSolat?.prayerTime || undefined}
            />
          )}
          width={320}
          height={90}
        />
      </View>

      <Button
        title="notif"
        onPress={() => {
          Notifications.scheduleNotificationAsync({
            content: {
              title: "Waktu Solat - test",
            },
            trigger: {
              type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
              seconds: 10,
              repeats: false,
            },
          });
        }}
      />
    </View>
  );
}
