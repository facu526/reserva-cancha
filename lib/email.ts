import { brand } from "@/lib/brand";
import { currency, formatDate } from "@/lib/utils";

type ReservationConfirmationEmail = {
  customerName: string;
  customerEmail: string;
  courtName: string;
  sportType: string;
  reservationDate: string;
  startTime: string;
  endTime: string;
  totalPrice: number;
};

export async function sendReservationConfirmationEmail({
  customerName,
  customerEmail,
  courtName,
  sportType,
  reservationDate,
  startTime,
  endTime,
  totalPrice
}: ReservationConfirmationEmail) {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.info("RESEND_API_KEY no está configurada. La reserva se guardó, pero no se envió email de confirmación.");
    return;
  }

  const formattedDate = formatDate(reservationDate);
  const formattedTime = `${startTime.slice(0, 5)} a ${endTime.slice(0, 5)}`;
  const formattedPrice = currency(totalPrice);

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: "Club Deportivo Norte <onboarding@resend.dev>",
        to: customerEmail,
        subject: `Reserva recibida - ${courtName}`,
        html: buildReservationEmailHtml({
          customerName,
          courtName,
          sportType,
          formattedDate,
          formattedTime,
          formattedPrice
        })
      }),
      signal: AbortSignal.timeout(2500)
    });

    if (!response.ok) {
      const details = await response.text();
      console.error("No se pudo enviar el email de confirmación de reserva.", details);
    }
  } catch (error) {
    console.error("No se pudo enviar el email de confirmación de reserva.", error);
  }
}

function buildReservationEmailHtml({
  customerName,
  courtName,
  sportType,
  formattedDate,
  formattedTime,
  formattedPrice
}: {
  customerName: string;
  courtName: string;
  sportType: string;
  formattedDate: string;
  formattedTime: string;
  formattedPrice: string;
}) {
  const safeCustomerName = escapeHtml(customerName);
  const safeCourtName = escapeHtml(courtName);
  const safeSportType = escapeHtml(sportType);

  return `
    <div style="font-family: Arial, sans-serif; background: #f6faf7; padding: 24px; color: #101510;">
      <div style="max-width: 620px; margin: 0 auto; background: #ffffff; border: 1px solid #e6eee8; border-radius: 18px; overflow: hidden;">
        <div style="background: #101510; color: #ffffff; padding: 28px;">
          <p style="margin: 0 0 8px; color: #9ce3b4; font-size: 13px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase;">${brand.clubName}</p>
          <h1 style="margin: 0; font-size: 28px; line-height: 1.2;">Reserva recibida</h1>
        </div>
        <div style="padding: 28px;">
          <p style="margin: 0 0 18px; font-size: 16px; line-height: 1.6;">Hola ${safeCustomerName}, recibimos tu solicitud de reserva. El equipo de ${brand.clubName} revisará el turno y podrá contactarte para confirmarlo.</p>
          <div style="border: 1px solid #e6eee8; border-radius: 14px; padding: 18px; background: #fbfdfb;">
            ${emailRow("Cancha", safeCourtName)}
            ${emailRow("Deporte", safeSportType)}
            ${emailRow("Fecha", formattedDate)}
            ${emailRow("Horario", formattedTime)}
            ${emailRow("Precio estimado", formattedPrice)}
            ${emailRow("Estado", "Pendiente de confirmación")}
          </div>
          <p style="margin: 22px 0 0; font-size: 15px; line-height: 1.6; color: #4d5a50;">Ante cualquier consulta, podés escribirnos por WhatsApp: <strong>${brand.whatsapp}</strong>.</p>
        </div>
      </div>
    </div>
  `;
}

function emailRow(label: string, value: string) {
  return `
    <p style="display: flex; justify-content: space-between; gap: 16px; margin: 0; padding: 11px 0; border-bottom: 1px solid #e6eee8; font-size: 15px;">
      <span style="color: #667268;">${label}</span>
      <strong style="color: #101510; text-align: right;">${value}</strong>
    </p>
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
