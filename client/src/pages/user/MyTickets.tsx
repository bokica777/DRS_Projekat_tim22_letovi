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
    const id = setInterval(refresh, 5000); // ✅ NEMA 1s spamovanja
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  return (
    <div className="min-h-[calc(100vh-56px)] px-4 py-10">
      <div className="mt-4 grid gap-3">
        {loading ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-6 text-sm text-gray-600">
            Učitavanje…
          </div>
        ) : (
          <>
            {items.map((t) => {
              const fl = t.flight;
              const dt = new Date(t.createdAt);
              const dateText = Number.isNaN(dt.getTime())
                ? "—"
                : dt.toLocaleString();

              return (
                <div
                  key={t.id}
                  className="rounded-3xl border border-gray-200 bg-white p-5"
                >
                  <div className="text-xs text-gray-500">Karta</div>

                  <div className="mt-0.5 text-lg font-semibold">
                    {fl?.name ? fl.name : `Let #${t.flightId}`}
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
                    Cena: <b className="text-gray-900">{t.price} €</b>
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
  );
}
