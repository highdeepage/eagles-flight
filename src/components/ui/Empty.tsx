import * as React from "react";

export function Empty({
  icon,
  title,
  description,
  action,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50/50 p-10 text-center">
      {icon && <div className="mb-3 text-slate-400">{icon}</div>}
      <div className="font-display text-sm font-semibold text-slate-900">
        {title}
      </div>
      {description && (
        <p className="mt-1 max-w-md text-sm text-slate-500">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}