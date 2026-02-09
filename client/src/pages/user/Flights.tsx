import { useEffect, useMemo, useState } from "react";
import type { Airline } from "../../types/airlines";
import type { Flight } from "../../types/flights";
import { fetchAirlines } from "../../api/airlines";
import { fetchFlights } from "../../api/flights";
import { buyTicket, myTickets } from "../../api/tickets";
import { SearchBar } from "../../components/flights/SearchBar";
import { AirlineSelect } from "../../components/flights/AirlineSelect";
import { FlightCard } from "../../components/flights/FlightCard";
import { useAuth } from "../../auth/AuthContext";
import { Button } from "../../components/common/Button";

type Tab = "PLANNED" | "IN_PROGRESS" | "DONE";

const tabs: { key: Tab; label: string }[] = [
  { key: "PLANNED", label: "Nisu počeli" },
  { key: "IN_PROGRESS", label: "U toku" },
  { key: "DONE", label: "Završeni / Otkazani" },
];



export default function FlightsPage() {
  const [active, setActive] = useState<Tab>("PLANNED");
  const [airlines, setAirlines] = useState<Airline[]>([]);
  const [flights, setFlights] = useState<Flight[]>([]);
  const [search, setSearch] = useState("");
  const [airlineId, setAirlineId] = useState("");
  const [loading, setLoading] = useState(false);

  const { user, hasRole } = useAuth();
  const [processingFlightIds, setProcessingFlightIds] = useState<number[]>([]);

  const [purchasedFlightIds, setPurchasedFlightIds] = useState<number[]>([]);
  const purchasedSet = useMemo(() => new Set(purchasedFlightIds), [purchasedFlightIds]);

  const [notice, setNotice] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const showError = (text: string) => {
    setNotice({ type: "error", text });
    setTimeout(() => setNotice(null), 3500);
  };

  const showSuccess = (text: string) => {
    setNotice({ type: "success", text });
    setTimeout(() => setNotice(null), 2500);
  };


  const refreshMyTickets = async () => {
    if (!user || !hasRole(["KORISNIK"])) {
      setPurchasedFlightIds([]);
      return;
    }

    try {
      const t = await myTickets();
      const ids = t
        .map((x: any) => x.flightId ?? x.flight_id ?? x.flight?.id)
        .filter((v: any) => typeof v === "number" && v > 0) as number[];
      setPurchasedFlightIds(ids);
    } catch {
      setPurchasedFlightIds([]);
    }
  };

  useEffect(() => {
    fetchAirlines().then(setAirlines);
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchFlights({ tab: active, search, airlineId })
      .then(setFlights)
      .finally(() => setLoading(false));
  }, [active, search, airlineId]);

  useEffect(() => {
    refreshMyTickets();
  }, [user?.id, user?.role]);

  const handleBuy = async (flightId: number) => {
    if (!user || !hasRole(["KORISNIK"])) return;

    setProcessingFlightIds((prev) => [...prev, flightId]);

    try {
      await buyTicket(flightId);
      showSuccess("✅ Kupovina je pokrenuta… (obrada traje par sekundi)");
      setTimeout(refreshMyTickets, 2500);
    } catch (e: any) {
      const d = e?.response?.data;

      const msg =
        typeof d === "string"
          ? d
          : d?.error ?? d?.message ?? "Neuspešna kupovina.";

      if (/balance|sredstav|insufficient/i.test(msg)) {
        showError("❌ Nemate dovoljno sredstava za kupovinu karte.");
      } else {
        showError(`❌ ${msg}`);
      }
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
        <div className="mt-6 rounded-3xl border border-gray-200 bg-white shadow-sm">
          <div className="p-4 sm:p-6">
            <div className="flex flex-wrap gap-2">
              {tabs.map((t) => (
                <Button
                  key={t.key}
                  variant={active === t.key ? "primary" : "secondary"}
                  onClick={() => setActive(t.key)}
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
          </div>
        </div>
        {notice && (
          <div
            className={[
              "mt-4 rounded-2xl border px-4 py-3 text-sm font-medium",
              notice.type === "error"
                ? "border-rose-200 bg-rose-50 text-rose-700"
                : "border-emerald-200 bg-emerald-50 text-emerald-700",
            ].join(" ")}
          >
            <div className="flex items-start justify-between gap-3">
              <div>{notice.text}</div>
              <button
                type="button"
                onClick={() => setNotice(null)}
                className="rounded-lg px-2 py-1 hover:bg-black/5"
                aria-label="Close"
              >
                ✖
              </button>
            </div>
          </div>
        )}
        {loading ? (
          <div className="mt-4 text-sm text-gray-600">Učitavanje…</div>
        ) : (
          <div className="mt-4 grid gap-3">
            {flights.map((f) => {
              const canRate =
                !!user &&
                hasRole(["KORISNIK"]) &&
                ["FINISHED", "DONE", "COMPLETED"].includes(String(f.status)) &&
                purchasedSet.has(f.id);


              return (
                <FlightCard
                  key={f.id}
                  flight={f}
                  onBuy={handleBuy}
                  onCancel={handleCancel}
                  onDelete={handleDelete}
                  isBuying={processingFlightIds.includes(f.id)}
                  canRate={canRate}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
