import { http } from "./https";
import { endpoints } from "./endpoints";
import type { Flight } from "../types/flights";

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

export type AdminFlight = Flight & {
  approvalStatus: "PENDING" | "APPROVED" | "REJECTED";
  createdByUserId: string;
};

function mapDtoToAdminFlight(d: FlightDto): AdminFlight {
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

export async function fetchPendingFlights(): Promise<AdminFlight[]> {
  const res = await http.get(endpoints.flights.list, { params: { tab: "pending" } });
  const data = res.data as FlightDto[];
  return data.map(mapDtoToAdminFlight);
}

export async function adminApproveFlight(id: number): Promise<AdminFlight> {
  const res = await http.post(endpoints.admin.approve(id));
  return mapDtoToAdminFlight(res.data as FlightDto);
}

export async function adminRejectFlight(id: number, reason: string): Promise<AdminFlight> {
  const res = await http.post(endpoints.admin.reject(id), { reason });
  return mapDtoToAdminFlight(res.data as FlightDto);
}

export async function adminCancelFlight(id: number): Promise<AdminFlight> {
  const res = await http.post(endpoints.admin.cancel(id));
  return mapDtoToAdminFlight(res.data as FlightDto);
}

export async function adminDeleteFlight(id: number): Promise<{ status: string; id: number }> {
  const res = await http.delete(endpoints.admin.delete(id));
  return res.data as { status: string; id: number };
}

export type ReportTab = "planned" | "in_progress" | "history";

export async function adminSendFlightsReport(tab: ReportTab): Promise<{
  status: string;
  tab: string;
  filename: string;
  count: number;
}> {
  const res = await http.post(endpoints.admin.report, null, { params: { tab } });
  return res.data as any;
}
