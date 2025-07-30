import { Stack } from "expo-router";

import { waktuSolatStore } from "@/lib/data/waktuSolatStore";
import { zoneStore } from "@/lib/data/zoneStore";
import { useWaktuSolatWidgetUpdate } from "@/lib/hooks/waktuSolatWidget";

export default function RootLayout() {
  useWaktuSolatWidgetUpdate();

  return (
    <waktuSolatStore.Provider>
      <zoneStore.Provider>
        <Stack />
      </zoneStore.Provider>
    </waktuSolatStore.Provider>
  );
}
