import type { Airline } from "../types/flights";

type Props = {
  airlines: Airline[];
  value: string;
  onChange: (v: string) => void;
};

export function AirlineSelect({ airlines, value, onChange }: Props) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{ padding: 10, borderRadius: 10, border: "1px solid #ddd", width: "100%" }}
    >
      <option value="">Sve avio kompanije</option>
      {airlines.map((a) => (
        <option key={a.id} value={a.id}>
          {a.name}
        </option>
      ))}
    </select>
  );
}
