import { useEffect } from "react";
import { Text, View } from "react-native";
import {
  requestWidgetUpdate,
  WidgetPreview,
} from "react-native-android-widget";

import { useCurrentDate } from "@/lib/hooks/date";
import { useLocation } from "@/lib/service/location";
import { useWaktuSolatCurrent } from "@/lib/hooks/waktuSolat";
import { useZone } from "@/lib/hooks/zone";
import { WaktuSolatWidget } from "@/lib/widgets/WaktuSolatWidget";

export default function Index() {
  const { location } = useLocation();
  const { zone, updateZoneViaGps } = useZone();
  const { waktuSolat } = useWaktuSolatCurrent();
  const { date } = useCurrentDate();

  useEffect(() => {
    async function effect() {
      if (location) {
        await updateZoneViaGps(
          location.coords.latitude,
          location.coords.longitude,
        );
      }
    }

    effect();
  }, [location, updateZoneViaGps]);

  useEffect(() => {
    if (!zone || !waktuSolat) {
      return;
    }

    requestWidgetUpdate({
      widgetName: "WaktuSolat",
      renderWidget: () => (
        <WaktuSolatWidget
          date={date}
          zone={zone}
          prayerTime={waktuSolat.prayerTime}
        />
      ),
      widgetNotFound: () => {},
    });
  }, [date, zone, waktuSolat]);

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
    </View>
  );
}
