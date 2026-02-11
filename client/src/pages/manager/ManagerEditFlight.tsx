import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { Airline } from "../../types/airlines";
import { useAuth } from "../../auth/AuthContext";
import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import { Label } from "../../components/common/Label";
import { Select } from "../../components/common/Select";
import {
  fetchAirlinesForManager,
  fetchManagerFlightById,
  updateManagerRejectedFlight,
  type ManagerFlight,
} from "../../api/managerFlights";

function errMsg(e: any): string {
  const d = e?.response?.data;
  if (typeof d === "string") return d;
  if (d?.error) return String(d.error);
  if (d?.message) return String(d.message);
  return e?.message ? String(e.message) : "Greška";
}

function toDatetimeLocal(value?: string): string {
  if (!value) return "";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const mi = pad(d.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}

export default function ManagerEditFlightPage() {
  const { id } = useParams();
  const flightId = Number(id);
  const nav = useNavigate();
  const { user, hasRole } = useAuth();

  const [airlines, setAirlines] = useState<Airline[]>([]);

  const [flight, setFlight] = useState<ManagerFlight | null>(null);

  const [name, setName] = useState("");
  const [airlineId, setAirlineId] = useState<number>(1);
  const [distanceKm, setDistanceKm] = useState<number>(1000);
  const [durationMinutes, setDurationMinutes] = useState<number>(60);
  const [departureTime, setDepartureTime] = useState<string>("");
  const [from, setFrom] = useState("BEG");
  const [to, setTo] = useState(""); 
  const [price, setPrice] = useState<number>(120);

  const [err, setErr] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAirlinesForManager()
      .then((a) => setAirlines(a))
      .catch(() => {
      });
  }, []);

  useEffect(() => {
    setLoading(true);
    setErr(null);

    fetchManagerFlightById(flightId)
      .then((f) => {
        setFlight(f);

        setName(f.name ?? "");
        setPrice(Number(f.price ?? 0));

        const cid =
          (f as any).company_id ??
          (f as any).companyId ??
          (f as any).company?.id;
        if (cid) setAirlineId(Number(cid));

        
        setDistanceKm(
          Number((f as any).distance_km ?? (f as any).distanceKm ?? 0),
        );

        
        const durMinRaw =
          (f as any).duration_minutes ?? (f as any).durationMinutes;
        const durSecRaw = (f as any).duration_sec ?? (f as any).durationSec;

        let minutes = 60;
        if (durMinRaw != null) {
          minutes = Number(durMinRaw);
        } else if (durSecRaw != null) {
          minutes = Number(durSecRaw) / 60;
        }
       
        if (Number.isFinite(minutes) && minutes > 0)
          setDurationMinutes(minutes);

        setDepartureTime(
          toDatetimeLocal(
            (f as any).departure_time ?? (f as any).departureTime ?? "",
          ),
        );

        const fromVal =
          (f as any).from_airport ??
          (f as any).fromAirport ??
          (f as any).from ??
          "BEG";

        const toVal =
          (f as any).to_airport ?? (f as any).toAirport ?? (f as any).to ?? "";

        setFrom(String(fromVal).trim().toUpperCase());
        setTo(String(toVal).trim().toUpperCase());
      })
      .catch((e) => setErr(errMsg(e)))
      .finally(() => setLoading(false));
  }, [flightId]);

  if (!user || !hasRole(["MENADZER"])) {
    return (
      <div className="min-h-[calc(100vh-56px)] px-4 py-10">
        <div className="mx-auto max-w-3xl rounded-3xl border border-gray-200 bg-white p-6 text-sm text-gray-700">
          Nemaš pristup.
        </div>
      </div>
    );
  }

  if (loading)
    return <div className="p-6 text-sm text-gray-600">Učitavanje...</div>;
  if (!flight)
    return <div className="p-6 text-sm text-gray-600">Let nije pronađen.</div>;

  if (flight.approvalStatus !== "REJECTED") {
    return (
      <div className="p-6 text-sm text-gray-600">
        Let nije odbijen (nema izmena).
      </div>
    );
  }

  const save = async (e: FormEvent) => {
    e.preventDefault();
    setErr(null);

    if (!name.trim()) return setErr("Naziv leta je obavezan.");
    if (!departureTime) return setErr("Vreme polaska je obavezno.");
    if (!from.trim() || !to.trim()) return setErr("Aerodromi su obavezni.");
    if (price <= 0) return setErr("Cena mora biti > 0.");
    if (distanceKm <= 0) return setErr("Dužina mora biti > 0.");
    if (durationMinutes <= 0) return setErr("Trajanje mora biti > 0.");

    setSaving(true);
    try {
      await updateManagerRejectedFlight(flightId, {
        name: name.trim(),
        company_id: airlineId,
        distance_km: distanceKm,
        duration_sec: Math.max(
          1,
          Math.round(Number(durationMinutes.toFixed(2)) * 60),
        ),
        departure_time: new Date(departureTime).toISOString(),
        from_airport: from.trim().toUpperCase(),
        to_airport: to.trim().toUpperCase(),
        price,
      });

      alert("Izmenjeno i poslato na odobrenje ✅");
      nav("/flights/mine");
    } catch (e) {
      setErr(errMsg(e));
    } finally {
      setSaving(false);
    }
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
            <div className="text-xs tracking-widest uppercase text-white/80">
              DRS Fly • Menadžer
            </div>
            <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight">
              Izmena leta
            </h1>
            <p className="mt-2 text-sm text-white/85 max-w-2xl">
              Izmeni sva polja i pošalji ponovo administratoru na odobrenje.
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-3xl border border-gray-200 bg-white shadow-sm">
          <div className="p-4 sm:p-6">
            {flight.rejectionReason && (
              <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                <b>Razlog odbijanja:</b> {flight.rejectionReason}
              </div>
            )}

            {err && (
              <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {err}
              </div>
            )}

            <form onSubmit={save} className="grid gap-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 grid gap-2">
                  <Label>Naziv leta</Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="rounded-2xl"
                  />
                </div>

                <div className="grid gap-2">
                  <Label>Aviokompanija</Label>
                  <Select
                    value={airlineId}
                    onChange={(e) => setAirlineId(Number(e.target.value))}
                    className="rounded-2xl"
                  >
                    {airlines.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Od (aerodrom)</Label>
                  <Input
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                    className="rounded-2xl uppercase"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Do (aerodrom)</Label>
                  <Input
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    className="rounded-2xl uppercase"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label>Datum i vreme poletanja</Label>
                <Input
                  type="datetime-local"
                  value={departureTime}
                  onChange={(e) => setDepartureTime(e.target.value)}
                  className="rounded-2xl"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label>Dužina leta (km)</Label>
                  <Input
                    type="number"
                    value={distanceKm}
                    onChange={(e) => setDistanceKm(Number(e.target.value))}
                    className="rounded-2xl"
                  />
                </div>

                <div className="grid gap-2">
                  <Label>Trajanje leta (min)</Label>
                  <Input
                    type="number"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="rounded-2xl"
                  />
                </div>

                <div className="grid gap-2">
                  <Label>Cena (€)</Label>
                  <Input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="rounded-2xl"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  className="rounded-2xl"
                  onClick={() => nav("/flights/mine")}
                >
                  Nazad
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  className="rounded-2xl px-5"
                  disabled={saving}
                >
                  {saving ? "Čuvam..." : "Sačuvaj i pošalji"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
