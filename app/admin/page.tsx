import Link from "next/link";
import { CheckCircle2, CircleDollarSign, Clock3, Home, LayoutDashboard, LogOut, ShieldAlert, XCircle } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { signOut, updateSiteSettings } from "@/actions/admin";
import { AdminCourtsSection } from "@/components/admin/AdminCourtsSection";
import { AdminReservationsSection } from "@/components/admin/AdminReservationsSection";
import { AdminTabs } from "@/components/admin/AdminTabs";
import { ErrorMessage } from "@/components/ErrorMessage";
import { SubmitButton } from "@/components/SubmitButton";
import { getAdminContext } from "@/lib/admin";
import { brand } from "@/lib/brand";
import { getSiteSettings } from "@/lib/site-settings";
import type { Court, Reservation, SiteSettings } from "@/lib/types";
import { currency } from "@/lib/utils";

export const metadata = {
  title: `Panel de gestión | ${brand.clubName}`
};

export default async function AdminPage({
  searchParams
}: {
  searchParams: Promise<{ success?: string; error?: string }>;
}) {
  const { success, error } = await searchParams;
  const { supabase, isAdmin } = await getAdminContext();

  if (!isAdmin) {
    return <AccessDenied />;
  }

  const [{ data: reservations, error: reservationsError }, { data: courts, error: courtsError }, settings] = await Promise.all([
    supabase
      .from("reservations")
      .select("*, courts(name, sport_type)")
      .order("reservation_date", { ascending: false })
      .order("start_time", { ascending: true }),
    supabase.from("courts").select("*").order("name", { ascending: true }),
    getSiteSettings()
  ]);

  const typedReservations = (reservations ?? []) as Reservation[];
  const typedCourts = (courts ?? []) as Court[];
  const pendingCount = typedReservations.filter((reservation) => reservation.status === "pending").length;
  const confirmedCount = typedReservations.filter((reservation) => reservation.status === "confirmed").length;
  const cancelledCount = typedReservations.filter((reservation) => reservation.status === "cancelled").length;
  const confirmedIncome = typedReservations
    .filter((reservation) => reservation.status === "confirmed")
    .reduce((total, reservation) => total + (reservation.total_price ?? 0), 0);
  const hasLoadError = Boolean(reservationsError || courtsError);

  return (
    <main className="min-h-screen bg-[#f7faf7]">
      <header className="border-b border-black/5 bg-white">
        <div className="container-page flex flex-col gap-5 py-6 md:flex-row md:items-center md:justify-between lg:py-5">
          <div>
            <p className="font-semibold text-field-700">{brand.clubName}</p>
            <h1 className="mt-1 text-3xl font-bold text-ink lg:text-2xl">Panel de gestión</h1>
            <p className="mt-2 text-sm leading-6 text-ink/60">Administrá reservas, canchas y textos principales del sitio.</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Link
              href="/"
              className="focus-ring inline-flex items-center justify-center gap-2 rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm font-semibold text-ink hover:bg-field-50 lg:py-2"
            >
              <Home size={17} />
              Volver al sitio
            </Link>
            <form action={signOut}>
              <SubmitButton pendingText="Saliendo..." className="w-full gap-2 border border-black/10 bg-ink px-4 py-2.5 text-white hover:bg-black lg:py-2">
                <LogOut size={17} />
                Cerrar sesión
              </SubmitButton>
            </form>
          </div>
        </div>
      </header>

      <div className="container-page grid gap-8 py-8 lg:gap-6 lg:py-6">
        {success ? <ActionNotice type="success" code={success} /> : null}
        {error ? <ActionNotice type="error" code={error} /> : null}
        {hasLoadError ? (
          <ErrorMessage>No se pudieron cargar todos los datos del panel. Verificá las políticas de administrador en Supabase.</ErrorMessage>
        ) : null}

        <AdminTabs />

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5 lg:gap-3">
          <MetricCard icon={LayoutDashboard} title="Reservas totales" value={typedReservations.length.toString()} text="Turnos registrados" />
          <MetricCard icon={Clock3} title="Pendientes" value={pendingCount.toString()} text="Solicitudes por revisar" />
          <MetricCard icon={CheckCircle2} title="Confirmadas" value={confirmedCount.toString()} text="Turnos aprobados" />
          <MetricCard icon={XCircle} title="Canceladas" value={cancelledCount.toString()} text="Turnos dados de baja" />
          <MetricCard icon={CircleDollarSign} title="Ingresos estimados" value={currency(confirmedIncome)} text="Reservas confirmadas" />
        </section>

        <AdminReservationsSection reservations={typedReservations} courts={typedCourts} />
        <AdminCourtsSection courts={typedCourts} />

        <section id="configuracion" className="rounded-2xl border border-black/8 bg-white p-5 shadow-soft scroll-mt-24 lg:p-4">
          <div className="mb-5">
            <p className="font-semibold text-field-700">Configuración</p>
            <h2 className="text-2xl font-bold text-ink lg:text-xl">Textos principales del sitio</h2>
            <p className="mt-1 text-sm leading-6 text-ink/58">Actualizá marca, inicio, contacto y footer sin tocar código.</p>
          </div>
          <SiteSettingsForm settings={settings} />
        </section>
      </div>
    </main>
  );
}

