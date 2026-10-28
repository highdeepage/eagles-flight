"use client";

import * as React from "react";

export interface ToastMessage {
  id: number;
  type: "success" | "error" | "info";
  text: string;
}

interface ToastContextType {
  push: (type: ToastMessage["type"], text: string) => void;
}

const ToastContext = React.createContext<ToastContextType>({ push: () => {} });
export const useToast = () => React.useContext(ToastContext);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<ToastMessage[]>([]);
  const idRef = React.useRef(0);

  const push = React.useCallback((type: ToastMessage["type"], text: string) => {
    const id = ++idRef.current;
    setItems((s) => [...s, { id, type, text }]);
    setTimeout(() => setItems((s) => s.filter((x) => x.id !== id)), 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {items.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto rounded-md px-4 py-2 text-sm text-white shadow-lg ${
              t.type === "success" ? "bg-green-600" : t.type === "error" ? "bg-red-600" : "bg-slate-800"
            }`}
          >
            {t.text}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}