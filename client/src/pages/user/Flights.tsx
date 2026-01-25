import { useEffect, useState } from "react";
import type { Airline, Flight, FlightStatus } from "../../types/flights";
import { listAirlines, listFlights } from "../../mocks/handlers";
import { SearchBar } from "../../components/flights/SearchBar";
import { AirlineSelect } from "../../components/flights/AirlineSelect";
import { FlightCard } from "../../components/flights/FlightCard";
import { createPurchase } from "../../mocks/purchases";
import { useAuth } from "../../auth/AuthContext";
import { Button } from "../../components/common/Button";

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

  const handleBuy = async (flightId: number) => {
    if (!user || !hasRole(["USER"])) return;

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

    setFlights((prev) => prev.map((f) => (f.id === flightId ? { ...f, status: "CANCELLED" } : f)));
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <h2 className="text-2xl font-semibold tracking-tight">Letovi</h2>

      <div className="flex flex-wrap gap-2 mt-4">
        {tabs.map((t) => (
          <Button
            key={t.key}
            variant={active === t.key ? "primary" : "secondary"}
            onClick={() => setActive(t.key as any)}
          >
            {t.label}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
        <div className="md:col-span-2">
          <SearchBar value={search} onChange={setSearch} />
        </div>
        <AirlineSelect airlines={airlines} value={airlineId} onChange={setAirlineId} />
      </div>

      {loading ? (
        <div className="mt-4 text-sm text-gray-600">Učitavanje…</div>
      ) : (
        <div className="grid gap-3 mt-4">
          {flights.map((f) => (
            <FlightCard
              key={f.id}
              flight={f}
              onBuy={handleBuy}
              onCancel={handleCancel}
              isBuying={processingFlightIds.includes(f.id)}
            />
          ))}

          {flights.length === 0 && (
            <div className="mt-2 text-sm text-gray-600">Nema letova za filter.</div>
          )}
        </div>
      )}
    </div>
  );
}
