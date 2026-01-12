import type { Flight } from "../types/flights";
import { mockFlights as initial } from "./db";

let flights: Flight[] = [...initial];
const listeners = new Set<() => void>();

export function getFlights(): Flight[] {
  return flights;
}

export function setFlights(next: Flight[]) {
  flights = next;
  listeners.forEach((l) => l());
}

export function addFlight(f: Flight) {
  flights = [f, ...flights];
  listeners.forEach((l) => l());
}

export function subscribeFlights(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

