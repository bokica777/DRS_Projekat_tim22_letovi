import { http } from "./https";
import { endpoints } from "./endpoints";
import type { Flight, Airline } from "../types/flights";

export type FlightDto = {
  id: number;
  name: string;
  company: { id: number; name: string } | null;
  distance_km: number;
  duration_sec: number;
  departure_time: string | null;
  from_airport: string;
  to_airport: string;
  created_by_user_id: string;
  price: number;
  status: "PLANNED" | "IN_PROGRESS" | "FINISHED" | "CANCELLED";
  approval_status: "PENDING" | "APPROVED" | "REJECTED";
  rejection_reason: string | null;
};

export type ManagerFlight = Flight & {
  approvalStatus: "PENDING" | "APPROVED" | "REJECTED";
  createdByUserId: string;
};

export type CreateManagerFlightPayload = {
  name: string;
  company_id: number;
  distance_km: number;
  duration_sec: number;
  departure_time: string;
  from_airport: string;
  to_airport: string;
  price: number;
};

export type UpdateManagerFlightPayload = Partial<CreateManagerFlightPayload>;

function mapDtoToManagerFlight(d: FlightDto): ManagerFlight {
  return {
    id: d.id,
    name: d.name,
    airlineId: d.company?.id ?? 0,
    airlineName: d.company?.name ?? "",
    departureTime: d.departure_time ?? "",
    from: d.from_airport,
    to: d.to_airport,
    durationMinutes: Math.ceil((d.duration_sec ?? 0) / 60),
    distanceKm: d.distance_km,
    price: Number(d.price),
    status: d.status as any,
    rejectionReason: d.rejection_reason ?? undefined,
    createdBy: d.created_by_user_id as any,
    approvalStatus: d.approval_status,
    createdByUserId: d.created_by_user_id,
  };
}

export async function createManagerFlight(payload: CreateManagerFlightPayload): Promise<ManagerFlight> {
  const res = await http.post(endpoints.flights.list, payload);
  const dto = res.data as FlightDto;
  return mapDtoToManagerFlight(dto);
}

export async function fetchManagerFlightById(id: number): Promise<ManagerFlight> {
  const res = await http.get(endpoints.flights.byId(id));
  const dto = res.data as FlightDto;
  return mapDtoToManagerFlight(dto);
}

export async function updateManagerRejectedFlight(id: number, payload: UpdateManagerFlightPayload): Promise<ManagerFlight> {
  const res = await http.patch(endpoints.flights.byId(id), payload);
  const dto = res.data as FlightDto;
  return mapDtoToManagerFlight(dto);
}

export async function fetchManagerMyFlights(createdByUserId: string): Promise<ManagerFlight[]> {
  const res = await http.get(endpoints.flights.list, {
    params: { created_by_user_id: createdByUserId },
  });
  const data = res.data as FlightDto[];
  return data.map(mapDtoToManagerFlight);
}

export async function fetchAirlinesForManager(): Promise<Airline[]> {
  const res = await http.get(endpoints.airlines.list);
  return res.data;
}
