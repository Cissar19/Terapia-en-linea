import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin";

export async function DELETE(req: NextRequest) {
  const authHeader = req.headers.get("Authorization");
  const idToken = authHeader?.replace("Bearer ", "");
  if (!idToken) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const adminAuth = getAdminAuth();
  let callerUid: string;
  try {
    const decoded = await adminAuth.verifyIdToken(idToken);
    callerUid = decoded.uid;
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const db = getAdminDb();
  const callerDoc = await db.collection("users").doc(callerUid).get();
  const callerRole = callerDoc.data()?.role;
  if (!callerDoc.exists || (callerRole !== "profesional" && callerRole !== "admin")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json() as { patientId: string };
  if (!body.patientId) return NextResponse.json({ error: "patientId requerido" }, { status: 400 });

  const patientDoc = await db.collection("users").doc(body.patientId).get();
  if (!patientDoc.exists) return NextResponse.json({ error: "Paciente no encontrado" }, { status: 404 });

  const patientData = patientDoc.data();
  if (callerRole !== "admin" && patientData?.createdBy !== callerUid) {
    return NextResponse.json({ error: "No tienes permiso para eliminar este paciente" }, { status: 403 });
  }

  await db.collection("users").doc(body.patientId).delete();

  try {
    await adminAuth.deleteUser(body.patientId);
  } catch {
    // Auth user may not exist — ignore
  }

  return NextResponse.json({ success: true });
}
