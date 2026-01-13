import type { Flight } from "../types/flights";
import { useAuth } from "../auth/AuthContext";
import { FlightTimer } from "./FlightTimer";
import { RateFlight } from "./RateFlight";


type Props = {
  flight: Flight;
  onBuy?: (id: number) => void;
  onCancel?: (id: number) => void;
  isBuying?: boolean;
};

export function FlightCard({ flight, onBuy, onCancel, isBuying }: Props) {
  const { user, hasRole } = useAuth();

  const canBuy =
    user &&
    hasRole(["USER"]) &&
    flight.status === "PLANNED";

  const canCancel =
    user &&
    hasRole(["ADMIN"]) &&
    (flight.status === "PLANNED" || flight.status === "IN_PROGRESS");

  return (
    <div
      style={{
        border: "1px solid #eee",
        borderRadius: 14,
        padding: 14,
        display: "grid",
        gap: 10,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
        <div>
          <div style={{ fontWeight: 700 }}>{flight.name}</div>
          <div style={{ color: "#555" }}>{flight.airlineName}</div>
          <div style={{ color: "#777", marginTop: 6 }}>
            {flight.from} → {flight.to} • {flight.distanceKm} km •{" "}
            {flight.durationMinutes} min
          </div>
        </div>

        <div style={{ textAlign: "right" }}>
          <div style={{ fontWeight: 700 }}>{flight.price} €</div>
          <div style={{ fontSize: 12, color: "#666" }}>{flight.status}</div>
        </div>
      </div>

      <div style={{ fontSize: 12, color: "#666" }}>{flight.status}</div>

      {flight.status === "IN_PROGRESS" && (
        <FlightTimer
          departureTime={flight.departureTime}
          durationMinutes={flight.durationMinutes}
        />
      )}


      {(canBuy || canCancel) && (
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          {canBuy && (
            <button
              disabled={isBuying}
              onClick={() => onBuy?.(flight.id)}
              style={{
                padding: "8px 12px",
                borderRadius: 10,
                border: "1px solid #ddd",
                cursor: isBuying ? "not-allowed" : "pointer",
                opacity: isBuying ? 0.6 : 1,
              }}
            >
              {isBuying ? "Obrada..." : "Kupi kartu"}
            </button>

          )}

          {canCancel && (
            <button
              onClick={() => onCancel?.(flight.id)}
              style={{
                padding: "8px 12px",
                borderRadius: 10,
                border: "1px solid #ddd",
                cursor: "pointer",
                color: "crimson",
              }}
            >
              Otkaži let
            </button>
          )}

        </div>
      )}
      {user && hasRole(["MANAGER"]) && flight.status === "REJECTED" && flight.rejectionReason && (
        <div style={{ fontSize: 12, color: "crimson" }}>
          Odbijen: {flight.rejectionReason}
        </div>
      )}

      {user && hasRole(["USER"]) && flight.status === "FINISHED" && (
        <RateFlight flightId={flight.id} userEmail={user.email} />
      )}

    </div>
  );
}
