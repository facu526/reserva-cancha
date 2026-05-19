"use client";

import { useState } from "react";
import { CalendarClock, LayoutDashboard, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "#reservas", label: "Reservas", icon: CalendarClock },
  { href: "#canchas", label: "Canchas", icon: LayoutDashboard },
  { href: "#configuracion", label: "Configuración", icon: Settings }
];

export function AdminTabs() {
  const [active, setActive] = useState(tabs[0].href);

  return (
    <nav className="sticky top-0 z-20 rounded-2xl border border-black/8 bg-white/95 p-2 shadow-sm backdrop-blur">
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <a
            href={tab.href}
            key={tab.href}
            onClick={() => setActive(tab.href)}
            className={cn(
              "inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition",
              active === tab.href ? "bg-ink text-white shadow-sm" : "text-ink/65 hover:bg-field-50 hover:text-field-700"
            )}
          >
            <tab.icon size={16} />
            {tab.label}
          </a>
        ))}
      </div>
    </nav>
  );
}
