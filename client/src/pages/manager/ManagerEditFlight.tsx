import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import type { Flight } from "../../types/flights";
import { getFlights, setFlights } from "../../mocks/flightStore";

export default function ManagerEditFlightPage() {
  const { id } = useParams();
  const flightId = Number(id);
  const nav = useNavigate();
  const { user, hasRole } = useAuth();

  const flight = useMemo<Flight | undefined>(
    () => getFlights().find((f) => f.id === flightId),
    [flightId]
  );

  const [name, setName] = useState(flight?.name ?? "");
  const [price, setPrice] = useState<number>(flight?.price ?? 100);

  if (!user || !hasRole(["MANAGER"])) return <div style={{ padding: 16 }}>Nemaš pristup.</div>;
  if (!flight) return <div style={{ padding: 16 }}>Let nije pronađen.</div>;

  const save = (e: React.FormEvent) => {
    e.preventDefault();

    const all = getFlights();
    setFlights(
      all.map((f) =>
        f.id === flightId
          ? { ...f, name: name.trim(), price, status: "PENDING", rejectionReason: undefined }
          : f
      )
    );

    alert("Izmenjeno i poslato na odobrenje ✅ (mock)");
    nav("/manager/flights");
  };

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: 16 }}>
      <h2>Izmena leta</h2>

      {flight.rejectionReason && (
        <div style={{ background: "#fff3f3", border: "1px solid #ffd0d0", padding: 10, borderRadius: 10 }}>
          <b>Razlog odbijanja:</b> {flight.rejectionReason}
        </div>
      )}

      <form onSubmit={save} style={{ display: "grid", gap: 10, marginTop: 14 }}>
        <div>
          <label>Naziv leta</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ padding: 10, borderRadius: 10, border: "1px solid #ddd", width: "100%" }}
          />
        </div>

        <div>
          <label>Cijena (€)</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            style={{ padding: 10, borderRadius: 10, border: "1px solid #ddd", width: "100%" }}
          />
        </div>

        <button
          style={{ padding: 10, borderRadius: 10, border: "1px solid #ddd", cursor: "pointer" }}
        >
          Sačuvaj i pošalji
        </button>
      </form>
    </div>
  );
}
