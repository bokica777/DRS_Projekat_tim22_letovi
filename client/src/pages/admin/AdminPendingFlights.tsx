import { useEffect, useState } from "react";
import { Button } from "../../components/common/Button";
import { adminApproveFlight, adminRejectFlight, fetchPendingFlights, type AdminFlight } from "../../api/adminFlights";

function badge(status: AdminFlight["approvalStatus"]) {
  switch (status) {
    case "PENDING":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "APPROVED":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "REJECTED":
      return "bg-rose-50 text-rose-700 border-rose-200";
    default:
      return "bg-gray-50 text-gray-700 border-gray-200";
  }
}

function statusLabelSR(status: AdminFlight["approvalStatus"]) {
  switch (status) {
    case "PENDING":
      return "Na čekanju";
    case "APPROVED":
      return "Odobren";
    case "REJECTED":
      return "Odbijen";
    default:
      return status;
  }
}

function errMsg(e: any): string {
  const d = e?.response?.data;
  if (typeof d === "string") return d;
  if (d?.error) return String(d.error);
  if (d?.message) return String(d.message);
  return e?.message ? String(e.message) : "Greška";
}

export default function AdminPendingFlights() {
  const [flights, setFlights] = useState<AdminFlight[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const refresh = async () => {
    setErr(null);
    setLoading(true);
    try {
      const data = await fetchPendingFlights();
      setFlights(data);
    } catch (e) {
      setErr(errMsg(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const approve = async (id: number) => {
    setErr(null);
    try {
      await adminApproveFlight(id);
      setFlights((p) => p.filter((x) => x.id !== id));
      alert("Let odobren ✅");
    } catch (e) {
      setErr(errMsg(e));
    }
  };

  const reject = async (id: number) => {
    const reason = prompt("Razlog odbijanja:");
    if (!reason?.trim()) return;

    setErr(null);
    try {
      await adminRejectFlight(id, reason.trim());
      setFlights((p) => p.filter((x) => x.id !== id));
      alert("Let odbijen ❌");
    } catch (e) {
      setErr(errMsg(e));
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
            <div className="text-xs tracking-widest uppercase text-white/80">DRS Fly • Admin</div>
            <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight">Letovi na čekanju</h1>
            <p className="mt-2 text-sm text-white/85 max-w-2xl">Odobri ili odbij letove koje su menadžeri poslali.</p>
          </div>
        </div>

        <div className="mt-6 rounded-3xl border border-gray-200 bg-white shadow-sm">
          <div className="p-4 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm text-gray-600">
                Ukupno: <b className="text-gray-900">{flights.length}</b>
              </div>
              <Button variant="secondary" className="rounded-2xl" onClick={refresh} disabled={loading}>
                Osveži
              </Button>
            </div>

            {err && (
              <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {err}
              </div>
            )}

            {loading ? (
              <div className="mt-4 text-sm text-gray-600">Učitavanje…</div>
            ) : (
              <div className="mt-4 grid gap-3">
                {flights.map((f) => (
                  <div key={f.id} className="relative overflow-hidden rounded-3xl border border-gray-200 bg-white">
                    <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600" />

                    <div className="p-4 sm:p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-xs text-gray-500">{f.airlineName}</div>
                          <div className="mt-0.5 truncate text-lg font-semibold">{f.name}</div>
                          <div className="mt-2 text-sm text-gray-600">
                            <b className="text-gray-900">{f.from}</b>{" "}
                            <span className="text-gray-400">→</span>{" "}
                            <b className="text-gray-900">{f.to}</b>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <div className="text-lg font-extrabold">{f.price} €</div>
                          <div
                            className={[
                              "mt-1 inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold",
                              badge(f.approvalStatus),
                            ].join(" ")}
                          >
                            {statusLabelSR(f.approvalStatus)}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="relative">
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-[#f6f7fb] border border-gray-200 -translate-x-1/2" />
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-[#f6f7fb] border border-gray-200 translate-x-1/2" />
                      <div className="border-t border-dashed border-gray-200" />
                    </div>

                    <div className="p-4 sm:p-5 flex flex-wrap justify-end gap-2">
                      <Button variant="primary" className="rounded-2xl px-4" onClick={() => approve(f.id)}>
                        Odobri
                      </Button>
                      <Button variant="danger" className="rounded-2xl px-4" onClick={() => reject(f.id)}>
                        Odbij
                      </Button>
                    </div>
                  </div>
                ))}

                {flights.length === 0 && (
                  <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6 text-sm text-gray-600">
                    Nema letova na čekanju.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
