import { Button, Text, View } from "react-native";
import { useEffect } from "react";

import { getWaktuSolatByZone, getZoneByGps } from "@/lib/remote/waktusolat";
import { useLocation } from "@/lib/hooks/location";
import { WaktuSolatWidget } from "@/lib/widgets/WaktuSolatWidget";
import { WidgetPreview } from "react-native-android-widget";
import { useZone } from "@/lib/hooks/zone";
import { useWaktuSolat } from "@/lib/hooks/waktu";

export default function Index() {
  const { location, updateLocation } = useLocation();
  const { zone, setZone } = useZone();
  const { waktuSolat, setWaktuSolat, waktuSolatExpired } = useWaktuSolat();

  const lat = location?.coords.latitude;
  const lng = location?.coords.longitude;

  const date = new Date();
  const day = date.getDay();

  const onPressSetLocation = async () => {
    await updateLocation();
  };

  useEffect(() => {
    async function effect() {
      if (lat && lng) {
        const zoneData = await getZoneByGps(lat, lng);
        setZone(zoneData);
      }
    }

    effect();
  }, [lat, lng, setZone]);

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

  const zoneText = zone
    ? `${zone.zone} - ${zone.district}, ${zone.state}`
    : "invalid location";
  const prayer = (waktuSolat && waktuSolat.prayers[day]) || {
    fajr: 0,
    syuruk: 0,
    dhuhr: 0,
    asr: 0,
    maghrib: 0,
    isha: 0,
  };
  return (
    <View style={{ flex: 1 }}>
      <Text>lat: {lat}</Text>
      <Text>lng: {lng}</Text>
      <Text>zone: {zoneText}</Text>

      <Button
        onPress={onPressSetLocation}
        title="Set Location"
        color="#841584"
      />

      <View style={{ height: 20 }} />

      <WidgetPreview
        renderWidget={() => (
          <WaktuSolatWidget zone={zoneText} date={date} {...prayer} />
        )}
        width={320}
        height={80}
      />
    </View>
  );
}
