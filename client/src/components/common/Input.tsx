import type React from "react";

type Props = React.InputHTMLAttributes<HTMLInputElement>;

export function Input({ className = "", ...props }: Props) {
  return (
    <input
      className={[
        "w-full px-3 py-2 rounded-lg border border-gray-200",
        "outline-none",
        "focus:ring-2 focus:ring-gray-200 focus:border-gray-300",
        "disabled:bg-gray-50 disabled:text-gray-500",
        className,
      ].join(" ")}
      {...props}
    />
  );
}
