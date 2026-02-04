import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import type { Flight } from "../../types/flights";
import { getFlights, subscribeFlights } from "../../mocks/flightStore";
import { Button } from "../../components/common/Button";

const STATUS_SR: Record<string, string> = {
  PENDING: "Na čekanju",
  REJECTED: "Odbijen",
  APPROVED: "Odobren",
};

function badge(status: string) {
  switch (status) {
    case "PENDING":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "REJECTED":
      return "bg-rose-50 text-rose-700 border-rose-200";
    case "APPROVED":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    default:
      return "bg-gray-50 text-gray-700 border-gray-200";
  }
}

export default function ManagerMyFlightsPage() {
  const { user, hasRole } = useAuth();
  const nav = useNavigate();
  const [items, setItems] = useState<Flight[]>([]);

  useEffect(() => {
    const sync = () => {
      const all = getFlights();
      const mine = all.filter(
        (f) =>
          (f.status === "PENDING" || f.status === "REJECTED") &&
          (!f.createdBy || f.createdBy === user?.email)
      );
      setItems(mine);
    };

    sync();
    return subscribeFlights(sync);
  }, [user?.email]);

  if (!user || !hasRole(["MENADZER"])) {
    return (
      <div className="min-h-[calc(100vh-56px)] px-4 py-10">
        <div className="mx-auto max-w-3xl rounded-3xl border border-gray-200 bg-white p-6 text-sm text-gray-700">
          Nemaš pristup.
        </div>
      </div>
    );
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
            <div className="text-xs tracking-widest uppercase text-white/80">
              DRS Fly • Menadžer
            </div>
            <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight">
              Moji letovi
            </h1>
            <p className="mt-2 text-sm text-white/85 max-w-2xl">
              Ovde vidiš letove na čekanju ili odbijene i možeš da ih izmeniš.
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-3xl border border-gray-200 bg-white shadow-sm">
          <div className="p-4 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm text-gray-600">
                Ukupno: <b className="text-gray-900">{items.length}</b>
              </div>
              <Button
                variant="primary"
                className="rounded-2xl"
                onClick={() => nav("/manager/create")}
              >
                Novi let
              </Button>
            </div>

            <div className="mt-4 grid gap-3">
              {items.map((f) => (
                <div
                  key={f.id}
                  className="relative overflow-hidden rounded-3xl border border-gray-200 bg-white"
                >
                  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600" />

                  <div className="p-4 sm:p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-xs text-gray-500">{f.airlineName}</div>
                        <div className="mt-0.5 truncate text-lg font-semibold">
                          {f.name}
                        </div>
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
                            badge(f.status),
                          ].join(" ")}
                        >
                          {STATUS_SR[f.status] ?? f.status}
                        </div>
                      </div>
                    </div>

                    {f.status === "REJECTED" && f.rejectionReason && (
                      <div className="mt-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                        <b>Razlog:</b> {f.rejectionReason}
                      </div>
                    )}
                  </div>

                  <div className="relative">
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-[#f6f7fb] border border-gray-200 -translate-x-1/2" />
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-[#f6f7fb] border border-gray-200 translate-x-1/2" />
                    <div className="border-t border-dashed border-gray-200" />
                  </div>

                  <div className="p-4 sm:p-5 flex justify-end gap-2">
                    {f.status === "REJECTED" && (
                      <Button
                        variant="secondary"
                        className="rounded-2xl"
                        onClick={() => nav(`/manager/flights/${f.id}/edit`)}
                      >
                        Izmeni i pošalji ponovo
                      </Button>
                    )}
                  </div>
                </div>
              ))}

              {items.length === 0 && (
                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6 text-sm text-gray-600">
                  Nema pending/odbijenih letova.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
