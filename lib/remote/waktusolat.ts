import axios from "axios";

export type Prayer = {
  day: number;
  hijri: string;
  fajr: number;
  syuruk: number;
  dhuhr: number;
  asr: number;
  maghrib: number;
  isha: number;
};

export type WaktuSolatResponse = {
  zone: string;
  year: number;
  month: string;
  month_number: number;
  last_updated: null;
  prayers: Prayer[];
};

export async function getWaktuSolatByGps(
  lat: number,
  lng: number,
): Promise<WaktuSolatResponse> {
  const url = `https://api.waktusolat.app/v2/solat/${lat}/${lng}`;
  const response = await axios.get(url);
  return response.data as WaktuSolatResponse;
}

export async function getWaktuSolatByZone(
  zone: string,
): Promise<WaktuSolatResponse> {
  const url = `https://api.waktusolat.app/v2/solat/${zone}`;
  const response = await axios.get(url);
  return response.data as WaktuSolatResponse;
}

export type ZoneResponse = {
  zone: string;
  state: string;
  district: string;
};

export async function getZoneByGps(
  lat: number,
  lng: number,
): Promise<ZoneResponse> {
  const url = `https://api.waktusolat.app/zones/${lat}/${lng}`;
  const response = await axios.get(url);
  return response.data as ZoneResponse;
}
