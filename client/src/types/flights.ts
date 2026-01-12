export type FlightStatus =
  | "PENDING"
  | "PLANNED"
  | "IN_PROGRESS"
  | "FINISHED"
  | "CANCELLED"
  | "REJECTED";

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
  rejectionReason?: string;
  createdBy?: string;
};


