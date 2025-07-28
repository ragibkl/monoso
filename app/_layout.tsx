import { Stack } from "expo-router";

import { waktuSolatStore } from "@/lib/data/waktuSolatStore";
import { zoneStore } from "@/lib/data/zoneStore";

export default function RootLayout() {
  return (
    <waktuSolatStore.Provider>
      <zoneStore.Provider>
        <Stack />
      </zoneStore.Provider>
    </waktuSolatStore.Provider>
  );
}
