import { http } from "./https";
import { endpoints } from "./endpoints";
import type { Flight } from "../types/flights";

export type FlightDto = {
  id: number;
  name: string;
  company: { id: number; name: string } | null;

  distance_km: number | string | null;

  duration_min?: number | string | null;
  duration_sec?: number | string | null;

  departure_time: string | null;
  from_airport: string;
  to_airport: string;
  created_by_user_id: string;

  price: number | string | null;

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

function toNum(v: unknown): number | null {
  if (v === null || v === undefined) return null;
  const n = typeof v === "string" ? Number(v) : (v as number);
  return Number.isFinite(n) ? n : null;
}

function mapFlightDtoToFlight(d: FlightDto): Flight {
  const durMin = toNum(d.duration_min);
  const durSec = toNum(d.duration_sec);
  const durationMinutes =
    durMin ?? (durSec != null ? Math.max(1, Math.round(durSec / 60)) : 0);

  return {
    id: d.id,
    name: d.name,
    airlineId: d.company?.id ?? 0,
    airlineName: d.company?.name ?? "",
    departureTime: d.departure_time ?? "",
    from: d.from_airport,
    to: d.to_airport,
    distanceKm: toNum(d.distance_km) ?? 0,
    durationMinutes,
    createdBy: d.created_by_user_id,
    price: toNum(d.price) ?? 0,
    status: d.status,
    approvalStatus: d.approval_status,
    rejectionReason: d.rejection_reason,
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
