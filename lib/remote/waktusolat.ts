import axios from "axios";

export type Prayer = {
  day: 1;
  hijri: "1446-12-04";
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

export async function getWaktuSolat(
  lat: number,
  lng: number,
): Promise<WaktuSolatResponse> {
  const url = `https://api.waktusolat.app/v2/solat/${lat}/${lng}`;
  const response = await axios.get(url);
  return response.data as WaktuSolatResponse;
}
