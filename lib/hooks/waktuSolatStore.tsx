import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  ReactNode,
  useState,
  useEffect,
  useCallback,
  useContext,
} from "react";
import merge from "deepmerge";

import {
  getWaktuSolatByZone,
  WaktuSolatResponse,
} from "@/lib/remote/waktusolat";

export type PrayerTime = {
  fajr: number;
  syuruk: number;
  dhuhr: number;
  asr: number;
  maghrib: number;
  isha: number;
};

export type WaktuSolat = {
  year: number;
  month: number;
  date: number;
  zone: string;
  prayerTime: PrayerTime;
};

export type WaktuSolatStore = {
  [zone: string]: {
    [year: number]: {
      [month: number]: {
        [date: string]: WaktuSolat;
      };
    };
  };
};

export async function setWaktuSolatStore(waktuSolat: WaktuSolatStore) {
  const json = JSON.stringify(waktuSolat);
  await AsyncStorage.setItem("WAKTU_SOLAT_STORE_KEY", json);
}

export async function getWaktuSolatStore(): Promise<WaktuSolatStore> {
  const json = await AsyncStorage.getItem("WAKTU_SOLAT_STORE_KEY");
  if (!json) {
    return {};
  }
  return JSON.parse(json) as WaktuSolatStore;
}

export const WaktuSolatStoreContext = createContext<WaktuSolatStore>({});
export const SetWaktuSolatStoreContext = createContext<
  (w: WaktuSolatStore) => void
>((_w) => {});

type WaktuSolatStoreProviderProps = {
  children: ReactNode | ReactNode[];
};

export function WaktuSolatStoreProvider(props: WaktuSolatStoreProviderProps) {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [waktuSolat, setWaktuSolatState] = useState<WaktuSolatStore>({});

  useEffect(() => {
    async function effect() {
      const w = await getWaktuSolatStore();
      setWaktuSolatState(w);
      setIsLoading(false);
    }

    effect();
  }, []);

  const setWaktuSolat = useCallback(async (waktuSolat: WaktuSolatStore) => {
    console.log(waktuSolat);
    await setWaktuSolatStore(waktuSolat);
    setWaktuSolatState(waktuSolat);
  }, []);

  return (
    <WaktuSolatStoreContext.Provider value={waktuSolat}>
      <SetWaktuSolatStoreContext.Provider value={setWaktuSolat}>
        {isLoading ? <></> : props.children}
      </SetWaktuSolatStoreContext.Provider>
    </WaktuSolatStoreContext.Provider>
  );
}

export function getWaktuSolatFromStore(
  store: WaktuSolatStore,
  zone: string,
  date: Date,
): WaktuSolat | null {
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();

  return store[zone]?.[y]?.[m]?.[d] || null;
}

export function mergeWaktuSolatResponseIntoStore(
  store: WaktuSolatStore,
  res: WaktuSolatResponse,
): WaktuSolatStore {
  const newMonth: {
    [date: number]: WaktuSolat;
  } = {};

  res.prayers.forEach((p) => {
    newMonth[p.day] = {
      year: res.year,
      month: res.month_number,
      date: p.day,
      zone: res.zone,
      prayerTime: {
        fajr: p.fajr,
        syuruk: p.syuruk,
        dhuhr: p.dhuhr,
        asr: p.asr,
        maghrib: p.maghrib,
        isha: p.isha,
      },
    };
  });

  return merge(store, {
    [res.zone]: {
      [res.year]: {
        [res.month_number]: newMonth,
      },
    },
  });
}

export async function getOrRetrieveWaktuSolatFromData(
  zone: string,
  date: Date,
) {
  const store = await getWaktuSolatStore();

  const waktuSolat = getWaktuSolatFromStore(store, zone, date);
  if (waktuSolat) {
    console.log(`Found WaktuSolat from store. zone=${zone} date=${date}`);
    return waktuSolat;
  }

  const res = await getWaktuSolatByZone(zone);
  const newStore = mergeWaktuSolatResponseIntoStore(store, res);
  console.log(`Update WaktuSolat into store`);
  await setWaktuSolatStore(newStore);

  return getWaktuSolatFromStore(newStore, zone, date);
}

export function useWaktuSolatStore() {
  const store = useContext(WaktuSolatStoreContext);
  const setStore = useContext(SetWaktuSolatStoreContext);

  const getOrRetrieveWaktuSolat = useCallback(
    async (zone: string, date: Date): Promise<WaktuSolat | null> => {
      const waktuSolat = getWaktuSolatFromStore(store, zone, date);
      if (waktuSolat) {
        console.log(`Found WaktuSolat from store. zone=${zone} date=${date}`);
        return waktuSolat;
      }

      console.log(`Fetch new WaktuSolat from api. zone=${zone} date=${date}`);
      const res = await getWaktuSolatByZone(zone);
      const newStore = mergeWaktuSolatResponseIntoStore(store, res);

      console.log(`Update WaktuSolat into store`);
      setStore(newStore);

      return getWaktuSolatFromStore(newStore, zone, date);
    },
    [store, setStore],
  );

  return { getOrRetrieveWaktuSolat };
}
