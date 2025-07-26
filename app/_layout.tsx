import { Stack } from "expo-router";

import { WaktuSolatProvider } from "@/lib/hooks/waktu";
import { ZoneProvider } from "@/lib/hooks/zone";

export default function RootLayout() {
  return (
    <ZoneProvider>
      <WaktuSolatProvider>
        <Stack />
      </WaktuSolatProvider>
    </ZoneProvider>
  );
}
