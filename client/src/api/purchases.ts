import { http } from "./https";
import { endpoints } from "./endpoints";
import type { Flight } from "../types/flights";

export type TicketDto = {
  id: number;
  user_id: string;
  flight_id: number;
  price: number;
  created_at: string;
  flight: {
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
  } | null;
};

export type Ticket = {
  id: number;
  flightId: number;
  createdAt: string;
  price: number;
  flight?: Flight;
};

function mapTicketDtoToTicket(t: TicketDto): Ticket {
  const fl = t.flight
    ? ({
        id: t.flight.id,
        name: t.flight.name,
        airlineId: t.flight.company?.id ?? 0,
        airlineName: t.flight.company?.name ?? "",
        departureTime: t.flight.departure_time ?? "",
        from: t.flight.from_airport,
        to: t.flight.to_airport,
        distanceKm: t.flight.distance_km,
        durationMinutes: t.flight.duration_sec, // usput: ovo su sekunde ako ti API tako kaže
        createdBy: t.flight.created_by_user_id,
        price: Number(t.flight.price),
        status: t.flight.status,

        approvalStatus: t.flight.approval_status ?? "PENDING",
      } satisfies Flight)
    : undefined;

  return {
    id: t.id,
    flightId: t.flight_id,
    createdAt: t.created_at,
    price: Number(t.price),
    flight: fl,
  };
}

export async function createPurchase(flightId: number): Promise<{ message: string }> {
  const res = await http.post(endpoints.purchases.create, { flightId });
  return res.data;
}

export async function fetchMyPurchases(): Promise<Ticket[]> {
  const res = await http.get(endpoints.purchases.mine);
  const data = res.data as TicketDto[];
  return data.map(mapTicketDtoToTicket);
}
