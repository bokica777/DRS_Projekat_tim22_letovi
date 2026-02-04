import { useEffect, useState } from "react";
import type { Flight } from "../../types/flights";
import type { Purchase } from "../../types/purchases";
import { getMyPurchases } from "../../mocks/purchases";
import { mockFlights } from "../../mocks/db";

const PURCHASE_STATUS_SR: Record<string, string> = {
  CREATED: "Kreirana",
  PAID: "Plaćena",
  CANCELLED: "Otkazana",
  DONE: "Završena",
};

function badgeClass(status: string) {
  switch (status) {
    case "PAID":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "CANCELLED":
      return "bg-red-50 text-red-700 border-red-200";
    case "DONE":
      return "bg-slate-50 text-slate-700 border-slate-200";
    default:
      return "bg-amber-50 text-amber-700 border-amber-200";
  }
}

export default function MyTicketsPage() {
  const [items, setItems] = useState<Purchase[]>([]);

  const refresh = () => getMyPurchases().then(setItems);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 1000);
    return () => clearInterval(id);
  }, []);

  const flightById = (id: number): Flight | undefined =>
    mockFlights.find((f) => f.id === id);

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
              DRS Fly • Wallet
            </div>
            <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight">
              Moje karte
            </h1>
            <p className="mt-2 text-sm text-white/85 max-w-2xl">
              Pregled kupovina i statusa karata. Sve na jednom mestu.
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-3xl border border-gray-200 bg-white shadow-sm">
          <div className="p-4 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm text-gray-600">
                Ukupno: <b className="text-gray-900">{items.length}</b>
              </div>
              <div className="text-xs text-gray-500">
                (mock) automatsko osvežavanje
              </div>
            </div>

            <div className="mt-4 grid gap-3">
              {items.map((p) => {
                const fl = flightById(p.flightId);
                const statusLabel = PURCHASE_STATUS_SR[p.status] ?? p.status;

                return (
                  <div
                    key={p.id}
                    className="relative overflow-hidden rounded-3xl border border-gray-200 bg-white"
                  >
                    <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600" />

                    <div className="p-4 sm:p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-xs text-gray-500">Karta</div>
                          <div className="mt-0.5 truncate text-lg font-semibold">
                            {fl ? fl.name : `Let #${p.flightId}`}
                          </div>
                          <div className="mt-2 text-sm text-gray-600">
                            {fl ? (
                              <>
                                <b className="text-gray-900">{fl.from}</b>{" "}
                                <span className="text-gray-400">→</span>{" "}
                                <b className="text-gray-900">{fl.to}</b>
                              </>
                            ) : (
                              <span className="text-gray-600">Detalji leta nisu dostupni.</span>
                            )}
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <div
                            className={[
                              "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold",
                              badgeClass(p.status),
                            ].join(" ")}
                          >
                            {statusLabel}
                          </div>
                          <div className="mt-2 text-xs text-gray-500">
                            {new Date(p.createdAt).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="relative">
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-[#f6f7fb] border border-gray-200 -translate-x-1/2" />
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-[#f6f7fb] border border-gray-200 translate-x-1/2" />
                      <div className="border-t border-dashed border-gray-200" />
                    </div>

                    <div className="p-4 sm:p-5 text-xs text-gray-600">
                      ID kupovine: <b className="text-gray-900">#{p.id}</b>
                    </div>
                  </div>
                );
              })}

              {items.length === 0 && (
                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6 text-sm text-gray-600">
                  Još nema kupljenih karata.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
