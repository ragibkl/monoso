import { Stack } from "expo-router";

import { WaktuSolatProvider } from "@/lib/hooks/waktu";
import { ZoneProvider } from "@/lib/hooks/zone";
import { WaktuSolatStoreProvider } from "@/lib/hooks/waktuSolatStore";

export default function RootLayout() {
  return (
    <WaktuSolatStoreProvider>
      <ZoneProvider>
        <WaktuSolatProvider>
          <Stack />
        </WaktuSolatProvider>
      </ZoneProvider>
    </WaktuSolatStoreProvider>
  );
}
