import type { Airline, Flight } from "../types/flights";

export const mockAirlines: Airline[] = [
  { id: 1, name: "Air Serbia" },
  { id: 2, name: "Lufthansa" },
  { id: 3, name: "Air France" },
];

export const mockFlights: Flight[] = [
  {
    id: 1,
    name: "Beograd – Pariz",
    airlineId: 3,
    airlineName: "Air France",
    departureTime: new Date(Date.now() + 60_000 * 30).toISOString(),
    from: "BEG",
    to: "CDG",
    durationMinutes: 60,
    distanceKm: 1440,
    price: 120,
    status: "PLANNED",
  },
  {
    id: 2,
    name: "Beograd – Frankfurt",
    airlineId: 2,
    airlineName: "Lufthansa",
    departureTime: new Date(Date.now() - 60_000 * 10).toISOString(),
    from: "BEG",
    to: "FRA",
    durationMinutes: 60,
    distanceKm: 1060,
    price: 150,
    status: "IN_PROGRESS",
  },
  {
    id: 3,
    name: "Beograd – Rim",
    airlineId: 1,
    airlineName: "Air Serbia",
    departureTime: new Date(Date.now() - 60_000 * 120).toISOString(),
    from: "BEG",
    to: "FCO",
    durationMinutes: 60,
    distanceKm: 760,
    price: 90,
    status: "FINISHED",
  },
];
