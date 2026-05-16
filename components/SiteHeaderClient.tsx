"use client";

import Link from "next/link";
import { useState } from "react";
import { CalendarCheck, ChevronDown, Home, LogOut, Menu, UserRound, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { signOut } from "@/actions/auth";
import { brand } from "@/lib/brand";
import { cn } from "@/lib/utils";

type HeaderUser = {
  email: string | null;
  fullName: string | null;
  isAdmin: boolean;
};

const navItems: { href: string; label: string; icon?: LucideIcon }[] = [
  { href: "/", label: "Inicio", icon: Home },
  { href: "/canchas", label: "Canchas" },
  { href: "/#como-funciona", label: "Cómo funciona" },
  { href: "/#contacto", label: "Contacto" }
];

export function SiteHeaderClient({ user }: { user: HeaderUser | null }) {
  const [open, setOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const displayName = user?.fullName || user?.email || "Mi cuenta";

  return (
    <header className="sticky top-0 z-40 border-b border-black/5 bg-white/[0.92] backdrop-blur-xl">
      <div className="container-page flex h-18 items-center justify-between gap-4">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-ink text-white shadow-sm">
            <CalendarCheck size={21} />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold uppercase tracking-[0.16em] text-field-700">{brand.clubName}</span>
            <span className="block truncate text-lg font-bold leading-5 text-ink">{brand.appName}</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => (
            <Link
              className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-ink/68 transition hover:bg-field-50 hover:text-field-700"
              href={item.href}
              key={item.href}
            >
              {item.icon ? <item.icon size={16} /> : null}
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <Link
            href="/canchas"
            className="focus-ring rounded-xl bg-field-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-field-700"
          >
            Reservar ahora
          </Link>
          {user ? (
            <>
              <Link
                href="/mis-reservas"
                className="focus-ring rounded-xl border border-black/10 bg-white px-4 py-3 text-sm font-semibold text-ink transition hover:bg-field-50"
              >
                Mis reservas
              </Link>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setAccountOpen((value) => !value)}
                  className="focus-ring inline-flex max-w-[210px] items-center gap-2 rounded-xl border border-black/10 bg-white px-4 py-3 text-sm font-semibold text-ink transition hover:bg-field-50"
                >
                  <UserRound size={17} />
                  <span className="truncate">{displayName}</span>
                  <ChevronDown size={16} />
                </button>
                <div
                  className={cn(
                    "absolute right-0 mt-2 w-56 overflow-hidden rounded-2xl border border-black/8 bg-white p-2 shadow-soft",
                    accountOpen ? "block" : "hidden"
                  )}
                >
                  <AccountLinks user={user} onNavigate={() => setAccountOpen(false)} />
                </div>
              </div>
            </>
          ) : (
            <>
              <Link className="rounded-xl px-4 py-3 text-sm font-semibold text-ink/72 hover:bg-field-50" href="/login">
                Ingresar
              </Link>
              <Link className="rounded-xl border border-black/10 px-4 py-3 text-sm font-semibold text-ink hover:bg-field-50" href="/registro">
                Registrarse
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="focus-ring grid size-11 place-items-center rounded-xl border border-black/10 bg-white text-ink lg:hidden"
          aria-label="Abrir navegación"
        >
          {open ? <X size={21} /> : <Menu size={21} />}
        </button>
      </div>

      <div className={cn("border-t border-black/5 bg-white lg:hidden", open ? "block" : "hidden")}>
        <div className="container-page grid gap-2 py-4">
          {navItems.map((item) => (
            <Link
              className="inline-flex items-center gap-2 rounded-xl px-3 py-3 text-sm font-semibold text-ink/72 hover:bg-field-50"
              href={item.href}
              key={item.href}
              onClick={() => setOpen(false)}
            >
              {item.icon ? <item.icon size={17} /> : null}
              {item.label}
            </Link>
          ))}
          <Link
            className="rounded-xl bg-field-600 px-4 py-3 text-center text-sm font-semibold text-white"
            href="/canchas"
            onClick={() => setOpen(false)}
          >
            Reservar ahora
          </Link>
          <div className="mt-2 border-t border-black/5 pt-3">
            {user ? (
              <AccountLinks user={user} onNavigate={() => setOpen(false)} />
            ) : (
              <div className="grid gap-2">
                <Link className="rounded-xl px-3 py-3 text-sm font-semibold text-ink/72 hover:bg-field-50" href="/login" onClick={() => setOpen(false)}>
                  Ingresar
                </Link>
                <Link className="rounded-xl border border-black/10 px-3 py-3 text-sm font-semibold text-ink hover:bg-field-50" href="/registro" onClick={() => setOpen(false)}>
                  Registrarse
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

function AccountLinks({ user, onNavigate }: { user: HeaderUser; onNavigate: () => void }) {
  return (
    <div className="grid gap-1">
      <Link className="rounded-xl px-3 py-2.5 text-sm font-semibold text-ink/72 hover:bg-field-50" href="/mis-reservas" onClick={onNavigate}>
        Mis reservas
      </Link>
      {user.isAdmin ? (
        <Link className="rounded-xl px-3 py-2.5 text-sm font-semibold text-ink/72 hover:bg-field-50" href="/admin" onClick={onNavigate}>
          Panel admin
        </Link>
      ) : null}
      <form action={signOut}>
        <button
          type="submit"
          className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-red-700 hover:bg-red-50"
        >
          <LogOut size={16} />
          Cerrar sesión
        </button>
      </form>
    </div>
  );
}
