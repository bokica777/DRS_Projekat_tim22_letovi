type Props = {
  value: number;
  onChange: (v: number) => void;
  disabled?: boolean;
};

export function StarRating({ value, onChange, disabled }: Props) {
  return (
    <div className="flex items-center gap-1.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={disabled}
          onClick={() => onChange(n)}
          className={[
            "text-lg leading-none",
            disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer",
            "hover:scale-105 transition-transform",
          ].join(" ")}
          aria-label={`Oceni ${n} od 5`}
          title={`${n}/5`}
        >
          {n <= value ? "★" : "☆"}
        </button>
      ))}
    </div>
  );
}