function AccessDenied() {
  return (
    <main className="min-h-screen bg-[#f7faf7]">
      <div className="container-page grid min-h-screen place-items-center py-12 lg:py-10">
        <section className="max-w-lg rounded-2xl border border-black/8 bg-white p-8 text-center shadow-soft">
          <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-red-50 text-red-700">
            <ShieldAlert size={28} />
          </div>
          <h1 className="mt-5 text-3xl font-bold text-ink">Acceso denegado</h1>
          <p className="mt-3 text-sm leading-6 text-ink/65">
            Tu usuario está autenticado, pero no tiene permisos de administrador para ingresar al panel de gestión.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/"
              className="focus-ring inline-flex items-center justify-center gap-2 rounded-xl border border-black/10 bg-white px-5 py-3 text-sm font-semibold text-ink hover:bg-field-50"
            >
              <Home size={17} />
              Volver al sitio
            </Link>
            <form action={signOut}>
              <SubmitButton pendingText="Saliendo..." className="bg-ink px-5 py-3 text-white">
                Cerrar sesión
              </SubmitButton>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}

function SiteSettingsForm({ settings }: { settings: SiteSettings }) {
  return (
    <form action={updateSiteSettings} className="grid gap-5">
      <SettingsBlock title="Marca" description="Datos que identifican al club y al sitio.">
        <div className="grid gap-4 md:grid-cols-2">
          <AdminField label="Nombre del club">
            <input name="club_name" defaultValue={settings.club_name} className="admin-input" required />
          </AdminField>
          <AdminField label="Nombre del sitio">
            <input name="site_name" defaultValue={settings.site_name} className="admin-input" required />
          </AdminField>
        </div>
      </SettingsBlock>

      <SettingsBlock title="Página de inicio" description="Textos visibles en la portada pública.">
        <div className="grid gap-4">
          <AdminField label="Texto destacado superior">
            <input name="hero_badge_text" defaultValue={settings.hero_badge_text} className="admin-input" required />
          </AdminField>
          <AdminField label="Título principal">
            <input name="hero_title" defaultValue={settings.hero_title} className="admin-input" required />
          </AdminField>
          <AdminField label="Subtítulo principal">
            <textarea name="hero_subtitle" defaultValue={settings.hero_subtitle} className="admin-input min-h-24" required />
          </AdminField>
          <div className="grid gap-4 md:grid-cols-2">
            <AdminField label="Botón principal">
              <input name="primary_cta_label" defaultValue={settings.primary_cta_label} className="admin-input" required />
            </AdminField>
            <AdminField label="Título de tarjeta home">
              <input name="home_card_title" defaultValue={settings.home_card_title} className="admin-input" required />
            </AdminField>
          </div>
          <AdminField label="Subtítulo de tarjeta home">
            <input name="home_card_subtitle" defaultValue={settings.home_card_subtitle} className="admin-input" required />
          </AdminField>
        </div>
      </SettingsBlock>

      <SettingsBlock title="Contacto" description="Información para que los jugadores encuentren y contacten al club.">
        <div className="grid gap-4 md:grid-cols-2">
          <AdminField label="Ubicación">
            <input name="location" defaultValue={settings.location} className="admin-input" required />
          </AdminField>
          <AdminField label="Horarios">
            <input name="opening_hours" defaultValue={settings.opening_hours} className="admin-input" required />
          </AdminField>
          <AdminField label="Teléfono">
            <input name="phone" defaultValue={settings.phone} className="admin-input" required />
          </AdminField>
          <AdminField label="WhatsApp">
            <input name="whatsapp" defaultValue={settings.whatsapp} className="admin-input" required />
          </AdminField>
          <AdminField label="Email">
            <input name="email" type="email" defaultValue={settings.email} className="admin-input" required />
          </AdminField>
        </div>
      </SettingsBlock>

      <SettingsBlock title="Footer" description="Texto breve que aparece al pie del sitio.">
        <AdminField label="Texto del footer">
          <textarea name="footer_description" defaultValue={settings.footer_description} className="admin-input min-h-24" required />
        </AdminField>
      </SettingsBlock>

      <div className="flex justify-end">
        <SubmitButton pendingText="Guardando..." className="bg-field-600 px-5 py-3 text-white hover:bg-field-700 lg:py-2.5">
          Guardar configuración
        </SubmitButton>
      </div>
    </form>
  );
}

function SettingsBlock({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-black/8 bg-[#fbfdfb] p-4 lg:p-3.5">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-ink lg:text-base">{title}</h3>
        <p className="mt-1 text-sm leading-6 text-ink/58">{description}</p>
      </div>
      {children}
    </section>
  );
}

function AdminField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-semibold text-ink">{label}</span>
      {children}
    </label>
  );
}

