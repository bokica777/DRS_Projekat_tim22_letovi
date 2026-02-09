import { useEffect, useState } from "react";
import type { Ticket } from "../../api/tickets";
import { myTickets } from "../../api/tickets";

export default function MyTicketsPage() {
  const [items, setItems] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    const refresh = async () => {
      try {
        const data = await myTickets();
        if (alive) setItems(data);
      } finally {
        if (alive) setLoading(false);
      }
    };

    refresh();
    const id = setInterval(refresh, 5000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

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
                  Moje karte
                </h1>
                <p className="mt-2 text-sm text-white/85 max-w-2xl">
                  Pregled svih kupljenih karata. Ovde vidiš kad si kupio kartu i
                  osnovne detalje leta.
                </p>
              </div>

              <div className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 backdrop-blur">
                <div className="text-lg font-extrabold tracking-tight text-white">
                  Ukupno: {items.length}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-3xl border border-gray-200 bg-white shadow-sm">
          <div className="p-4 sm:p-6">
            <div className="mt-2 grid gap-3">
              {loading ? (
                <div className="rounded-2xl border border-gray-200 bg-white p-6 text-sm text-gray-600">
                  Učitavanje…
                </div>
              ) : (
                <>
                  {items.map((t) => {
                    const fl = (t as any).flight;
                    const dt = new Date((t as any).createdAt);
                    const dateText = Number.isNaN(dt.getTime())
                      ? "—"
                      : dt.toLocaleString();

                    return (
                      <div
                        key={(t as any).id}
                        className="rounded-3xl border border-gray-200 bg-white p-5"
                      >
                        <div className="text-xs text-gray-500">Karta</div>

                        <div className="mt-0.5 text-lg font-semibold">
                          {fl?.name ? fl.name : `Let #${(t as any).flightId}`}
                        </div>

                        <div className="mt-2 text-sm text-gray-600">
                          {fl?.from && fl?.to ? (
                            <>
                              <b className="text-gray-900">{fl.from}</b>{" "}
                              <span className="text-gray-400">→</span>{" "}
                              <b className="text-gray-900">{fl.to}</b>
                            </>
                          ) : (
                            "Detalji leta nisu dostupni."
                          )}
                        </div>

                        <div className="mt-2 text-xs text-gray-500">
                          Kupljeno: {dateText}
                        </div>

                        <div className="mt-1 text-xs text-gray-500">
                          Cena:{" "}
                          <b className="text-gray-900">
                            {(t as any).price} €
                          </b>
                        </div>
                      </div>
                    );
                  })}

                  {items.length === 0 && (
                    <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6 text-sm text-gray-600">
                      Još nema kupljenih karata.
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
