import { useEffect, useState } from "react";
import { listAllRatings } from "../mocks/ratings";
import type { Rating } from "../types/ratings";
import { mockFlights } from "../mocks/db";

export default function AdminRatingsPage() {
  const [items, setItems] = useState<Rating[]>([]);

  useEffect(() => {
    listAllRatings().then(setItems);
  }, []);

  const flightName = (id: number) => mockFlights.find((f) => f.id === id)?.name ?? `Let #${id}`;

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 16 }}>
      <h2>Ocene korisnika</h2>

      <div style={{ display: "grid", gap: 12, marginTop: 14 }}>
        {items.map((r) => (
          <div key={r.id} style={{ border: "1px solid #eee", borderRadius: 14, padding: 14 }}>
            <div style={{ fontWeight: 700 }}>{flightName(r.flightId)}</div>
            <div style={{ color: "#555" }}>
              {r.userEmail} • Ocena: <b>{r.rating}/5</b>
            </div>
            <div style={{ fontSize: 12, color: "#777" }}>
              {new Date(r.createdAt).toLocaleString()}
            </div>
          </div>
        ))}
        {items.length === 0 && <div style={{ marginTop: 16 }}>Nema ocena još.</div>}
      </div>
    </div>
  );
}
