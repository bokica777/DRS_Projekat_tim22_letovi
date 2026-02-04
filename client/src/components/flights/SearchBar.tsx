import { Input } from "../common/Input";

type Props = {
  value: string;
  onChange: (v: string) => void;
};

export function SearchBar({ value, onChange }: Props) {
  return (
    <Input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Pretraga po imenu leta ili kompaniji…"
      className="rounded-2xl"
    />
  );
}
