import { http } from "./https";
import { endpoints } from "./endpoints";
import type { Flight } from "../types/flights";

export type FlightDto = {
  id: number;
  name: string;
  company: { id: number; name: string } | null;
  distance_km: number;
  duration_min: number;
  departure_time: string | null;
  from_airport: string;
  to_airport: string;
  created_by_user_id: string;
  price: number;
  status: "PLANNED" | "IN_PROGRESS" | "FINISHED" | "CANCELLED";
  approval_status: "PENDING" | "APPROVED" | "REJECTED";
  rejection_reason: string | null;
};

export type UiTab = "PLANNED" | "IN_PROGRESS" | "DONE";

function uiTabToApiTab(tab: UiTab): "planned" | "in_progress" | "history" {
  if (tab === "PLANNED") return "planned";
  if (tab === "IN_PROGRESS") return "in_progress";
  return "history";
}

function mapFlightDtoToFlight(d: FlightDto): Flight {
  return {
    id: d.id,
    name: d.name,
    airlineId: d.company?.id ?? 0,
    airlineName: d.company?.name ?? "",
    departureTime: d.departure_time ?? "",
    from: d.from_airport,
    to: d.to_airport,
    distanceKm: d.distance_km,
    durationMinutes: d.duration_min,
    createdBy: d.created_by_user_id,
    price: d.price,
    status: d.status,
  };
}

export async function fetchFlights(params: {
  tab: UiTab;
  search?: string;
  airlineId?: string;
}): Promise<Flight[]> {
  const apiTab = uiTabToApiTab(params.tab);

  const res = await http.get(endpoints.flights.list, {
    params: {
      tab: apiTab,
      search: params.search || undefined,
      company_id: params.airlineId || undefined,
      approval_status: "APPROVED",
    },
  });

  const data = res.data as FlightDto[];
  return data.map(mapFlightDtoToFlight);
}
