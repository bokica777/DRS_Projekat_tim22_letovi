import { http } from "./https";
import { endpoints } from "./endpoints";
import type { Airline } from "../types/flights";

export async function fetchAirlines(): Promise<Airline[]> {
  const res = await http.get(endpoints.airlines.list);
  return res.data;
}
