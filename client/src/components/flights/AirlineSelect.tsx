import type { Airline } from "../../types/airlines";
import { Select } from "../common/Select";

type Props = {
  airlines: Airline[];
  value: string;
  onChange: (v: string) => void;
};

export function AirlineSelect({ airlines, value, onChange }: Props) {
  return (
    <Select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-2xl"
    >
      <option value="">Sve avio kompanije</option>
      {airlines.map((a) => (
        <option key={a.id} value={a.id}>
          {a.name}
        </option>
      ))}
    </Select>
  );
}
