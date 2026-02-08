import { useEffect, useMemo, useState } from "react";
import type { Rating } from "../../types/ratings";
import { fetchAdminRatings, fetchFlightNameById, type AdminRating } from "../../api/adminRatings";

function stars(n: number) {
  return "★★★★★☆☆☆☆☆".slice(5 - n, 10 - n);
}

function errMsg(e: any): string {
  const d = e?.response?.data;
  if (typeof d === "string") return d;
  if (d?.error) return String(d.error);
  if (d?.message) return String(d.message);
  return e?.message ? String(e.message) : "Greška";
}

export default function AdminRatingsPage() {
  const [items, setItems] = useState<AdminRating[]>([]);
  const [nameMap, setNameMap] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const missingFlightIds = useMemo(() => {
    const ids = new Set<number>();
    for (const r of items) {
      if (!r.flightName && r.flightId && !nameMap[r.flightId]) ids.add(r.flightId);
    }
    return Array.from(ids);
  }, [items, nameMap]);

  useEffect(() => {
    (async () => {
      setErr(null);
      setLoading(true);
      try {
        const data = await fetchAdminRatings();
        setItems(data);
      } catch (e) {
        setErr(errMsg(e));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (missingFlightIds.length === 0) return;

    (async () => {
      const pairs = await Promise.all(
        missingFlightIds.map(async (id) => {
          try {
            const name = await fetchFlightNameById(id);
            return [id, name] as const;
          } catch {
            return [id, `Let #${id}`] as const;
          }
        })
      );

      setNameMap((prev) => {
        const next = { ...prev };
        for (const [id, name] of pairs) next[id] = name;
        return next;
      });
    })();
  }, [missingFlightIds]);

  const flightName = (r: AdminRating) =>
    r.flightName ?? nameMap[r.flightId] ?? `Let #${r.flightId}`;

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
            <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight">Ocene korisnika</h1>
            <p className="mt-2 text-sm text-white/85 max-w-2xl">Pregled ocena po letovima.</p>
          </div>
        </div>

        <div className="mt-6 rounded-3xl border border-gray-200 bg-white shadow-sm">
          <div className="p-4 sm:p-6">
            <div className="text-sm text-gray-600">
              Ukupno: <b className="text-gray-900">{items.length}</b>
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
                {items.map((r) => (
                  <div key={r.id} className="relative overflow-hidden rounded-3xl border border-gray-200 bg-white">
                    <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600" />

                    <div className="p-4 sm:p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-xs text-gray-500">Let</div>
                          <div className="mt-0.5 truncate text-lg font-semibold">{flightName(r)}</div>
                          <div className="mt-2 text-sm text-gray-600">{r.userEmail}</div>
                        </div>

                        <div className="text-right shrink-0">
                          <div className="text-lg font-extrabold">{r.rating}/5</div>
                          <div className="mt-1 text-sm text-amber-600">{stars(r.rating)}</div>
                          <div className="mt-2 text-xs text-gray-500">{new Date(r.createdAt).toLocaleString()}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {items.length === 0 && (
                  <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6 text-sm text-gray-600">
                    Nema ocena još.
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
