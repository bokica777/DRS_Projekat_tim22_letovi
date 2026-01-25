export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={["rounded-2xl border border-gray-200 bg-white p-4", className].join(" ")}>
      {children}
    </div>
  );
}
