import { Suspense } from "react";
import { LockKeyhole, MapPin } from "lucide-react";
import { LoginForm } from "@/components/LoginForm";
import { SiteHeader } from "@/components/SiteHeader";
import { brand } from "@/lib/brand";

export const metadata = {
  title: `Ingresar | ${brand.clubName}`
};

export default function LoginPage() {
  return (
    <>
      <SiteHeader />
      <main className="min-h-[calc(100vh-72px)] bg-[radial-gradient(circle_at_20%_20%,rgba(31,157,85,0.16),transparent_32%),linear-gradient(135deg,#ffffff_0%,#f4faf5_100%)]">
        <div className="container-page grid min-h-[calc(100vh-72px)] items-center gap-8 py-10 lg:grid-cols-[1fr_0.9fr]">
          <section className="max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-field-700 shadow-sm">
                <LockKeyhole size={16} />
                Acceso a tu cuenta
              </div>
            <h1 className="mt-5 text-4xl font-bold leading-tight text-ink sm:text-5xl">Ingresá para reservar</h1>
            <p className="mt-4 text-base leading-7 text-ink/65">
              Usá tu cuenta para reservar canchas, consultar tus turnos y recibir la confirmación del club.
            </p>
            <div className="mt-7 rounded-2xl border border-black/8 bg-white/[0.8] p-5 shadow-sm">
              <p className="flex gap-2 text-sm font-semibold text-ink/70">
                <MapPin className="shrink-0 text-field-700" size={17} />
                {brand.clubName}, {brand.location}
              </p>
            </div>
          </section>

          <section className="w-full max-w-md justify-self-center lg:justify-self-end">
            <Suspense>
              <LoginForm />
            </Suspense>
          </section>
        </div>
      </main>
    </>
  );
}
