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

    setFlights((prev) => prev.map((f) => (f.id === flightId ? { ...f, status: "CANCELLED" } : f)));
  };
  const handleDelete = (flightId: number) => {
    const ok = window.confirm("Obrisati let? Ova akcija je trajna (mock).");
    if (!ok) return;
    setFlights((prev) => prev.filter((f) => f.id !== flightId));
  };


  return (
    <div className="min-h-[calc(100vh-56px)] px-4 py-10">
      <div className="mx-auto w-full max-w-6xl">
        <div className="relative overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-lg">
          <div className="absolute inset-0 bg-gradient-to-br from-sky-600 via-blue-700 to-indigo-800" />
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, rgba(255,255,255,.35) 1px, transparent 0)",
              backgroundSize: "18px 18px",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-sky-700/70 via-blue-800/65 to-indigo-900/70" />

          <div className="relative z-10 p-6 sm:p-10 text-white">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="text-xs tracking-widest uppercase text-white/80">
                  DRS Fly • Terminal
                </div>
                <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight">
                  Letovi
                </h1>
                <p className="mt-2 text-sm text-white/85 max-w-2xl">
                  Pretraži, filtriraj i rezerviši letove. Tvoj “boarding pass” je na klik.
                </p>
              </div>

              <div className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 backdrop-blur">
                <div className="text-lg font-extrabold tracking-tight text-white">
                  {active === "PLANNED"
                    ? "Letovi koji nisu počeli"
                    : active === "IN_PROGRESS"
                      ? "Letovi u toku"
                      : "Završeni / Otkazani letovi"}
                </div>

              </div>

            </div>
          </div>
        </div>

        <div className="mt-6 rounded-3xl border border-gray-200 bg-white shadow-sm">
          <div className="p-4 sm:p-6">
            <div className="flex flex-wrap gap-2">
              {tabs.map((t) => (
                <Button
                  key={t.key}
                  variant={active === t.key ? "primary" : "secondary"}
                  onClick={() => setActive(t.key as any)}
                  className="rounded-2xl"
                >
                  {t.label}
                </Button>
              ))}
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="md:col-span-2">
                <SearchBar value={search} onChange={setSearch} />
              </div>
              <AirlineSelect airlines={airlines} value={airlineId} onChange={setAirlineId} />
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-600">
              <div>
                Prikaz: <b>{flights.length}</b> let(ova)
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex h-2 w-2 rounded-full bg-sky-500" />
                boarding-pass prikaz
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="mt-4 text-sm text-gray-600">Učitavanje…</div>
        ) : (
          <div className="mt-4 grid gap-3">
            {flights.map((f) => (
              <FlightCard
                key={f.id}
                flight={f}
                onBuy={handleBuy}
                onCancel={handleCancel}
                onDelete={handleDelete}
                isBuying={processingFlightIds.includes(f.id)}
              />

            ))}

            {flights.length === 0 && (
              <div className="rounded-2xl border border-gray-200 bg-white p-6 text-sm text-gray-600">
                Nema letova za filter.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
