import type { Rating } from "../types/ratings";

let ratings: Rating[] = [];
let nextId = 1;

export function listAllRatings(): Promise<Rating[]> {
  return Promise.resolve([...ratings].sort((a, b) => b.id - a.id));
}

export function getMyRatingForFlight(userEmail: string, flightId: number): Promise<Rating | null> {
  const r = ratings.find((x) => x.userEmail === userEmail && x.flightId === flightId) ?? null;
  return Promise.resolve(r);
}

export function submitRating(userEmail: string, flightId: number, value: number): Promise<Rating> {
  const v = Math.max(1, Math.min(5, value));

  // 1 rating po korisniku po letu
  ratings = ratings.filter((x) => !(x.userEmail === userEmail && x.flightId === flightId));

  const r: Rating = {
    id: nextId++,
    flightId,
    userEmail,
    rating: v,
    createdAt: new Date().toISOString(),
  };
  ratings = [r, ...ratings];
  return Promise.resolve(r);
}
