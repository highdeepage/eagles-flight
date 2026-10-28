import * as React from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", error, ...rest }, ref) => (
    <div>
      <input
        ref={ref}
        {...rest}
        className={`block w-full rounded-md border px-3 py-2 text-sm shadow-sm outline-none transition focus:ring-2 ${
          error
            ? "border-red-400 focus:border-red-500 focus:ring-red-300"
            : "border-slate-300 focus:border-blue-500 focus:ring-blue-200"
        } ${className}`}
        aria-invalid={error ? "true" : undefined}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  ),
);
Input.displayName = "Input";