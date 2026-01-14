import { useEffect, useMemo, useState } from "react";
import type { Airline, Flight, FlightStatus } from "../types/flights";
import { listAirlines, listFlights } from "../mocks/handlers";
import { SearchBar } from "../components/SearchBar";
import { AirlineSelect } from "../components/AirlineSelect";
import { FlightCard } from "../components/FlightCard";
import { createPurchase } from "../mocks/purchases";
import { useAuth } from "../auth/AuthContext";


const tabs: { key: FlightStatus | "DONE"; label: string }[] = [
  { key: "PLANNED", label: "Nisu počeli" },
  { key: "IN_PROGRESS", label: "U toku" },
  { key: "DONE", label: "Završeni / Otkazani" },
];



export default function FlightsPage() {
  const [active, setActive] = useState<FlightStatus | "DONE">("PLANNED");
  const [airlines, setAirlines] = useState<Airline[]>([]);
  const [flights, setFlights] = useState<Flight[]>([]);
  const [search, setSearch] = useState("");
  const [airlineId, setAirlineId] = useState("");
  const [loading, setLoading] = useState(false);
  const { user, hasRole } = useAuth();
  const [processingFlightIds, setProcessingFlightIds] = useState<number[]>([]);


  useEffect(() => {
    listAirlines().then(setAirlines);
  }, []);

useEffect(() => {
  setLoading(true);

  const statusToSend = active === "DONE" ? undefined : active;

  listFlights({ status: statusToSend as any, search, airlineId })
    .then((data) => {
      if (active === "DONE") {
        setFlights(data.filter((f) => f.status === "FINISHED" || f.status === "CANCELLED"));
      } else {
        setFlights(data);
      }
    })
    .finally(() => setLoading(false));
}, [active, search, airlineId]);


  const gridStyle = useMemo(
    () => ({
      display: "grid",
      gridTemplateColumns: "1fr",
      gap: 12,
      marginTop: 14,
    }),
    []
  );
  const handleBuy = async (flightId: number) => {
    if (!user || !hasRole(["KORISNIK"])) return;

    setProcessingFlightIds((prev) => [...prev, flightId]);
    try {
      await createPurchase(flightId);
      alert("Kupovina završena ✅ (mock)");
    } finally {
      setProcessingFlightIds((prev) => prev.filter((id) => id !== flightId));
    }
  };


  const handleCancel = (flightId: number) => {
    const ok = window.confirm("Da li ste sigurni da želite da otkažete let?");
    if (!ok) return;

    setFlights((prev) =>
      prev.map((f) =>
        f.id === flightId ? { ...f, status: "CANCELLED" } : f
      )
    );
  };


  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 16 }}>
      <h2>Letovi</h2>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActive(t.key)}
            style={{
              padding: "10px 14px",
              borderRadius: 999,
              border: "1px solid #ddd",
              background: active === t.key ? "#f3f3f3" : "white",
              cursor: "pointer",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: 12,
          marginTop: 14,
        }}
      >
        <SearchBar value={search} onChange={setSearch} />
        <AirlineSelect
          airlines={airlines}
          value={airlineId}
          onChange={setAirlineId}
        />
      </div>

      {loading ? (
        <div style={{ marginTop: 16 }}>Učitavanje…</div>
      ) : (
        <div style={gridStyle}>
          {flights.map((f) => (
            < FlightCard
              key={f.id}
              flight={f}
              onBuy={handleBuy}
              onCancel={handleCancel}
              isBuying={processingFlightIds.includes(f.id)}
            />

          ))}

          {flights.length === 0 && (
            <div style={{ marginTop: 16 }}>Nema letova za filter.</div>
          )}
        </div>
      )}
    </div>
  );
}
