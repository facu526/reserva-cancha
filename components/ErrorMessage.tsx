import { AlertCircle } from "lucide-react";
import type { ReactNode } from "react";

export function ErrorMessage({ children }: { children: ReactNode }) {
  return (
    <div className="flex gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
      <AlertCircle className="mt-0.5 shrink-0" size={18} />
      <p className="leading-6">{children}</p>
    </div>
  );
}
