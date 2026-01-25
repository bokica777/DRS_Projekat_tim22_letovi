import { useEffect, useState } from "react";
import { getMyRatingForFlight, submitRating } from "../../mocks/ratings";
import { StarRating } from "./StarRating";


export function RateFlight({
  flightId,
  userEmail,
  onSaved,
}: {
  flightId: number;
  userEmail: string;
  onSaved?: () => void;
}) {
  const [value, setValue] = useState(5);
  const [saved, setSaved] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getMyRatingForFlight(userEmail, flightId).then((r) => {
      if (r) {
        setSaved(r.rating);
        setValue(r.rating);
      }
    });
  }, [userEmail, flightId]);

  const save = async () => {
    setLoading(true);
    await submitRating(userEmail, flightId, value);
    setSaved(value);
    setLoading(false);
    onSaved?.();
  };

  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 10 }}>
      <span style={{ fontSize: 12, color: "#666" }}>Ocena:</span>
      <StarRating value={value} onChange={setValue} disabled={loading} />

      <button
        disabled={loading}
        onClick={save}
        style={{
          padding: "6px 10px",
          borderRadius: 8,
          border: "1px solid #ddd",
          cursor: "pointer",
        }}
      >
        {loading ? "Čuvam..." : "Sačuvaj"}
      </button>

      {saved !== null && <span style={{ fontSize: 12, color: "#777" }}>Sačuvano: {saved}/5</span>}
    </div>
  );
}
