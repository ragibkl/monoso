import { Text, View } from "react-native";
import { useEffect, useState } from "react";

import { getWaktuSolat, WaktuSolatResponse } from "@/lib/remote/waktusolat";
import { useLocation } from "@/lib/hooks/location";
import { HelloWidget } from "@/lib/widgets/HelloWidget";
import { WidgetPreview } from "react-native-android-widget";

export default function Index() {
  const { location } = useLocation();
  const lat = location?.coords.latitude;
  const lng = location?.coords.longitude;

  const [waktu, setWaktu] = useState<WaktuSolatResponse | null>(null);

  useEffect(() => {
    async function effect() {
      if (!lat || !lng) {
        return;
      }

      let data = await getWaktuSolat(lat, lng);
      setWaktu(data);
    }

    effect();
  }, [lat, lng]);

  if (!waktu) {
    return (
      <View>
        <Text>Location or WaktuSolat not available</Text>
        <WidgetPreview
          renderWidget={() => (
            <HelloWidget
              zone="invalid location"
              fajr={0}
              syuruk={0}
              dhuhr={0}
              asr={0}
              maghrib={0}
              isha={0}
            />
          )}
          width={320}
          height={60}
        />
      </View>
    );
  }

  const date = new Date();
  const day = date.getDay();

  return (
    <View style={{ flex: 1 }}>
      <Text>lat: {location?.coords.latitude}</Text>
      <Text>lng: {location?.coords.longitude}</Text>

      <View style={{ height: 20 }} />

      <WidgetPreview
        renderWidget={() => (
          <HelloWidget zone={waktu.zone} {...waktu.prayers[day]} />
        )}
        width={320}
        height={60}
      />
    </View>
  );
}
