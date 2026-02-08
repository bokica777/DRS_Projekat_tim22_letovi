import { http } from "./https";
import { endpoints } from "./endpoints";

export type RatingDto = {
  id: number;
  user_id: string;
  flight_id: number;
  value: number;
  created_at: string;
};

export type MyRatingItem = {
  flight_id: number;
  value: number;
  created_at: string;
};

export async function fetchMyRatings(): Promise<MyRatingItem[]> {
  const res = await http.get(endpoints.ratings.my);
  return res.data;
}

export async function createRating(flightId: number, value: number): Promise<RatingDto> {
  const res = await http.post(endpoints.ratings.create, {
    flight_id: flightId,
    value,
  });
  return res.data;
}
