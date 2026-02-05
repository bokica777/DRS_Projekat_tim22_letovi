import { useEffect, useState } from "react";
import { formatRemaining, getRemainingSeconds } from "../../utils/time";

type Props = {
  departureTime: string;
  durationMinutes: number;
};

export function FlightTimer({ departureTime, durationMinutes }: Props) {
  const [remaining, setRemaining] = useState(() =>
    getRemainingSeconds(departureTime, durationMinutes)
  );

  useEffect(() => {
    const id = setInterval(() => {
      setRemaining(getRemainingSeconds(departureTime, durationMinutes));
    }, 1000);
    return () => clearInterval(id);
  }, [departureTime, durationMinutes]);

  if (remaining <= 0) {
    return <span className="text-xs text-gray-500">Završen</span>;
  }

  return (
    <span className="text-xs font-semibold text-gray-700">
      Preostalo: {formatRemaining(remaining)}
    </span>
  );
}
