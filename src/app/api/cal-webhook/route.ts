import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getAdminDb } from "@/lib/firebase/admin";
import { Timestamp } from "firebase-admin/firestore";
import { Resend } from "resend";

const SERVICE_MAP: Record<string, string> = {
  "adaptacion-puesto-trabajo": "Adaptación de Puesto de Trabajo",
  "atencion-temprana": "Atención Temprana",
  "babysitting-terapeutico": "Babysitting Terapéutico",
};

function verifySignature(body: string, signature: string | null): boolean {
  const secret = process.env.CAL_WEBHOOK_SECRET;
  if (!secret || !signature) return false;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex");
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expected)
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("es-CL", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Santiago",
  });
}

function getResend(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  return new Resend(apiKey);
}

function getFromEmail(): string {
  return process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
}

async function lookupProfessional(db: FirebaseFirestore.Firestore) {
  const proSnap = await db
    .collection("users")
    .where("role", "==", "profesional")
    .limit(1)
    .get();

  if (proSnap.empty) {
    return {
      professionalId: "unknown",
      professionalName: "Bárbara Alarcón Villafaña",
      professionalEmail: null as string | null,
    };
  }

  const proData = proSnap.docs[0].data();
  return {
    professionalId: proData.uid || "unknown",
    professionalName: proData.displayName || "Bárbara Alarcón Villafaña",
    professionalEmail: (proData.email as string) || null,
  };
}

async function sendConfirmationEmails(
  patientEmail: string,
  patientName: string,
  professionalEmail: string | null,
  professionalName: string,
  serviceName: string,
  dateStr: string
) {
  const resend = getResend();
  if (!resend) return;

  const from = getFromEmail();
  const formattedDate = formatDate(dateStr);

  const patientHtml = `
    <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f3f4f6; padding: 40px 20px;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        <div style="background-color: #4361EE; padding: 32px 24px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">¡Cita Confirmada! 🎉</h1>
        </div>
        <div style="padding: 32px 24px;">
          <p style="margin-top: 0; font-size: 16px; color: #374151; line-height: 1.5;">Hola <strong>${patientName}</strong>,</p>
          <p style="font-size: 16px; color: #4B5563; line-height: 1.5;">Tu sesión ha sido agendada con éxito. Aquí tienes los detalles:</p>
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; margin: 24px 0;">
            <table width="100%" cellpadding="0" cellspacing="0" style="font-size: 15px;">
              <tr>
                <td style="padding-bottom: 12px; color: #64748b; width: 100px;">Servicio:</td>
                <td style="padding-bottom: 12px; color: #0f172a; font-weight: 600;">${serviceName}</td>
              </tr>
              <tr>
                <td style="padding-bottom: 12px; color: #64748b;">Especialista:</td>
                <td style="padding-bottom: 12px; color: #0f172a; font-weight: 600;">${professionalName}</td>
              </tr>
              <tr>
                <td style="color: #64748b;">Fecha y Hora:</td>
                <td style="color: #0f172a; font-weight: 600;">${formattedDate}</td>
              </tr>
            </table>
          </div>
          <p style="font-size: 14px; color: #64748b; line-height: 1.5; margin-bottom: 0;">
            Recuerda que si necesitas reprogramar o cancelar, puedes hacerlo contactándonos directamente. ¡Nos vemos pronto!
          </p>
        </div>
        <div style="background-color: #f8fafc; padding: 24px; text-align: center; border-top: 1px solid #e2e8f0;">
          <p style="margin: 0; font-size: 13px; color: #94a3b8;">
            © ${new Date().getFullYear()} Terapia en Fácil. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </div>
  `;

  const professionalHtml = `
    <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f3f4f6; padding: 40px 20px;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        <div style="background-color: #2DC653; padding: 32px 24px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">Nueva Cita Agendada 🗓️</h1>
        </div>
        <div style="padding: 32px 24px;">
          <p style="margin-top: 0; font-size: 16px; color: #374151; line-height: 1.5;">Hola <strong>${professionalName}</strong>,</p>
          <p style="font-size: 16px; color: #4B5563; line-height: 1.5;">Tienes una nueva cita agendada en tu calendario:</p>
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; margin: 24px 0;">
            <table width="100%" cellpadding="0" cellspacing="0" style="font-size: 15px;">
              <tr>
                <td style="padding-bottom: 12px; color: #64748b; width: 100px;">Paciente:</td>
                <td style="padding-bottom: 12px; color: #0f172a; font-weight: 600;">${patientName} <span style="color:#64748b;font-weight:normal;font-size:13px;">(${patientEmail})</span></td>
              </tr>
              <tr>
                <td style="padding-bottom: 12px; color: #64748b;">Servicio:</td>
                <td style="padding-bottom: 12px; color: #0f172a; font-weight: 600;">${serviceName}</td>
              </tr>
              <tr>
                <td style="color: #64748b;">Fecha y Hora:</td>
                <td style="color: #0f172a; font-weight: 600;">${formattedDate}</td>
              </tr>
            </table>
          </div>
        </div>
        <div style="background-color: #f8fafc; padding: 24px; text-align: center; border-top: 1px solid #e2e8f0;">
          <p style="margin: 0; font-size: 13px; color: #94a3b8;">
            Terapia en Fácil
          </p>
        </div>
      </div>
    </div>
  `;

  const emails: Promise<unknown>[] = [
    resend.emails.send({
      from,
      to: patientEmail,
      subject: `Cita confirmada: ${serviceName}`,
      html: patientHtml,
    }),
  ];

  if (professionalEmail) {
    emails.push(
      resend.emails.send({
        from,
        to: professionalEmail,
        subject: `Nueva cita: ${patientName} — ${serviceName}`,
        html: professionalHtml,
      })
    );
  }

  await Promise.allSettled(emails);
}

