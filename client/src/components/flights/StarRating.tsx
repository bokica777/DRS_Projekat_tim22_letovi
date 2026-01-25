type Props = {
  value: number;                 // 1..5
  onChange: (v: number) => void; // klik na zvezdu
  disabled?: boolean;
};

export function StarRating({ value, onChange, disabled }: Props) {
  return (
    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={disabled}
          onClick={() => onChange(n)}
          style={{
            border: "none",
            background: "transparent",
            cursor: disabled ? "not-allowed" : "pointer",
            fontSize: 20,
            lineHeight: 1,
            padding: 0,
            opacity: disabled ? 0.6 : 1,
          }}
          aria-label={`Oceni ${n} od 5`}
          title={`${n}/5`}
        >
          {n <= value ? "★" : "☆"}
        </button>
      ))}
    </div>
  );
}
