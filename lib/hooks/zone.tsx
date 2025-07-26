import AsyncStorage from "@react-native-async-storage/async-storage";
import { ZoneResponse } from "../remote/waktusolat";
import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export async function setZoneData(zone: ZoneResponse | null) {
  if (zone) {
    const json = JSON.stringify(zone);
    await AsyncStorage.setItem("ZONE_DATA_KEY", json);
  } else {
    await AsyncStorage.removeItem("ZONE_DATA_KEY");
  }
}

export async function getZoneData(): Promise<ZoneResponse | null> {
  const json = await AsyncStorage.getItem("ZONE_DATA_KEY");
  if (!json) {
    return null;
  }
  return JSON.parse(json) as ZoneResponse;
}

export const ZoneContext = createContext<ZoneResponse | null>(null);
export const SetZoneContext = createContext<(z: ZoneResponse) => void>(
  (_z) => {},
);

type ZoneProviderProps = {
  children: ReactNode | ReactNode[];
};

export function ZoneProvider(props: ZoneProviderProps) {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [zone, setZoneState] = useState<ZoneResponse | null>(null);

  useEffect(() => {
    async function effect() {
      const z = await getZoneData();
      setZoneState(z);
      setIsLoading(false);
    }

    effect();
  }, []);

  const setZone = useCallback((zone: ZoneResponse) => {
    setZoneData(zone);
    setZoneState(zone);
  }, []);

  return (
    <ZoneContext.Provider value={zone}>
      <SetZoneContext.Provider value={setZone}>
        {isLoading ? <></> : props.children}
      </SetZoneContext.Provider>
    </ZoneContext.Provider>
  );
}

export function useZone() {
  const zone = useContext(ZoneContext);
  const setZone = useContext(SetZoneContext);

  return { zone, setZone };
}
