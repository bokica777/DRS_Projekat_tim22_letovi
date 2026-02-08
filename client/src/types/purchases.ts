import type { Flight } from "./flights";

export type Ticket = {
  id: number;
  flightId: number;
  createdAt: string;
  price: number;
  flight?: Flight;
};
