import { http } from "./https";
import { endpoints } from "./endpoints";

type BackendFlight = {
  id?: number;
  name?: string;
  from_airport?: string;
  to_airport?: string;
  from?: string;
  to?: string;
};

type BackendTicket = {
  id: number;
  flight_id?: number;
  flightId?: number;
  price?: number;
  created_at?: string;
  createdAt?: string;
  flight?: BackendFlight | null;
};

export type Ticket = {
  id: number;
  flightId: number;
  price: number;
  createdAt: string; 
  flight?: {
    id?: number;
    name?: string;
    from?: string;
    to?: string;
  };
};

function mapTicket(t: BackendTicket): Ticket {
  const flightId = Number(t.flightId ?? t.flight_id ?? 0);
  const price = Number(t.price ?? 0);

  const createdAtRaw = t.createdAt ?? t.created_at ?? null;
  const createdAt = createdAtRaw ? String(createdAtRaw) : new Date().toISOString();

  const fl = t.flight ?? undefined;

  return {
    id: t.id,
    flightId,
    price,
    createdAt,
    flight: fl
      ? {
          id: fl.id,
          name: fl.name,
          from: fl.from ?? fl.from_airport,
          to: fl.to ?? fl.to_airport,
        }
      : undefined,
  };
}

export async function buyTicket(flightId: number) {
  const { data } = await http.post(endpoints.tickets.buy, { flight_id: flightId });
  return data;
}

export async function myTickets(): Promise<Ticket[]> {
  const { data } = await http.get<BackendTicket[]>(endpoints.tickets.my);
  return Array.isArray(data) ? data.map(mapTicket) : [];
}
