import { createDataStore } from "./dataStore";

export type Zone = {
  zone: string;
  state: string;
  district: string;
};

export const zoneStore = createDataStore<Zone | null>("ZONE_DATA_KEY", null);
