import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { Timestamp } from "firebase-admin/firestore";
import { Resend } from "resend";

function formatDate(ts: FirebaseFirestore.Timestamp): string {
  const d = ts.toDate();
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

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const expectedToken = process.env.CRON_SECRET;

  if (!expectedToken || authHeader !== `Bearer ${expectedToken}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getAdminDb();
  const now = new Date();
  const in24h = new Date(now.getTime() + 24 * 60 * 60_000);
  const in25h = new Date(now.getTime() + 25 * 60 * 60_000);

  // Find confirmed appointments between 24h and 25h from now
  const snap = await db
    .collection("appointments")
    .where("status", "==", "confirmed")
    .where("date", ">=", Timestamp.fromDate(in24h))
    .where("date", "<=", Timestamp.fromDate(in25h))
    .get();

  // Filter out already reminded
  const toRemind = snap.docs.filter((doc) => !doc.data().reminderSent);

  if (toRemind.length === 0) {
    return NextResponse.json({ ok: true, reminded: 0 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ ok: true, reminded: 0, reason: "No RESEND_API_KEY" });
  }

  const resend = new Resend(apiKey);
  const from = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

  let sentCount = 0;

  for (const doc of toRemind) {
    const data = doc.data();
    const formattedDate = formatDate(data.date);

    const html = `
      <div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:24px;">
        <h2 style="color:#4361EE;">Recordatorio de Cita</h2>
        <p>Hola <strong>${data.userName}</strong>,</p>
        <p>Te recordamos que tienes una cita programada para mañana:</p>
        <div style="background:#F3F0FF;border-radius:12px;padding:16px;margin:16px 0;">
          <p style="margin:4px 0;"><strong>Servicio:</strong> ${data.serviceName}</p>
          <p style="margin:4px 0;"><strong>Profesional:</strong> ${data.professionalName}</p>
          <p style="margin:4px 0;"><strong>Fecha:</strong> ${formattedDate}</p>
        </div>
        <p style="color:#666;font-size:14px;">Si necesitas cancelar o reagendar, contáctanos con anticipación.</p>
        <p style="color:#999;font-size:12px;">— Terapia en fácil</p>
      </div>
    `;

    try {
      await resend.emails.send({
        from,
        to: data.userEmail,
        subject: `Recordatorio: ${data.serviceName} mañana`,
        html,
      });
      await doc.ref.update({ reminderSent: true });
      sentCount++;
    } catch {
      // Continue with next appointment on individual failure
    }
  }

  return NextResponse.json({ ok: true, reminded: sentCount });
}
