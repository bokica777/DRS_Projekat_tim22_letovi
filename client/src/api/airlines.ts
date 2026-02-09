import { http } from "./https";
import { endpoints } from "./endpoints";
import type { Airline } from "../types/airlines";

export async function fetchAirlines(): Promise<Airline[]> {
  const res = await http.get(endpoints.airlines.list);
  return res.data;
}
