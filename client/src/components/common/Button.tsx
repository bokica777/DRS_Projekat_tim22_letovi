import type React from "react";

type Variant = "primary" | "secondary" | "danger" | "ghost";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
};

const variants: Record<Variant, string> = {
  primary:
    "bg-black text-white border-black hover:opacity-90 active:opacity-80",
  secondary:
    "bg-white text-black border-gray-200 hover:bg-gray-50",
  danger:
    "bg-white text-red-600 border-red-200 hover:bg-red-50",
  ghost:
    "bg-transparent text-black border-transparent hover:bg-gray-50",
};

export function Button({ variant = "secondary", className = "", ...props }: Props) {
  return (
    <button
      className={[
        "inline-flex items-center justify-center gap-2",
        "px-3 py-2 rounded-lg border text-sm font-medium",
        "transition",
        "disabled:opacity-60 disabled:cursor-not-allowed",
        variants[variant],
        className,
      ].join(" ")}
      {...props}
    />
  );
}
