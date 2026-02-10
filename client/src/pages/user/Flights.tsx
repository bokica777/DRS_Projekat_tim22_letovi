import { useEffect, useMemo, useState } from "react";
import type { Airline } from "../../types/airlines";
import type { Flight } from "../../types/flights";
import { fetchAirlines } from "../../api/airlines";
import { fetchFlights } from "../../api/flights";
import { buyTicket, myTickets } from "../../api/tickets";
import { adminCancelFlight, adminDeleteFlight } from "../../api/adminFlights";
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

function errMsg(e: any): string {
  const d = e?.response?.data;
  if (typeof d === "string") return d;
  if (d?.error) return String(d.error);
  if (d?.message) return String(d.message);
  return e?.message ? String(e.message) : "Greška";
}

export default function FlightsPage() {
  const [active, setActive] = useState<Tab>("PLANNED");
  const [airlines, setAirlines] = useState<Airline[]>([]);
  const [flights, setFlights] = useState<Flight[]>([]);
  const [search, setSearch] = useState("");
  const [airlineId, setAirlineId] = useState("");
  const [loading, setLoading] = useState(false);

  const { user, hasRole, refreshMe } = useAuth();
  const [processingFlightIds, setProcessingFlightIds] = useState<number[]>([]);
  const [adminActionIds, setAdminActionIds] = useState<number[]>([]);

  const [purchasedFlightIds, setPurchasedFlightIds] = useState<number[]>([]);
  const purchasedSet = useMemo(
    () => new Set(purchasedFlightIds),
    [purchasedFlightIds],
  );

  const [notice, setNotice] = useState<{
    type: "error" | "success";
    text: string;
  } | null>(null);

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

  const refreshFlights = async () => {
    setLoading(true);
    try {
      const data = await fetchFlights({ tab: active, search, airlineId });
      setFlights(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAirlines().then(setAirlines);
  }, []);

  useEffect(() => {
    refreshFlights();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, search, airlineId]);

  useEffect(() => {
    refreshMyTickets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, (user as any)?.role]);

  const handleBuy = async (flightId: number) => {
  if (!user || !hasRole(["KORISNIK", "MENADZER"])) return;

  setProcessingFlightIds((prev) => [...prev, flightId]);

  try {
    await buyTicket(flightId);
    await refreshMe();

    showSuccess("✅ Kupovina je pokrenuta… (obrada traje par sekundi)");
    setTimeout(refreshMyTickets, 2500);
  } catch (e: any) {
    const msg = errMsg(e);

    if (/balance|sredstav|insufficient/i.test(msg)) {
      showError("❌ Nemate dovoljno sredstava za kupovinu karte.");
    } else {
      showError(`❌ ${msg}`);
    }
  } finally {
    setProcessingFlightIds((prev) => prev.filter((id) => id !== flightId));
  }
};


  const handleCancel = async (flightId: number) => {
    if (!user || !hasRole(["ADMIN"])) return;

    const ok = window.confirm("Da li ste sigurni da želite da otkažete let?");
    if (!ok) return;

    setAdminActionIds((p) => [...p, flightId]);
    try {
      await adminCancelFlight(flightId);
      showSuccess("✅ Let je otkazan.");

      // Ukloni iz trenutne liste (PLANNED), a zatim prebaci na DONE da se vidi među otkazanim
      setFlights((prev) => prev.filter((f) => f.id !== flightId));

      // Prebaci admina na tab gde se vide otkazani + auto refresh preko useEffect
      if (active !== "DONE") setActive("DONE");
      else await refreshFlights();
    } catch (e: any) {
      showError(`❌ ${errMsg(e)}`);
    } finally {
      setAdminActionIds((p) => p.filter((id) => id !== flightId));
    }
  };

  const handleDelete = async (flightId: number) => {
    if (!user || !hasRole(["ADMIN"])) return;

    const ok = window.confirm("Obrisati let? Ova akcija je trajna.");
    if (!ok) return;

    setAdminActionIds((p) => [...p, flightId]);
    try {
      await adminDeleteFlight(flightId);
      showSuccess("✅ Let je obrisan.");

      // odmah nestaje sa UI
      setFlights((prev) => prev.filter((f) => f.id !== flightId));
    } catch (e: any) {
      showError(`❌ ${errMsg(e)}`);
    } finally {
      setAdminActionIds((p) => p.filter((id) => id !== flightId));
    }
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
              <AirlineSelect
                airlines={airlines}
                value={airlineId}
                onChange={setAirlineId}
              />
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

              const isBuying = processingFlightIds.includes(f.id);
              const isAdminBusy = adminActionIds.includes(f.id);

              return (
                <div key={f.id} className={isAdminBusy ? "opacity-80" : ""}>
                  <FlightCard
                    flight={f}
                    onBuy={handleBuy}
                    onCancel={handleCancel}
                    onDelete={handleDelete}
                    isBuying={isBuying}
                    canRate={canRate}
                  />
                </div>
              );
            })}

            {flights.length === 0 && (
              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6 text-sm text-gray-600">
                Nema letova za prikaz u ovom tabu.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
