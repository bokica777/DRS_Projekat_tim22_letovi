import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import type { Flight } from "../../types/flights";
import { getFlights, setFlights } from "../../mocks/flightStore";
import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import { Label } from "../../components/common/Label";

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

  if (!user || !hasRole(["MENADZER"])) {
    return (
      <div className="min-h-[calc(100vh-56px)] px-4 py-10">
        <div className="mx-auto max-w-3xl rounded-3xl border border-gray-200 bg-white p-6 text-sm text-gray-700">
          Nemaš pristup.
        </div>
      </div>
    );
  }

  if (!flight) {
    return (
      <div className="min-h-[calc(100vh-56px)] px-4 py-10">
        <div className="mx-auto max-w-3xl rounded-3xl border border-gray-200 bg-white p-6 text-sm text-gray-700">
          Let nije pronađen.
        </div>
      </div>
    );
  }

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
              Izmeni podatke i pošalji ponovo na odobrenje.
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

            <form onSubmit={save} className="grid gap-4">
              <div className="grid gap-2">
                <Label>Naziv leta</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
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

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  className="rounded-2xl"
                  onClick={() => nav("/manager/flights")}
                >
                  Nazad
                </Button>
                <Button type="submit" variant="primary" className="rounded-2xl px-5">
                  Sačuvaj i pošalji
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
