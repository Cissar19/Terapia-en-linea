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
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #fafafa; padding: 48px 20px;">
      <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; border: 1px solid #e5e7eb; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
        <div style="padding: 40px 32px;">
          <h1 style="color: #111827; margin: 0 0 8px 0; font-size: 20px; font-weight: 600; letter-spacing: -0.5px;">Cita confirmada</h1>
          <p style="margin: 0 0 32px 0; font-size: 15px; color: #4b5563; line-height: 1.5;">Hola ${patientName}, tu sesión ha sido agendada con éxito.</p>
          
          <div style="background-color: #f9fafb; border-radius: 8px; padding: 24px; margin-bottom: 32px;">
            <div style="margin-bottom: 16px;">
              <p style="margin: 0; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">Servicio</p>
              <p style="margin: 4px 0 0 0; font-size: 16px; color: #111827; font-weight: 500;">${serviceName}</p>
            </div>
            <div style="margin-bottom: 16px;">
              <p style="margin: 0; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">Profesional</p>
              <p style="margin: 4px 0 0 0; font-size: 16px; color: #111827;">${professionalName}</p>
            </div>
            <div>
              <p style="margin: 0; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">Fecha y Hora</p>
              <p style="margin: 4px 0 0 0; font-size: 16px; color: #111827;">${formattedDate}</p>
            </div>
          </div>
          
          <p style="font-size: 14px; color: #6b7280; line-height: 1.6; margin: 0;">
            Si necesitas reagendar o cancelar la cita, por favor contáctanos con anticipación. ¡Nos vemos pronto!
          </p>
        </div>
        <div style="background-color: #f9fafb; padding: 24px 32px; border-top: 1px solid #e5e7eb;">
          <p style="margin: 0; font-size: 13px; color: #9ca3af; text-align: center;">
            Terapia en Fácil
          </p>
        </div>
      </div>
    </div>
  `;

  const professionalHtml = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #fafafa; padding: 48px 20px;">
      <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; border: 1px solid #e5e7eb; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
        <div style="padding: 40px 32px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
            <h1 style="color: #111827; margin: 0; font-size: 20px; font-weight: 600; letter-spacing: -0.5px;">Nueva cita</h1>
            <span style="background-color: #dcfce7; color: #166534; padding: 4px 8px; border-radius: 9999px; font-size: 12px; font-weight: 500;">Confirmada</span>
          </div>
          <p style="margin: 0 0 32px 0; font-size: 15px; color: #4b5563; line-height: 1.5;">Hola ${professionalName}, tienes una nueva reserva.</p>
          
          <div style="background-color: #f9fafb; border-radius: 8px; padding: 24px; margin-bottom: 32px;">
            <div style="margin-bottom: 16px;">
              <p style="margin: 0; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">Paciente</p>
              <p style="margin: 4px 0 0 0; font-size: 16px; color: #111827; font-weight: 500;">${patientName}</p>
              <p style="margin: 2px 0 0 0; font-size: 13px; color: #6b7280;">${patientEmail}</p>
            </div>
            <div style="margin-bottom: 16px;">
              <p style="margin: 0; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">Servicio</p>
              <p style="margin: 4px 0 0 0; font-size: 16px; color: #111827;">${serviceName}</p>
            </div>
            <div>
              <p style="margin: 0; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">Fecha y Hora</p>
              <p style="margin: 4px 0 0 0; font-size: 16px; color: #111827;">${formattedDate}</p>
            </div>
          </div>
        </div>
        <div style="background-color: #f9fafb; padding: 24px 32px; border-top: 1px solid #e5e7eb;">
          <p style="margin: 0; font-size: 13px; color: #9ca3af; text-align: center;">
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
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #fafafa; padding: 48px 20px;">
      <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; border: 1px solid #e5e7eb; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
        <div style="padding: 40px 32px;">
          <h1 style="color: #111827; margin: 0 0 8px 0; font-size: 20px; font-weight: 600; letter-spacing: -0.5px;">Cita cancelada</h1>
          <p style="margin: 0 0 32px 0; font-size: 15px; color: #4b5563; line-height: 1.5;">Hola ${patientName}, te informamos que tu cita ha sido cancelada.</p>
          
          <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 24px; margin-bottom: 32px;">
            <div style="margin-bottom: 16px;">
              <p style="margin: 0; font-size: 12px; font-weight: 600; color: #991b1b; text-transform: uppercase; letter-spacing: 0.5px;">Servicio</p>
              <p style="margin: 4px 0 0 0; font-size: 16px; color: #7f1d1d; font-weight: 500;">${serviceName}</p>
            </div>
            <div style="margin-bottom: 16px;">
              <p style="margin: 0; font-size: 12px; font-weight: 600; color: #991b1b; text-transform: uppercase; letter-spacing: 0.5px;">Profesional</p>
              <p style="margin: 4px 0 0 0; font-size: 16px; color: #7f1d1d;">${professionalName}</p>
            </div>
            <div>
              <p style="margin: 0; font-size: 12px; font-weight: 600; color: #991b1b; text-transform: uppercase; letter-spacing: 0.5px;">Fecha original</p>
              <p style="margin: 4px 0 0 0; font-size: 16px; color: #7f1d1d;">${formattedDate}</p>
            </div>
          </div>
          
          <p style="font-size: 14px; color: #6b7280; line-height: 1.6; margin: 0;">
            Si deseas reagendar en otro momento, estaremos felices de atenderte desde nuestro sitio web.
          </p>
        </div>
        <div style="background-color: #f9fafb; padding: 24px 32px; border-top: 1px solid #e5e7eb;">
          <p style="margin: 0; font-size: 13px; color: #9ca3af; text-align: center;">
            Terapia en Fácil
          </p>
        </div>
      </div>
    </div>
  `;

  const professionalHtml = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #fafafa; padding: 48px 20px;">
      <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; border: 1px solid #e5e7eb; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
        <div style="padding: 40px 32px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
            <h1 style="color: #111827; margin: 0; font-size: 20px; font-weight: 600; letter-spacing: -0.5px;">Cita cancelada</h1>
            <span style="background-color: #fee2e2; color: #991b1b; padding: 4px 8px; border-radius: 9999px; font-size: 12px; font-weight: 500;">Cancelada</span>
          </div>
          <p style="margin: 0 0 32px 0; font-size: 15px; color: #4b5563; line-height: 1.5;">Hola ${professionalName}, se ha cancelado una cita en tu calendario.</p>
          
          <div style="background-color: #f9fafb; border-radius: 8px; padding: 24px; margin-bottom: 32px;">
            <div style="margin-bottom: 16px;">
              <p style="margin: 0; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">Paciente</p>
              <p style="margin: 4px 0 0 0; font-size: 16px; color: #111827; font-weight: 500;">${patientName}</p>
              <p style="margin: 2px 0 0 0; font-size: 13px; color: #6b7280;">${patientEmail}</p>
            </div>
            <div style="margin-bottom: 16px;">
              <p style="margin: 0; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">Servicio</p>
              <p style="margin: 4px 0 0 0; font-size: 16px; color: #111827;">${serviceName}</p>
            </div>
            <div>
              <p style="margin: 0; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">Fecha original</p>
              <p style="margin: 4px 0 0 0; font-size: 16px; color: #111827;">${formattedDate}</p>
            </div>
          </div>
        </div>
        <div style="background-color: #f9fafb; padding: 24px 32px; border-top: 1px solid #e5e7eb;">
          <p style="margin: 0; font-size: 13px; color: #9ca3af; text-align: center;">
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
