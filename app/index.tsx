import { Button, Text, View } from "react-native";
import { useEffect } from "react";

import { getWaktuSolatByZone, getZoneByGps } from "@/lib/remote/waktusolat";
import { useLocation } from "@/lib/hooks/location";
import { WaktuSolatWidget } from "@/lib/widgets/WaktuSolatWidget";
import {
  requestWidgetUpdate,
  WidgetPreview,
} from "react-native-android-widget";
import { useZone } from "@/lib/hooks/zone";
import { useWaktuSolat } from "@/lib/hooks/waktu";

export default function Index() {
  const { updateLocation } = useLocation();
  const { zone, setZone } = useZone();
  const { waktuSolat, setWaktuSolat, waktuSolatExpired } = useWaktuSolat();

  const onPressUpdateLocation = async () => {
    const location = await updateLocation();
    const lat = location?.coords.latitude;
    const lng = location?.coords.longitude;

    if (lat && lng) {
      const zoneData = await getZoneByGps(lat, lng);
      setZone(zoneData);
    }
  };

  useEffect(() => {
    async function effect() {
      if (!zone) {
        return;
      }

      if (waktuSolatExpired(zone.zone)) {
        let data = await getWaktuSolatByZone(zone.zone);
        setWaktuSolat(data);
      }
    }

    effect();
  }, [zone, setWaktuSolat, waktuSolatExpired]);

  useEffect(() => {
    if (!zone || !waktuSolat) {
      return;
    }

    const zoneText = `${zone.zone} - ${zone.district}, ${zone.state}`;
    const prayer = waktuSolat.prayers[new Date().getDate() - 1];

    requestWidgetUpdate({
      widgetName: "WaktuSolat",
      renderWidget: () => <WaktuSolatWidget zone={zoneText} {...prayer} />,
      widgetNotFound: () => {},
    });
  }, [zone, waktuSolat]);

  const zoneText = zone
    ? `${zone.zone} - ${zone.district}, ${zone.state}`
    : "Location not set";
  const prayer = (waktuSolat &&
    waktuSolat.prayers[new Date().getDate() - 1]) || {
    fajr: 0,
    syuruk: 0,
    dhuhr: 0,
    asr: 0,
    maghrib: 0,
    isha: 0,
  };

  return (
    <View style={{ flex: 1 }}>
      <Button
        onPress={onPressUpdateLocation}
        title="Update Location via GPS"
        color="#841584"
      />
      <View style={{ padding: 10 }}>
        <Text>Location: {zoneText}</Text>
      </View>

      <View style={{ alignItems: "center" }}>
        <WidgetPreview
          renderWidget={() => <WaktuSolatWidget zone={zoneText} {...prayer} />}
          width={320}
          height={90}
        />
      </View>
    </View>
  );
}
