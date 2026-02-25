import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { Resend } from "resend";

function getResend(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  return new Resend(apiKey);
}

function getFromEmail(): string {
  return process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
}

export async function POST(request: NextRequest) {
  const resend = getResend();
  if (!resend) {
    return NextResponse.json({ ok: true, skipped: "no RESEND_API_KEY" });
  }

  let body: {
    patientId: string;
    title: string;
    description?: string;
    priority?: string;
    dueDate?: string;
    professionalName: string;
    attachmentCount?: number;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { patientId, title, description, priority, dueDate, professionalName, attachmentCount } = body;

  if (!patientId || !title || !professionalName) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Look up patient email
  const db = getAdminDb();
  const userDoc = await db.collection("users").doc(patientId).get();

  if (!userDoc.exists) {
    return NextResponse.json({ error: "Patient not found" }, { status: 404 });
  }

  const userData = userDoc.data()!;
  const patientEmail = userData.email as string | undefined;

  if (!patientEmail) {
    return NextResponse.json({ error: "Patient has no email" }, { status: 404 });
  }

  const patientName = (userData.displayName as string) || "Paciente";

  // Build detail rows
  const details: string[] = [];
  details.push(`<p style="margin:4px 0;"><strong>Tarea:</strong> ${title}</p>`);
  if (description) {
    details.push(`<p style="margin:4px 0;"><strong>Detalle:</strong> ${description}</p>`);
  }
  if (priority) {
    const priorityLabel = priority === "alta" ? "Alta" : priority === "media" ? "Media" : "Baja";
    details.push(`<p style="margin:4px 0;"><strong>Prioridad:</strong> ${priorityLabel}</p>`);
  }
  if (dueDate) {
    const date = new Date(dueDate);
    const formatted = date.toLocaleDateString("es-CL", {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "America/Santiago",
    });
    details.push(`<p style="margin:4px 0;"><strong>Fecha límite:</strong> ${formatted}</p>`);
  }
  if (attachmentCount && attachmentCount > 0) {
    details.push(`<p style="margin:4px 0;"><strong>Adjuntos:</strong> ${attachmentCount} archivo(s) adjunto(s)</p>`);
  }
  details.push(`<p style="margin:4px 0;"><strong>Asignada por:</strong> ${professionalName}</p>`);

  const html = `
    <div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:24px;">
      <h2 style="color:#FFD43B;">Nueva Tarea Asignada</h2>
      <p>Hola <strong>${patientName}</strong>,</p>
      <p>Tu profesional te ha asignado una nueva tarea:</p>
      <div style="background:#FFF8E1;border-radius:12px;padding:16px;margin:16px 0;">
        ${details.join("\n        ")}
      </div>
      <p style="color:#666;font-size:14px;">Revisa tu panel para ver los detalles y marcarla como completada.</p>
      <p style="color:#999;font-size:12px;">— Terapia en fácil</p>
    </div>
  `;

  try {
    await resend.emails.send({
      from: getFromEmail(),
      to: patientEmail,
      subject: `Nueva tarea: ${title}`,
      html,
    });
  } catch (err) {
    console.error("Failed to send task notification email:", err);
    return NextResponse.json({ error: "Email send failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
