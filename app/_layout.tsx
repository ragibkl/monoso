import { Stack } from "expo-router";

import { ZoneProvider } from "@/lib/hooks/zone";
import { WaktuSolatStoreProvider } from "@/lib/hooks/waktuSolatStore";

export default function RootLayout() {
  return (
    <WaktuSolatStoreProvider>
      <ZoneProvider>
        <Stack />
      </ZoneProvider>
    </WaktuSolatStoreProvider>
  );
}
