import { useEffect, useState } from "react";
import { StarRating } from "./StarRating";
import { Button } from "../common/Button";
import { createRating, fetchMyRatings } from "../../api/ratings";

export function RateFlight({ flightId, onSaved }: { flightId: number; onSaved?: () => void }) {
  const [value, setValue] = useState(5);
  const [saved, setSaved] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMyRatings().then((items) => {
      const mine = items.find((x) => x.flight_id === flightId);
      if (mine) {
        setSaved(mine.value);
        setValue(mine.value);
      }
    });
  }, [flightId]);

  const save = async () => {
    setLoading(true);
    try {
      const r = await createRating(flightId, value);
      setSaved(r.value);
      onSaved?.();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      <span className="text-xs text-gray-600">Ocena:</span>
      <StarRating value={value} onChange={setValue} disabled={loading || saved !== null} />
      <Button
        type="button"
        variant="secondary"
        disabled={loading || saved !== null}
        onClick={save}
        className="rounded-xl px-3 py-1.5 text-xs"
      >
        {loading ? "Čuvam..." : saved !== null ? "Sačuvano" : "Sačuvaj"}
      </Button>
      {saved !== null && <span className="text-xs text-gray-500">Sačuvano: {saved}/5</span>}
    </div>
  );
}
