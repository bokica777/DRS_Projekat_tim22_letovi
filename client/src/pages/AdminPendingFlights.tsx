import { useState } from "react";
import { mockFlights } from "../mocks/db";
import type { Flight } from "../types/flights";

export default function AdminPendingFlights() {
  const [flights, setFlights] = useState<Flight[]>(
    mockFlights.filter((f) => f.status === "PENDING")
  );

  const approve = (id: number) => {
    setFlights((prev) => prev.filter((f) => f.id !== id));
    alert("Let odobren ✅ (mock)");
  };

  const reject = (id: number) => {
    const reason = prompt("Razlog odbijanja:");
    if (!reason) return;

    setFlights((prev) => prev.filter((f) => f.id !== id));
    alert("Let odbijen ❌ (mock)");
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 16 }}>
      <h2>Letovi na čekanju</h2>

      <div style={{ display: "grid", gap: 12, marginTop: 14 }}>
        {flights.map((f) => (
          <div key={f.id} style={{ border: "1px solid #eee", borderRadius: 14, padding: 14 }}>
            <div style={{ fontWeight: 700 }}>{f.name}</div>
            <div style={{ color: "#666" }}>{f.airlineName}</div>

            <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
              <button onClick={() => approve(f.id)}>Odobri</button>
              <button onClick={() => reject(f.id)} style={{ color: "crimson" }}>
                Odbij
              </button>
            </div>
          </div>
        ))}
        {flights.length === 0 && <div>Nema letova na čekanju.</div>}
      </div>
    </div>
  );
}
