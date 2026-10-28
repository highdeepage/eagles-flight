import * as React from "react";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = "", error, children, ...rest }, ref) => (
    <div>
      <select
        ref={ref}
        {...rest}
        className={`block w-full rounded-md border bg-white px-3 py-2 text-sm shadow-sm outline-none transition focus:ring-2 ${
          error
            ? "border-red-400 focus:ring-red-300"
            : "border-slate-300 focus:ring-blue-200"
        } ${className}`}
      >
        {children}
      </select>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  ),
);
Select.displayName = "Select";