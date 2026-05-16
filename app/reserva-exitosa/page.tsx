import { CheckCircle2, Home, Mail, MessageCircle, Phone } from "lucide-react";
import { ButtonLink } from "@/components/ButtonLink";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { brand } from "@/lib/brand";
import { isUuid } from "@/lib/court-slugs";
import { hasSupabaseEnv } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { currency, formatDate } from "@/lib/utils";

type ReservationReceipt = {
  reservation_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  reservation_date: string;
  start_time: string;
  end_time: string;
  status: "pending" | "confirmed" | "cancelled";
  total_price: number | null;
  court_name: string;
  court_slug: string;
  sport_type: string;
  surface: string | null;
  location: string | null;
  price_per_hour: number;
};

const statusLabels: Record<ReservationReceipt["status"], string> = {
  pending: "Pendiente de confirmación",
  confirmed: "Confirmada",
  cancelled: "Cancelada"
};

export default async function SuccessPage({
  searchParams
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;
  const receipt = id ? await getReceipt(id) : null;

  return (
    <>
      <SiteHeader />
      <main className="container-page grid min-h-[72vh] place-items-center py-12">
        <section className="w-full max-w-3xl rounded-[28px] border border-black/8 bg-white p-6 shadow-soft sm:p-8 lg:p-10">
          <div className="text-center">
            <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-field-50 text-field-700">
              <CheckCircle2 size={34} />
            </div>
            <h1 className="mt-6 text-3xl font-bold text-ink sm:text-4xl">Reserva recibida</h1>
            <p className="mx-auto mt-3 max-w-xl leading-7 text-ink/65">
              Guardamos tu solicitud correctamente. El equipo de {brand.clubName} revisará el turno y podrá contactarte para confirmarlo.
            </p>
          </div>

          {receipt ? <ReceiptCard receipt={receipt} /> : <MissingReceipt />}

          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <ButtonLink href="/canchas">Reservar otra cancha</ButtonLink>
            <ButtonLink href="/" variant="secondary" className="gap-2">
              <Home size={18} />
              Volver al inicio
            </ButtonLink>
            <a
              className="focus-ring inline-flex items-center justify-center gap-2 rounded-lg border border-black/10 bg-white px-5 py-3 text-sm font-semibold text-ink transition hover:bg-field-50"
              href={`https://wa.me/5491123456789`}
              target="_blank"
              rel="noreferrer"
            >
              <MessageCircle size={18} />
              Contactar por WhatsApp
            </a>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

async function getReceipt(id: string) {
  if (!hasSupabaseEnv() || !isUuid(id)) {
    return null;
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("get_reservation_receipt", {
    p_reservation_id: id
  });

  if (error) {
    if (process.env.NODE_ENV === "development") {
      console.error(error);
    }
    return null;
  }

  if (!Array.isArray(data)) {
    return null;
  }

  return (data[0] ?? null) as ReservationReceipt | null;
}

function ReceiptCard({ receipt }: { receipt: ReservationReceipt }) {
  return (
    <div className="mt-8 rounded-2xl border border-black/8 bg-[#fbfdfb] p-5 sm:p-6">
      <div className="flex flex-col gap-3 border-b border-black/8 pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-field-700">Comprobante de reserva</p>
          <h2 className="mt-1 text-2xl font-bold text-ink">{receipt.court_name}</h2>
          <p className="mt-1 text-sm text-ink/58">
            {receipt.sport_type}
            {receipt.surface ? ` · ${receipt.surface}` : ""}
          </p>
        </div>
        <span className="self-start rounded-full bg-yellow-50 px-4 py-2 text-sm font-bold text-yellow-800">
          {statusLabels[receipt.status]}
        </span>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <SummaryItem label="Cliente" value={receipt.customer_name} />
        <SummaryItem label="Cancha" value={receipt.court_name} />
        <SummaryItem label="Deporte" value={receipt.sport_type} />
        <SummaryItem label="Fecha" value={formatDate(receipt.reservation_date)} />
        <SummaryItem label="Horario" value={`${formatTime(receipt.start_time)} a ${formatTime(receipt.end_time)}`} />
        <SummaryItem label="Precio estimado" value={currency(receipt.total_price ?? receipt.price_per_hour)} />
        <SummaryItem label="Estado" value={statusLabels[receipt.status]} />
        {receipt.location ? <SummaryItem label="Ubicación" value={receipt.location} /> : null}
      </div>

      <div className="mt-5 grid gap-3 rounded-2xl bg-white p-4 sm:grid-cols-2">
        <p className="flex items-center gap-2 text-sm font-semibold text-ink/68">
          <Mail size={17} className="text-field-700" />
          {receipt.customer_email}
        </p>
        <p className="flex items-center gap-2 text-sm font-semibold text-ink/68">
          <Phone size={17} className="text-field-700" />
          {receipt.customer_phone}
        </p>
      </div>
    </div>
  );
}

function MissingReceipt() {
  return (
    <div className="mt-8 rounded-2xl border border-yellow-200 bg-yellow-50 p-5 text-center">
      <h2 className="text-lg font-bold text-ink">No pudimos cargar el detalle de la reserva</h2>
      <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-ink/65">
        La solicitud pudo haberse registrado correctamente, pero no encontramos el comprobante en este momento. Podés contactarnos por WhatsApp o realizar otra reserva.
      </p>
    </div>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink/45">{label}</p>
      <p className="mt-1 text-base font-bold text-ink">{value}</p>
    </div>
  );
}

function formatTime(value: string) {
  return value.slice(0, 5);
}
