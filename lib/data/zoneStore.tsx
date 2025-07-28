import { ZoneResponse } from "../remote/waktusolat";
import { createDataStore } from "./dataStore";

export const zoneStore = createDataStore<ZoneResponse | null>(
  "ZONE_DATA_KEY",
  null,
);
