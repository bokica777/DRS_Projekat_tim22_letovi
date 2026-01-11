import type { Flight } from "../types/flights";

type Props = {
  flight: Flight;
};

export function FlightCard({ flight }: Props) {
  return (
    <div style={{ border: "1px solid #eee", borderRadius: 14, padding: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
        <div>
          <div style={{ fontWeight: 700 }}>{flight.name}</div>
          <div style={{ color: "#555" }}>{flight.airlineName}</div>
          <div style={{ color: "#777", marginTop: 6 }}>
            {flight.from} → {flight.to} • {flight.distanceKm} km • {flight.durationMinutes} min
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontWeight: 700 }}>{flight.price} €</div>
          <div style={{ fontSize: 12, color: "#666" }}>{flight.status}</div>
        </div>
      </div>
    </div>
  );
}
