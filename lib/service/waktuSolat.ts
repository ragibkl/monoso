import merge from "deepmerge";

import {
  WaktuSolat,
  WaktuSolatStore,
  waktuSolatStore,
} from "@/lib/data/waktuSolatStore";
import {
  getWaktuSolatByZone,
  WaktuSolatResponse,
} from "@/lib/remote/waktusolat";

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

export async function getOrRetrieveWaktuSolat(zone: string, date: Date) {
  const store = await waktuSolatStore.load();

  const waktuSolat = getWaktuSolatFromStore(store, zone, date);
  if (waktuSolat) {
    console.log(`Found WaktuSolat from store. zone=${zone} date=${date}`);
    return waktuSolat;
  }

  const res = await getWaktuSolatByZone(zone);
  const newStore = mergeWaktuSolatResponseIntoStore(store, res);
  console.log(`Update WaktuSolat into store`);
  await waktuSolatStore.save(newStore);

  return getWaktuSolatFromStore(newStore, zone, date);
}

export function getNextPrayerTime(
  waktuSolat: WaktuSolat,
  date: Date,
): [string, number] | null {
  const { fajr, syuruk, dhuhr, asr, maghrib, isha } = waktuSolat.prayerTime;
  const epoch = date.getTime() / 1000;

  if (epoch < fajr) {
    return ["fajr", fajr - epoch];
  } else if (epoch < syuruk) {
    return ["syuruk", syuruk - epoch];
  } else if (epoch < dhuhr) {
    return ["dhuhr", dhuhr - epoch];
  } else if (epoch < asr) {
    return ["asr", asr - epoch];
  } else if (epoch < maghrib) {
    return ["maghrib", maghrib - epoch];
  } else if (epoch < isha) {
    return ["isha", isha - epoch];
  } else {
    return null;
  }
}
