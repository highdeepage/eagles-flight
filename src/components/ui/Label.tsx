import * as React from "react";

export function Label({ className = "", ...rest }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      {...rest}
      className={`mb-1 block text-sm font-medium text-slate-700 ${className}`}
    />
  );
}