import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export function EmptyState({
  icon: Icon,
  title,
  text,
  children
}: {
  icon: LucideIcon;
  title: string;
  text: string;
  children?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-black/15 bg-white/[0.85] p-8 text-center shadow-sm">
      <div className="mx-auto grid size-12 place-items-center rounded-xl bg-field-50 text-field-700">
        <Icon size={22} />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-ink">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-ink/60">{text}</p>
      {children}
    </div>
  );
}
