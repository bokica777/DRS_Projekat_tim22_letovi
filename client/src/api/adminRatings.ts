import { http } from "./https";
import { endpoints } from "./endpoints";

export type RatingDto = {
  id: number;
  flight_id?: number;
  user_email?: string;
  rating?: number | string;
  created_at?: string;

  flightId?: number;
  userEmail?: string;
  createdAt?: string;

  // neke varijante koje backend često vraća
  score?: number | string;
  value?: number | string;
  stars?: number | string;
  rating_value?: number | string;

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

function toNumberSafe(x: any, fallback = 0): number {
  const n = Number(x);
  return Number.isFinite(n) ? n : fallback;
}

function mapRatingDto(d: any): AdminRating {
  const flightId =
    d?.flight?.id ??
    d?.flightId ??
    d?.flight_id ??
    d?.flightID ??
    d?.flight_id_fk ??
    0;

  const ratingRaw =
    d?.rating ??
    d?.rating_value ??
    d?.score ??
    d?.value ??
    d?.stars ??
    d?.Rating;

  return {
    id: toNumberSafe(d?.id, 0),
    flightId: toNumberSafe(flightId, 0),
    flightName: d?.flight?.name ?? d?.flightName ?? undefined,
    userEmail: d?.userEmail ?? d?.user_email ?? d?.email ?? "",
    rating: toNumberSafe(ratingRaw, 0),
    createdAt: d?.createdAt ?? d?.created_at ?? new Date().toISOString(),
  };
}

export async function fetchAdminRatings(): Promise<AdminRating[]> {
  const res = await http.get(endpoints.ratings.admin);

  const raw = res.data as any;

  const arr = Array.isArray(raw)
    ? raw
    : Array.isArray(raw?.items)
      ? raw.items
      : Array.isArray(raw?.ratings)
        ? raw.ratings
        : Array.isArray(raw?.data)
          ? raw.data
          : [];

  return arr.map(mapRatingDto);
}

export async function fetchFlightNameById(flightId: number): Promise<string> {
  const res = await http.get(endpoints.flights.byId(flightId));
  const dto = res.data as { id: number; name: string };
  return dto?.name ?? `Let #${flightId}`;
}
