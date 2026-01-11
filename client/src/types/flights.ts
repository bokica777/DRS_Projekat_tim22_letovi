export type FlightStatus = "PLANNED" | "IN_PROGRESS" | "FINISHED" | "CANCELLED";

export type Airline = {
  id: number;
  name: string;
};

export type Flight = {
  id: number;
  name: string;
  airlineId: number;
  airlineName: string;
  departureTime: string; // ISO
  from: string;
  to: string;
  durationMinutes: number;
  distanceKm: number;
  price: number;
  status: FlightStatus;
};
