import { useEffect, useState } from "react";
import { getMyRatingForFlight, submitRating } from "../../mocks/ratings";
import { StarRating } from "./StarRating";
import { Button } from "../common/Button";

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
    <div className="mt-3 flex flex-wrap items-center gap-2">
      <span className="text-xs text-gray-600">Ocena:</span>
      <StarRating value={value} onChange={setValue} disabled={loading} />
      <Button
        type="button"
        variant="secondary"
        disabled={loading}
        onClick={save}
        className="rounded-xl px-3 py-1.5 text-xs"
      >
        {loading ? "Čuvam..." : "Sačuvaj"}
      </Button>
      {saved !== null && (
        <span className="text-xs text-gray-500">Sačuvano: {saved}/5</span>
      )}
    </div>
  );
}
