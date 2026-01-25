import { useEffect, useState } from "react";
import type { Flight } from "../../types/flights";
import type { Purchase } from "../../types/purchases";
import { getMyPurchases } from "../../mocks/purchases";
import { mockFlights } from "../../mocks/db";

export default function MyTicketsPage() {
  const [items, setItems] = useState<Purchase[]>([]);

  const refresh = () => getMyPurchases().then(setItems);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 1000); // polling mock
    return () => clearInterval(id);
  }, []);

  const flightById = (id: number): Flight | undefined =>
    mockFlights.find((f) => f.id === id);

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 16 }}>
      <h2>Moje karte</h2>

      <div style={{ display: "grid", gap: 12, marginTop: 14 }}>
        {items.map((p) => {
          const fl = flightById(p.flightId);
          return (
            <div key={p.id} style={{ border: "1px solid #eee", borderRadius: 14, padding: 14 }}>
              <div style={{ fontWeight: 700 }}>
                {fl ? fl.name : `Let #${p.flightId}`}
              </div>
              <div style={{ color: "#666" }}>
                Status: <b>{p.status}</b>
              </div>
              <div style={{ color: "#777", fontSize: 12 }}>
                {new Date(p.createdAt).toLocaleString()}
              </div>
            </div>
          );
        })}
        {items.length === 0 && <div style={{ marginTop: 16 }}>Još nema kupljenih karata.</div>}
      </div>
    </div>
  );
}
