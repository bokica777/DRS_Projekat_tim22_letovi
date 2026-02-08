import type { Flight } from "../../types/flights";
import { useAuth } from "../../auth/AuthContext";
import { FlightTimer } from "./FlightTimer";
import { RateFlight } from "./RateFlight";
import { Button } from "../common/Button";
import { statusBadgeClass, statusLabelSR } from "../../utils/status";

type Props = {
  flight: Flight;
  onBuy?: (id: number) => void;
  onCancel?: (id: number) => void;
  onDelete?: (id: number) => void;
  isBuying?: boolean;
};

export function FlightCard({ flight, onBuy, onCancel, onDelete, isBuying }: Props) {
  const { user, hasRole } = useAuth();

  const canBuy =
    !!user && hasRole(["KORISNIK", "MENADZER"]) && flight.status === "PLANNED";

  const canCancel =
    !!user &&
    hasRole(["ADMIN"]) &&
    (flight.status === "PLANNED" || flight.status === "IN_PROGRESS");

  const canDelete = !!user && hasRole(["ADMIN"]);

  const showRejectedReason =
    !!user &&
    hasRole(["MENADZER"]) &&
    flight.status === "REJECTED" &&
    !!flight.rejectionReason;

  const canRate =
    !!user && hasRole(["KORISNIK", "MENADZER"]) && flight.status === "FINISHED";

  return (
    <div className="relative overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600" />

      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-xs text-gray-500">{flight.airlineName}</div>
            <div className="mt-0.5 truncate text-lg font-semibold tracking-tight">
              {flight.name}
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-gray-600">
              <span className="font-semibold text-gray-900">{flight.from}</span>
              <span className="text-gray-400">→</span>
              <span className="font-semibold text-gray-900">{flight.to}</span>
              <span className="text-gray-300">•</span>
              <span>{flight.distanceKm} km</span>
              <span className="text-gray-300">•</span>
              <span>{flight.durationMinutes} min</span>
            </div>
          </div>

          <div className="text-right shrink-0">
            <div className="text-lg font-extrabold">{flight.price} €</div>
            <div
              className={[
                "mt-1 inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold",
                statusBadgeClass(flight.status),
              ].join(" ")}
            >
              {statusLabelSR(flight.status)}
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-gray-600">
            Polazak:{" "}
            <b className="text-gray-900">
              {new Date(flight.departureTime).toLocaleString()}
            </b>
          </div>

          {flight.status === "IN_PROGRESS" && (
            <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2">
              <FlightTimer
                departureTime={flight.departureTime}
                durationMinutes={flight.durationMinutes}
              />
            </div>
          )}
        </div>
      </div>

      <div className="relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-[#f6f7fb] border border-gray-200 -translate-x-1/2" />
        <div className="absolute right-0 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-[#f6f7fb] border border-gray-200 translate-x-1/2" />
        <div className="border-t border-dashed border-gray-200" />
      </div>

      <div className="p-4 sm:p-5">
        {(canBuy || canCancel || canDelete) && (
          <div className="flex flex-wrap gap-2 justify-end">
            {canBuy && (
              <Button
                variant="primary"
                disabled={isBuying}
                onClick={() => onBuy?.(flight.id)}
                className="rounded-2xl px-4"
              >
                {isBuying ? "Obrada..." : "Kupi kartu"}
              </Button>
            )}

            {canCancel && (
              <Button
                variant="danger"
                onClick={() => onCancel?.(flight.id)}
                className="rounded-2xl px-4"
              >
                Otkaži let
              </Button>
            )}

            {canDelete && (
              <Button
                variant="danger"
                onClick={() => onDelete?.(flight.id)}
                className="rounded-2xl px-4"
              >
                Obriši let
              </Button>
            )}
          </div>
        )}

        {showRejectedReason && (
          <div className="mt-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            Odbijen: <b>{flight.rejectionReason}</b>
          </div>
        )}

       {canRate && <RateFlight flightId={flight.id} />}
      </div>
    </div>
  );
}
