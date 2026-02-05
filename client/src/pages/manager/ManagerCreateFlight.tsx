import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { listAirlines } from "../../mocks/handlers";
import type { Airline, Flight } from "../../types/flights";
import { addFlight, getFlights } from "../../mocks/flightStore";
import { useAuth } from "../../auth/AuthContext";
import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import { Label } from "../../components/common/Label";
import { Select } from "../../components/common/Select";

export default function ManagerCreateFlightPage() {
  const nav = useNavigate();
  const { user, hasRole } = useAuth();

  const [airlines, setAirlines] = useState<Airline[]>([]);
  const [name, setName] = useState("");
  const [airlineId, setAirlineId] = useState<number>(1);
  const [distanceKm, setDistanceKm] = useState<number>(1000);
  const [durationMinutes, setDurationMinutes] = useState<number>(60);
  const [departureTime, setDepartureTime] = useState<string>("");
  const [from, setFrom] = useState("BEG");
  const [to, setTo] = useState("CDG");
  const [price, setPrice] = useState<number>(120);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    listAirlines().then((a) => {
      setAirlines(a);
      if (a[0]) setAirlineId(a[0].id);
    });
  }, []);

  if (!user || !hasRole(["MENADZER"])) {
    return (
      <div className="min-h-[calc(100vh-56px)] px-4 py-10">
        <div className="mx-auto max-w-3xl rounded-3xl border border-gray-200 bg-white p-6 text-sm text-gray-700">
          Nemaš pristup ovoj stranici.
        </div>
      </div>
    );
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);

    if (!name.trim()) return setErr("Naziv leta je obavezan.");
    if (!departureTime) return setErr("Vreme polaska je obavezno.");
    if (!from.trim() || !to.trim()) return setErr("Aerodromi su obavezni.");
    if (price <= 0) return setErr("Cena mora biti > 0.");

    const airlineName = airlines.find((x) => x.id === airlineId)?.name ?? "N/A";
    const newId = Math.max(0, ...getFlights().map((f) => f.id)) + 1;

    const flight: Flight = {
      id: newId,
      name: name.trim(),
      airlineId,
      airlineName,
      distanceKm,
      durationMinutes,
      departureTime: new Date(departureTime).toISOString(),
      from: from.trim().toUpperCase(),
      to: to.trim().toUpperCase(),
      price,
      status: "PENDING",
      createdBy: user.email as any,
    } as any;

    addFlight(flight);
    alert("Let poslat administratoru na odobrenje ✅ (mock)");
    nav("/flights");
  };

  return (
    <div className="min-h-[calc(100vh-56px)] px-4 py-10">
      <div className="mx-auto w-full max-w-6xl">
        {/* Hero */}
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
              Novi let
            </h1>
            <p className="mt-2 text-sm text-white/85 max-w-2xl">
              Kreiraj let i pošalji ga administratoru na odobrenje.
            </p>
          </div>
        </div>

        {/* Form Card */}
        <div className="mt-6 rounded-3xl border border-gray-200 bg-white shadow-sm">
          <form onSubmit={submit} className="p-4 sm:p-6 grid gap-4">
            {/* Top row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 grid gap-2">
                <Label>Naziv leta</Label>
                <Input
                  placeholder="npr. BEG → CDG / DRS101"
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

            {/* Route */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Od (aerodrom)</Label>
                <Input
                  placeholder="npr. BEG"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  className="rounded-2xl uppercase"
                />
              </div>
              <div className="grid gap-2">
                <Label>Do (aerodrom)</Label>
                <Input
                  placeholder="npr. CDG"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="rounded-2xl uppercase"
                />
              </div>
            </div>

            {/* Departure */}
            <div className="grid gap-2">
              <Label>Datum i vreme poletanja</Label>
              <Input
                type="datetime-local"
                value={departureTime}
                onChange={(e) => setDepartureTime(e.target.value)}
                className="rounded-2xl"
              />
              <div className="text-xs text-gray-500">
                Savet: za demo stavi polazak uskoro da bi testirao statuse.
              </div>
            </div>

            {/* Numbers */}
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
                <Label>Cena karte (€)</Label>
                <Input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="rounded-2xl"
                />
              </div>
            </div>

            {err && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {err}
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="secondary"
                className="rounded-2xl"
                onClick={() => nav("/flights")}
              >
                Odustani
              </Button>
              <Button type="submit" variant="primary" className="rounded-2xl px-5">
                Pošalji na odobrenje
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
