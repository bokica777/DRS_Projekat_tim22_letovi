import { http } from "./https";
import { endpoints } from "./endpoints";

export type RatingDto = {
  id: number;
  flight_id?: number;
  user_email?: string;
  rating: number;
  created_at?: string;

  flightId?: number;
  userEmail?: string;
  createdAt?: string;

  flight?: { id: number; name: string } | null;
};

export type AdminRating = {
  id: number;
  flightId: number;
  flightName?: string;
  userEmail: string;
  rating: number;
  createdAt: string;
};

function mapRatingDto(d: RatingDto): AdminRating {
  const flightId = d.flight?.id ?? d.flightId ?? d.flight_id ?? 0;

  return {
    id: d.id,
    flightId,
    flightName: d.flight?.name ?? undefined,
    userEmail: d.userEmail ?? d.user_email ?? "",
    rating: Number(d.rating),
    createdAt: d.createdAt ?? d.created_at ?? new Date().toISOString(),
  };
}

export async function fetchAdminRatings(): Promise<AdminRating[]> {
  const res = await http.get(endpoints.admin.ratings);
  const data = res.data as RatingDto[];
  return data.map(mapRatingDto);
}

export async function fetchFlightNameById(flightId: number): Promise<string> {
  const res = await http.get(endpoints.flights.byId(flightId));
  const dto = res.data as { id: number; name: string };
  return dto?.name ?? `Let #${flightId}`;
}
