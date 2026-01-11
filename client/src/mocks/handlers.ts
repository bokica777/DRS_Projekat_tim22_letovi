import type { Flight, FlightStatus } from "../types/flights";
import { mockAirlines, mockFlights } from "./db";

type ListFlightsParams = {
  search?: string;
  airlineId?: string;
  status?: FlightStatus;
};

export function listAirlines() {
  return Promise.resolve(mockAirlines);
}

export function listFlights(params: ListFlightsParams) {
  const search = (params.search ?? "").trim().toLowerCase();
  const airlineId = params.airlineId ? Number(params.airlineId) : undefined;
  const status = params.status;

  let flights: Flight[] = [...mockFlights];

  if (status) flights = flights.filter((f) => f.status === status);
  if (airlineId) flights = flights.filter((f) => f.airlineId === airlineId);
  if (search) {
    flights = flights.filter(
      (f) =>
        f.name.toLowerCase().includes(search) ||
        f.airlineName.toLowerCase().includes(search)
    );
  }

  return new Promise<Flight[]>((resolve) => setTimeout(() => resolve(flights), 250));
}