function MetricCard({
  icon: Icon,
  title,
  value,
  text
}: {
  icon: LucideIcon;
  title: string;
  value: string;
  text: string;
}) {
  return (
    <article className="rounded-2xl border border-black/8 bg-white p-5 shadow-sm lg:p-4">
      <Icon className="text-field-700" size={22} />
      <p className="mt-4 text-sm font-semibold text-field-700 lg:mt-3">{title}</p>
      <p className="mt-2 text-3xl font-bold text-ink lg:text-2xl">{value}</p>
      <p className="mt-1 text-sm text-ink/55">{text}</p>
    </article>
  );
}

function ActionNotice({ type, code }: { type: "success" | "error"; code: string }) {
  const successMessages: Record<string, string> = {
    "reservation-status": "Estado guardado. La disponibilidad se actualizó automáticamente.",
    "reservation-delete": "Reserva eliminada. Ya no aparece en el listado.",
    "court-update": "Cancha guardada correctamente.",
    "settings-update": "Configuración guardada. Los textos públicos ya quedaron actualizados."
  };
  const errorMessages: Record<string, string> = {
    "reservation-status": "No pudimos guardar el estado de la reserva. Revisá los permisos de Supabase e intentá nuevamente.",
    "reservation-delete": "No pudimos eliminar la reserva. Revisá los permisos de Supabase e intentá nuevamente.",
    "court-slug-duplicate": "No pudimos guardar la cancha porque el slug ya existe. Usá otro texto para la URL.",
    "court-permissions": "No pudimos guardar la cancha por permisos de Supabase. Verificá las policies de administrador para courts.",
    "court-required-field": "No pudimos guardar la cancha porque falta un campo obligatorio o algún valor no cumple las reglas.",
    "court-schema": "No pudimos guardar la cancha porque faltan columnas en la tabla courts. Ejecutá el SQL de canchas admin.",
    "court-update": "No pudimos guardar la cancha por un error inesperado. Revisá la consola del servidor para ver el detalle real.",
    "settings-update": "No pudimos guardar la configuración. Revisá los permisos de Supabase e intentá nuevamente."
  };
  const fallback = type === "success" ? "La acción se completó correctamente." : "No pudimos completar la acción. Intentá nuevamente.";

  if (type === "error") {
    return <ErrorMessage>{errorMessages[code] ?? fallback}</ErrorMessage>;
  }

  return (
    <div className="flex items-center gap-3 rounded-xl border border-field-100 bg-field-50 px-4 py-3 text-sm font-semibold text-field-700">
      <CheckCircle2 size={18} />
      {successMessages[code] ?? fallback}
    </div>
  );
}
