import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import type { Flight } from "../../types/flights";
import { getFlights, subscribeFlights } from "../../mocks/flightStore";

export default function ManagerMyFlightsPage() {
  const { user, hasRole } = useAuth();
  const nav = useNavigate();
  const [items, setItems] = useState<Flight[]>([]);

  useEffect(() => {
    const sync = () => {
      const all = getFlights();
      const mine = all.filter(
        (f) =>
          (f.status === "PENDING" || f.status === "REJECTED") &&
          (!f.createdBy || f.createdBy === user?.email)
      );
      setItems(mine);
    };

    sync();
    return subscribeFlights(sync);
  }, [user?.email]);

  if (!user || !hasRole(["MANAGER"])) {
    return <div style={{ padding: 16 }}>Nemaš pristup.</div>;
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 16 }}>
      <h2>Moji letovi (MENADŽER)</h2>

      <div style={{ display: "grid", gap: 12, marginTop: 14 }}>
        {items.map((f) => (
          <div key={f.id} style={{ border: "1px solid #eee", borderRadius: 14, padding: 14 }}>
            <div style={{ fontWeight: 700 }}>{f.name}</div>
            <div style={{ color: "#666" }}>{f.airlineName}</div>
            <div style={{ fontSize: 12, color: "#777" }}>
              Status: <b>{f.status}</b>
            </div>

            {f.status === "REJECTED" && f.rejectionReason && (
              <div style={{ fontSize: 12, color: "crimson", marginTop: 6 }}>
                Razlog: {f.rejectionReason}
              </div>
            )}

            <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
              {f.status === "REJECTED" && (
                <button
                  onClick={() => nav(`/manager/flights/${f.id}/edit`)}
                  style={{ padding: "8px 12px", borderRadius: 10, border: "1px solid #ddd", cursor: "pointer" }}
                >
                  Izmeni i pošalji ponovo
                </button>
              )}
            </div>
          </div>
        ))}

        {items.length === 0 && <div>Nema pending/odbijenih letova.</div>}
      </div>
    </div>
  );
}