async function sendCancellationEmails(
  patientEmail: string,
  patientName: string,
  professionalEmail: string | null,
  professionalName: string,
  serviceName: string,
  dateStr: string
) {
  const resend = getResend();
  if (!resend) return;

  const from = getFromEmail();
  const formattedDate = formatDate(dateStr);

  const patientHtml = `
    <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f3f4f6; padding: 40px 20px;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        <div style="background-color: #FF4757; padding: 32px 24px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">Cita Cancelada ⚠️</h1>
        </div>
        <div style="padding: 32px 24px;">
          <p style="margin-top: 0; font-size: 16px; color: #374151; line-height: 1.5;">Hola <strong>${patientName}</strong>,</p>
          <p style="font-size: 16px; color: #4B5563; line-height: 1.5;">Te informamos que tu cita ha sido cancelada:</p>
          <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 12px; padding: 24px; margin: 24px 0;">
            <table width="100%" cellpadding="0" cellspacing="0" style="font-size: 15px;">
              <tr>
                <td style="padding-bottom: 12px; color: #991b1b; width: 100px;">Servicio:</td>
                <td style="padding-bottom: 12px; color: #7f1d1d; font-weight: 600;">${serviceName}</td>
              </tr>
              <tr>
                <td style="padding-bottom: 12px; color: #991b1b;">Especialista:</td>
                <td style="padding-bottom: 12px; color: #7f1d1d; font-weight: 600;">${professionalName}</td>
              </tr>
              <tr>
                <td style="color: #991b1b;">Fecha y Hora:</td>
                <td style="color: #7f1d1d; font-weight: 600;">${formattedDate}</td>
              </tr>
            </table>
          </div>
          <p style="font-size: 14px; color: #64748b; line-height: 1.5; margin-bottom: 0;">
            Si deseas reagendar en otro momento, estaremos felices de atenderte. Visita nuestro sitio web cuando lo requieras.
          </p>
        </div>
        <div style="background-color: #f8fafc; padding: 24px; text-align: center; border-top: 1px solid #e2e8f0;">
          <p style="margin: 0; font-size: 13px; color: #94a3b8;">
            © ${new Date().getFullYear()} Terapia en Fácil. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </div>
  `;

  const professionalHtml = `
    <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f3f4f6; padding: 40px 20px;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        <div style="background-color: #FF4757; padding: 32px 24px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">Cita Cancelada ⚠️</h1>
        </div>
        <div style="padding: 32px 24px;">
          <p style="margin-top: 0; font-size: 16px; color: #374151; line-height: 1.5;">Hola <strong>${professionalName}</strong>,</p>
          <p style="font-size: 16px; color: #4B5563; line-height: 1.5;">Se ha cancelado la siguiente cita en tu calendario:</p>
          <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 12px; padding: 24px; margin: 24px 0;">
            <table width="100%" cellpadding="0" cellspacing="0" style="font-size: 15px;">
              <tr>
                <td style="padding-bottom: 12px; color: #991b1b; width: 100px;">Paciente:</td>
                <td style="padding-bottom: 12px; color: #7f1d1d; font-weight: 600;">${patientName} <span style="color:#b91c1c;font-weight:normal;font-size:13px;">(${patientEmail})</span></td>
              </tr>
              <tr>
                <td style="padding-bottom: 12px; color: #991b1b;">Servicio:</td>
                <td style="padding-bottom: 12px; color: #7f1d1d; font-weight: 600;">${serviceName}</td>
              </tr>
              <tr>
                <td style="color: #991b1b;">Fecha y Hora:</td>
                <td style="color: #7f1d1d; font-weight: 600;">${formattedDate}</td>
              </tr>
            </table>
          </div>
        </div>
        <div style="background-color: #f8fafc; padding: 24px; text-align: center; border-top: 1px solid #e2e8f0;">
          <p style="margin: 0; font-size: 13px; color: #94a3b8;">
            Terapia en Fácil
          </p>
        </div>
      </div>
    </div>
  `;

  const emails: Promise<unknown>[] = [
    resend.emails.send({
      from,
      to: patientEmail,
      subject: `Cita cancelada: ${serviceName}`,
      html: patientHtml,
    }),
  ];

  if (professionalEmail) {
    emails.push(
      resend.emails.send({
        from,
        to: professionalEmail,
        subject: `Cita cancelada: ${patientName} — ${serviceName}`,
        html: professionalHtml,
      })
    );
  }

  await Promise.allSettled(emails);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleBookingCreated(payload: any) {
  const attendee = payload?.attendees?.[0];
  if (!attendee?.email) {
    return NextResponse.json({ error: "No attendee email" }, { status: 400 });
  }

  const db = getAdminDb();

  // Find patient by email
  const usersSnap = await db
    .collection("users")
    .where("email", "==", attendee.email)
    .limit(1)
    .get();

  let userId = "unknown";
  let userName = attendee.name || "Paciente";
  let userEmail = attendee.email;

  if (!usersSnap.empty) {
    const userData = usersSnap.docs[0].data();
    userId = userData.uid;
    userName = userData.displayName || userName;
    userEmail = userData.email || userEmail;
  }

  const { professionalId, professionalName, professionalEmail } =
    await lookupProfessional(db);

  // Map service
  const eventSlug = payload.type || payload.eventType?.slug || "";
  const serviceSlug = eventSlug;
  const serviceName = SERVICE_MAP[eventSlug] || payload.title || eventSlug;

  // Parse date
  const startTime = payload.startTime || new Date().toISOString();
  const date = Timestamp.fromDate(new Date(startTime));
  const now = Timestamp.now();

  await db.collection("appointments").add({
    userId,
    userEmail,
    userName,
    professionalId,
    professionalName,
    serviceSlug,
    serviceName,
    date,
    status: "confirmed",
    createdAt: now,
    notes: "",
  });

  await sendConfirmationEmails(
    userEmail,
    userName,
    professionalEmail,
    professionalName,
    serviceName,
    startTime
  );

  return NextResponse.json({ ok: true });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleBookingCancelled(payload: any) {
  const attendee = payload?.attendees?.[0];
  if (!attendee?.email) {
    return NextResponse.json({ error: "No attendee email" }, { status: 400 });
  }

  const db = getAdminDb();

  const startTime = payload.startTime || "";
  if (!startTime) {
    return NextResponse.json({ error: "No startTime" }, { status: 400 });
  }

  const appointmentDate = new Date(startTime);
  const windowBefore = new Date(appointmentDate.getTime() - 60_000);
  const windowAfter = new Date(appointmentDate.getTime() + 60_000);

  // Find the matching confirmed appointment
  const snap = await db
    .collection("appointments")
    .where("userEmail", "==", attendee.email)
    .where("status", "==", "confirmed")
    .where("date", ">=", Timestamp.fromDate(windowBefore))
    .where("date", "<=", Timestamp.fromDate(windowAfter))
    .limit(1)
    .get();

  if (snap.empty) {
    return NextResponse.json({ ok: true, message: "No matching appointment found" });
  }

  const appointmentDoc = snap.docs[0];
  const appointmentData = appointmentDoc.data();

  await appointmentDoc.ref.update({ status: "cancelled" });

  const { professionalName, professionalEmail } = await lookupProfessional(db);

  const serviceName =
    appointmentData.serviceName ||
    SERVICE_MAP[appointmentData.serviceSlug] ||
    appointmentData.serviceSlug;

  await sendCancellationEmails(
    attendee.email,
    appointmentData.userName || attendee.name || "Paciente",
    professionalEmail,
    professionalName,
    serviceName,
    startTime
  );

  return NextResponse.json({ ok: true, cancelled: appointmentDoc.id });
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-cal-signature-256");

  if (!verifySignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let parsed;
  try {
    parsed = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const triggerEvent = parsed.triggerEvent;
  const payload = parsed.payload;

  switch (triggerEvent) {
    case "BOOKING_CREATED":
      return handleBookingCreated(payload);
    case "BOOKING_CANCELLED":
      return handleBookingCancelled(payload);
    default:
      return NextResponse.json({ ok: true, ignored: triggerEvent });
  }
}
