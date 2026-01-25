import type React from "react";

type Props = React.LabelHTMLAttributes<HTMLLabelElement>;

export function Label({ className = "", ...props }: Props) {
  return (
    <label
      className={["text-xs font-medium text-gray-600", className].join(" ")}
      {...props}
    />
  );
}
