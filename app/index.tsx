import { Text, View } from "react-native";
import { useEffect } from "react";

import { getZoneByGps } from "@/lib/remote/waktusolat";
import { useLocation } from "@/lib/hooks/location";
import { WaktuSolatWidget } from "@/lib/widgets/WaktuSolatWidget";
import {
  requestWidgetUpdate,
  WidgetPreview,
} from "react-native-android-widget";
import { useZone } from "@/lib/hooks/zone";
import { useWaktuSolatCurrent } from "@/lib/hooks/waktuSolatCurrent";
import { useCurrentDate } from "@/lib/hooks/date";

export default function Index() {
  const { updateLocation } = useLocation();
  const { zone, setZone } = useZone();
  const { waktuSolat } = useWaktuSolatCurrent();
  const { date } = useCurrentDate();

  useEffect(() => {
    async function effect() {
      const location = await updateLocation();

      if (location) {
        const zoneData = await getZoneByGps(
          location.coords.latitude,
          location.coords.longitude,
        );
        setZone(zoneData);
      }
    }

    effect();
  }, [updateLocation, setZone]);

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
