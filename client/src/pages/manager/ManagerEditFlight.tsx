import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import { Label } from "../../components/common/Label";
import { fetchManagerFlightById, updateManagerRejectedFlight, type ManagerFlight } from "../../api/managerFlights";

function errMsg(e: any): string {
  const d = e?.response?.data;
  if (typeof d === "string") return d;
  if (d?.error) return String(d.error);
  if (d?.message) return String(d.message);
  return e?.message ? String(e.message) : "Greška";
}

export default function ManagerEditFlightPage() {
  const { id } = useParams();
  const flightId = Number(id);
  const nav = useNavigate();
  const { user, hasRole } = useAuth();

  const [flight, setFlight] = useState<ManagerFlight | null>(null);
  const [name, setName] = useState("");
  const [price, setPrice] = useState<number>(100);
  const [err, setErr] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchManagerFlightById(flightId)
      .then((f) => {
        setFlight(f);
        setName(f.name ?? "");
        setPrice(Number(f.price ?? 0));
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

  if (loading) return <div className="p-6 text-sm text-gray-600">Učitavanje...</div>;
  if (!flight) return <div className="p-6 text-sm text-gray-600">Let nije pronađen.</div>;

  const save = async (e: FormEvent) => {
    e.preventDefault();
    setErr(null);

    if (!name.trim()) return setErr("Naziv leta je obavezan.");
    if (price <= 0) return setErr("Cena mora biti > 0.");

    setSaving(true);
    try {
      await updateManagerRejectedFlight(flightId, { name: name.trim(), price });
      alert("Izmenjeno i poslato na odobrenje ✅");
      nav("/manager/flights");
    } catch (e) {
      setErr(errMsg(e));
    } finally {
      setSaving(false);
    }
  };

  if (flight.approvalStatus !== "REJECTED") {
    return <div className="p-6 text-sm text-gray-600">Let nije odbijen (nema izmena).</div>;
  }
  
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
            <div className="text-xs tracking-widest uppercase text-white/80">DRS Fly • Menadžer</div>
            <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight">Izmena leta</h1>
            <p className="mt-2 text-sm text-white/85 max-w-2xl">Izmeni podatke i pošalji ponovo na odobrenje.</p>
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
              <div className="grid gap-2">
                <Label>Naziv leta</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} className="rounded-2xl" />
              </div>

              <div className="grid gap-2">
                <Label>Cena (€)</Label>
                <Input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} className="rounded-2xl" />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="secondary" className="rounded-2xl" onClick={() => nav("/flights/mine")}>
                  Nazad
                </Button>
                <Button type="submit" variant="primary" className="rounded-2xl px-5" disabled={saving}>
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
