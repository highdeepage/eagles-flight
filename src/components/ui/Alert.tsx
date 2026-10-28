import * as React from "react";

type Variant = "success" | "error" | "info" | "warning";

const classes: Record<Variant, string> = {
  success: "bg-green-50 border-green-200 text-green-800",
  error: "bg-red-50 border-red-200 text-red-800",
  info: "bg-blue-50 border-blue-200 text-blue-800",
  warning: "bg-amber-50 border-amber-200 text-amber-800",
};

export function Alert({ variant = "info", children }: { variant?: Variant; children: React.ReactNode }) {
  return (
    <div className={`rounded-md border p-3 text-sm ${classes[variant]}`} role="alert">
      {children}
    </div>
  );
}