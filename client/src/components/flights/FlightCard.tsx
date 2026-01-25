import type { Flight } from "../../types/flights";
import { useAuth } from "../../auth/AuthContext";
import { Card } from "../common/Card";
import { Button } from "../common/Button";
import { FlightTimer } from "./FlightTimer";
import { RateFlight } from "./RateFlight";

type Props = {
  flight: Flight;
  onBuy?: (id: number) => void;
  onCancel?: (id: number) => void;
  isBuying?: boolean;
};

function StatusBadge({ status }: { status: Flight["status"] }) {
  const cls =
    status === "PLANNED"
      ? "bg-blue-50 text-blue-700 border-blue-200"
      : status === "IN_PROGRESS"
      ? "bg-amber-50 text-amber-800 border-amber-200"
      : status === "FINISHED"
      ? "bg-emerald-50 text-emerald-800 border-emerald-200"
      : status === "CANCELLED"
      ? "bg-rose-50 text-rose-700 border-rose-200"
      : status === "PENDING"
      ? "bg-gray-50 text-gray-700 border-gray-200"
      : "bg-gray-50 text-gray-700 border-gray-200";

  return (
    <span className={["inline-flex items-center px-2 py-0.5 text-xs rounded-full border", cls].join(" ")}>
      {status}
    </span>
  );
}

export function FlightCard({ flight, onBuy, onCancel, isBuying }: Props) {
  const { user, hasRole } = useAuth();

  const canBuy = !!user && hasRole(["USER"]) && flight.status === "PLANNED";
  const canCancel =
    !!user && hasRole(["ADMIN"]) && (flight.status === "PLANNED" || flight.status === "IN_PROGRESS");

  const showRating = !!user && hasRole(["USER"]) && flight.status === "FINISHED";

  return (
    <Card className="grid gap-3">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <div className="font-semibold truncate">{flight.name}</div>
            <StatusBadge status={flight.status} />
          </div>

          <div className="text-sm text-gray-600">{flight.airlineName}</div>

          <div className="text-xs text-gray-500 mt-1">
            {flight.from} → {flight.to} • {flight.distanceKm} km • {flight.durationMinutes} min
          </div>

          {user && hasRole(["MANAGER"]) && flight.status === "REJECTED" && flight.rejectionReason && (
            <div className="mt-2 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
              <b>Odbijen:</b> {flight.rejectionReason}
            </div>
          )}
        </div>

        <div className="text-right shrink-0">
          <div className="font-semibold">{flight.price} €</div>
          <div className="text-xs text-gray-500 mt-1">Polazak</div>
          <div className="text-xs text-gray-700">
            {new Date(flight.departureTime).toLocaleString()}
          </div>
        </div>
      </div>

      {flight.status === "IN_PROGRESS" && (
        <div className="pt-1">
          <FlightTimer departureTime={flight.departureTime} durationMinutes={flight.durationMinutes} />
        </div>
      )}

      {(canBuy || canCancel || showRating) && (
        <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
          {canBuy && (
            <Button
              variant="primary"
              disabled={isBuying}
              onClick={() => onBuy?.(flight.id)}
            >
              {isBuying ? "Obrada..." : "Kupi kartu"}
            </Button>
          )}

          {canCancel && (
            <Button variant="danger" onClick={() => onCancel?.(flight.id)}>
              Otkaži let
            </Button>
          )}

          {showRating && <RateFlight flightId={flight.id} userEmail={user!.email} />}
        </div>
      )}
    </Card>
  );
}
