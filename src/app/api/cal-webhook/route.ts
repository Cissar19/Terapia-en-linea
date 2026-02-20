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
    <div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:24px;">
      <h2 style="color:#4361EE;">Cita Confirmada</h2>
      <p>Hola <strong>${patientName}</strong>,</p>
      <p>Tu cita ha sido agendada exitosamente:</p>
      <div style="background:#F3F0FF;border-radius:12px;padding:16px;margin:16px 0;">
        <p style="margin:4px 0;"><strong>Servicio:</strong> ${serviceName}</p>
        <p style="margin:4px 0;"><strong>Profesional:</strong> ${professionalName}</p>
        <p style="margin:4px 0;"><strong>Fecha:</strong> ${formattedDate}</p>
      </div>
      <p style="color:#666;font-size:14px;">Si necesitas cancelar o reagendar, contáctanos.</p>
      <p style="color:#999;font-size:12px;">— Terapia en fácil</p>
    </div>
  `;

  const professionalHtml = `
    <div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:24px;">
      <h2 style="color:#2DC653;">Nueva Cita Agendada</h2>
      <p>Hola <strong>${professionalName}</strong>,</p>
      <p>Tienes una nueva cita agendada:</p>
      <div style="background:#E8F5E9;border-radius:12px;padding:16px;margin:16px 0;">
        <p style="margin:4px 0;"><strong>Paciente:</strong> ${patientName} (${patientEmail})</p>
        <p style="margin:4px 0;"><strong>Servicio:</strong> ${serviceName}</p>
        <p style="margin:4px 0;"><strong>Fecha:</strong> ${formattedDate}</p>
      </div>
      <p style="color:#999;font-size:12px;">— Terapia en fácil</p>
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
    <div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:24px;">
      <h2 style="color:#FF4757;">Cita Cancelada</h2>
      <p>Hola <strong>${patientName}</strong>,</p>
      <p>Tu cita ha sido cancelada:</p>
      <div style="background:#FFF0F0;border-radius:12px;padding:16px;margin:16px 0;">
        <p style="margin:4px 0;"><strong>Servicio:</strong> ${serviceName}</p>
        <p style="margin:4px 0;"><strong>Profesional:</strong> ${professionalName}</p>
        <p style="margin:4px 0;"><strong>Fecha:</strong> ${formattedDate}</p>
      </div>
      <p style="color:#666;font-size:14px;">Si deseas reagendar, visita nuestro sitio web.</p>
      <p style="color:#999;font-size:12px;">— Terapia en fácil</p>
    </div>
  `;

  const professionalHtml = `
    <div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:24px;">
      <h2 style="color:#FF4757;">Cita Cancelada</h2>
      <p>Hola <strong>${professionalName}</strong>,</p>
      <p>Se ha cancelado una cita:</p>
      <div style="background:#FFF0F0;border-radius:12px;padding:16px;margin:16px 0;">
        <p style="margin:4px 0;"><strong>Paciente:</strong> ${patientName} (${patientEmail})</p>
        <p style="margin:4px 0;"><strong>Servicio:</strong> ${serviceName}</p>
        <p style="margin:4px 0;"><strong>Fecha:</strong> ${formattedDate}</p>
      </div>
      <p style="color:#999;font-size:12px;">— Terapia en fácil</p>
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
