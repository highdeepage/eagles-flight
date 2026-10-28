"use client";

import * as React from "react";

export interface TabItem {
  key: string;
  label: string;
}

export function Tabs({
  items,
  active,
  onChange,
}: {
  items: TabItem[];
  active: string;
  onChange: (key: string) => void;
}) {
  return (
    <div className="border-b border-slate-200">
      <nav className="-mb-px flex gap-2 overflow-x-auto">
        {items.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => onChange(item.key)}
            className={`whitespace-nowrap border-b-2 px-4 py-2 text-sm font-medium transition ${
              active === item.key
                ? "border-blue-600 text-blue-700"
                : "border-transparent text-slate-600 hover:border-slate-300 hover:text-slate-900"
            }`}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </div>
  );
}