import AsyncStorage from "@react-native-async-storage/async-storage";
import { WaktuSolatResponse } from "../remote/waktusolat";
import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export async function setWaktuSolatData(waktuSolat: WaktuSolatResponse) {
  const json = JSON.stringify(waktuSolat);
  await AsyncStorage.setItem("WAKTU_SOLAT_DATA_KEY", json);
}

export async function getWaktuSolatData(): Promise<WaktuSolatResponse | null> {
  const json = await AsyncStorage.getItem("WAKTU_SOLAT_DATA_KEY");
  if (!json) {
    return null;
  }
  return JSON.parse(json) as WaktuSolatResponse;
}

export const WaktuSolatContext = createContext<WaktuSolatResponse | null>(null);
export const SetWaktuSolatContext = createContext<
  (w: WaktuSolatResponse) => void
>((_w) => {});

type WaktuSolatProviderProps = {
  children: ReactNode | ReactNode[];
};

export function WaktuSolatProvider(props: WaktuSolatProviderProps) {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [waktuSolat, setWaktuSolatState] = useState<WaktuSolatResponse | null>(
    null,
  );

  useEffect(() => {
    async function effect() {
      const w = await getWaktuSolatData();
      setWaktuSolatState(w);
      setIsLoading(false);
    }

    effect();
  }, []);

  const setWaktuSolat = useCallback((waktuSolat: WaktuSolatResponse) => {
    setWaktuSolatData(waktuSolat);
    setWaktuSolatState(waktuSolat);
  }, []);

  return (
    <WaktuSolatContext.Provider value={waktuSolat}>
      <SetWaktuSolatContext.Provider value={setWaktuSolat}>
        {isLoading ? <></> : props.children}
      </SetWaktuSolatContext.Provider>
    </WaktuSolatContext.Provider>
  );
}

export function isWaktuSolatExpired(
  waktuSolat: WaktuSolatResponse,
  zone: string,
) {
  if (!waktuSolat) {
    return true;
  }

  const date = new Date();
  if (
    waktuSolat.zone !== zone ||
    waktuSolat.year !== date.getFullYear() ||
    waktuSolat.month_number !== date.getMonth() + 1
  ) {
    return true;
  }

  return false;
}

export function useWaktuSolat() {
  const waktuSolat = useContext(WaktuSolatContext);
  const setWaktuSolat = useContext(SetWaktuSolatContext);

  function waktuSolatExpired(zone: string) {
    if (!waktuSolat) {
      return true;
    }
    return isWaktuSolatExpired(waktuSolat, zone);
  }

  return { waktuSolat, setWaktuSolat, waktuSolatExpired };
}
