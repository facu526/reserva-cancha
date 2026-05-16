import { brand } from "@/lib/brand";
import type { ReservationStatus } from "@/lib/types";
import { currency, formatDate } from "@/lib/utils";

type ReservationEmailData = {
  customerName: string;
  customerEmail: string;
  courtName: string;
  sportType: string;
  reservationDate: string;
  startTime: string;
  endTime: string;
  totalPrice?: number | null;
};

const statusLabels: Record<Exclude<ReservationStatus, "pending">, string> = {
  confirmed: "Confirmada",
  cancelled: "Cancelada"
};

export async function sendReservationCreatedEmail(data: ReservationEmailData) {
  await sendReservationEmail({
    to: data.customerEmail,
    subject: `Reserva recibida - ${data.courtName}`,
    title: "Reserva recibida",
    intro: `Hola ${data.customerName}, recibimos tu solicitud de reserva. El equipo de ${brand.clubName} revisará el turno y podrá contactarte para confirmarlo.`,
    rows: reservationRows(data, "Pendiente de confirmación", true)
  });
}

export async function sendReservationStatusEmail(data: ReservationEmailData & { status: Extract<ReservationStatus, "confirmed" | "cancelled"> }) {
  const isConfirmed = data.status === "confirmed";
  const readableStatus = statusLabels[data.status];

  await sendReservationEmail({
    to: data.customerEmail,
    subject: `Reserva ${isConfirmed ? "confirmada" : "cancelada"} - ${data.courtName}`,
    title: `Reserva ${isConfirmed ? "confirmada" : "cancelada"}`,
    intro: isConfirmed
      ? `Hola ${data.customerName}, tu reserva fue confirmada. Te esperamos en ${brand.clubName}.`
      : `Hola ${data.customerName}, tu reserva fue cancelada. Si creés que fue un error, podés contactarnos por WhatsApp.`,
    rows: reservationRows(data, readableStatus, isConfirmed)
  });
}

async function sendReservationEmail({
  to,
  subject,
  title,
  intro,
  rows
}: {
  to: string;
  subject: string;
  title: string;
  intro: string;
  rows: { label: string; value: string }[];
}) {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.info("RESEND_API_KEY no está configurada. La operación se completó, pero no se envió email.");
    return;
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: "Club Deportivo Norte <onboarding@resend.dev>",
        to,
        subject,
        html: buildReservationEmailHtml({ title, intro, rows })
      }),
      signal: AbortSignal.timeout(2500)
    });

    if (!response.ok) {
      const details = await response.text();
      console.error("No se pudo enviar el email de reserva.", details);
    }
  } catch (error) {
    console.error("No se pudo enviar el email de reserva.", error);
  }
}

function reservationRows(data: ReservationEmailData, status: string, includePrice: boolean) {
  const rows = [
    { label: "Cancha", value: data.courtName },
    { label: "Deporte", value: data.sportType },
    { label: "Fecha", value: formatDate(data.reservationDate) },
    { label: "Horario", value: `${data.startTime.slice(0, 5)} a ${data.endTime.slice(0, 5)}` }
  ];

  if (includePrice && typeof data.totalPrice === "number") {
    rows.push({ label: "Precio estimado", value: currency(data.totalPrice) });
  }

  rows.push({ label: "Estado", value: status });
  return rows;
}

function buildReservationEmailHtml({
  title,
  intro,
  rows
}: {
  title: string;
  intro: string;
  rows: { label: string; value: string }[];
}) {
  return `
    <div style="margin:0;padding:0;background:#f6faf7;color:#101510;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="width:100%;border-collapse:collapse;background:#f6faf7;">
        <tr>
          <td style="padding:24px 12px;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;margin:0 auto;border-collapse:collapse;background:#ffffff;border:1px solid #e6eee8;border-radius:18px;overflow:hidden;font-family:Arial,sans-serif;">
              <tr>
                <td style="background:#101510;color:#ffffff;padding:28px;">
                  <p style="margin:0 0 8px;color:#9ce3b4;font-size:13px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">${escapeHtml(brand.clubName)}</p>
                  <h1 style="margin:0;font-size:28px;line-height:1.2;color:#ffffff;">${escapeHtml(title)}</h1>
                </td>
              </tr>
              <tr>
                <td style="padding:28px;">
                  <p style="margin:0 0 20px;font-size:16px;line-height:1.6;color:#253026;">${escapeHtml(intro)}</p>
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="width:100%;border-collapse:collapse;background:#fbfdfb;border:1px solid #e6eee8;border-radius:14px;">
                    ${rows.map((row) => emailRow(row.label, row.value)).join("")}
                  </table>
                  <p style="margin:22px 0 0;font-size:15px;line-height:1.6;color:#4d5a50;">Ante cualquier consulta, podés escribirnos por WhatsApp: <strong style="color:#101510;">${escapeHtml(brand.whatsapp)}</strong>.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </div>
  `;
}

function emailRow(label: string, value: string) {
  return `
    <tr>
      <td style="padding:12px 16px;border-bottom:1px solid #e6eee8;color:#667268;font-size:15px;line-height:1.4;width:42%;vertical-align:top;">${escapeHtml(label)}:</td>
      <td style="padding:12px 16px;border-bottom:1px solid #e6eee8;color:#101510;font-size:15px;line-height:1.4;font-weight:700;vertical-align:top;">${escapeHtml(value)}</td>
    </tr>
  `;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
