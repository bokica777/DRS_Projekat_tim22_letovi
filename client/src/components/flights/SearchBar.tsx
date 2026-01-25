type Props = {
  value: string;
  onChange: (v: string) => void;
};

export function SearchBar({ value, onChange }: Props) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Pretraga po imenu leta ili kompaniji…"
      style={{ padding: 10, width: "100%", borderRadius: 10, border: "1px solid #ddd" }}
    />
  );
}
