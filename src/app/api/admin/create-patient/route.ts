import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(req: NextRequest) {
  // Verify caller is an authenticated professional
  const authHeader = req.headers.get("Authorization");
  const idToken = authHeader?.replace("Bearer ", "");
  if (!idToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const adminAuth = getAdminAuth();
  let callerUid: string;
  try {
    const decoded = await adminAuth.verifyIdToken(idToken);
    callerUid = decoded.uid;
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  // Verify caller is a professional
  const db = getAdminDb();
  const callerDoc = await db.collection("users").doc(callerUid).get();
  if (!callerDoc.exists || callerDoc.data()?.role !== "profesional") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json() as {
    displayName: string;
    email: string;
    phone?: string;
    birthDate?: string;
    residenceCommune?: string;
    diagnoses?: string;
    medications?: string;
    tempPassword?: string;
  };

  if (!body.displayName?.trim() || !body.email?.trim()) {
    return NextResponse.json({ error: "Nombre y email son requeridos" }, { status: 400 });
  }

  // Check if email already exists
  try {
    await adminAuth.getUserByEmail(body.email.trim());
    return NextResponse.json({ error: "Ya existe un usuario con ese correo" }, { status: 409 });
  } catch (e: unknown) {
    // getUserByEmail throws if not found — that's expected
    if ((e as { code?: string }).code !== "auth/user-not-found") {
      return NextResponse.json({ error: "Error verificando email" }, { status: 500 });
    }
  }

  const hasPassword = body.tempPassword && body.tempPassword.trim().length >= 6;

  // Create Firebase Auth user
  const authUser = await adminAuth.createUser({
    email: body.email.trim(),
    displayName: body.displayName.trim(),
    emailVerified: false,
    ...(hasPassword ? { password: body.tempPassword!.trim() } : {}),
  });

  // Create Firestore profile
  const now = FieldValue.serverTimestamp();
  const profile: Record<string, unknown> = {
    uid: authUser.uid,
    email: body.email.trim(),
    displayName: body.displayName.trim(),
    photoURL: null,
    role: "paciente",
    phone: body.phone?.trim() || null,
    createdBy: callerUid,
    createdAt: now,
    updatedAt: now,
  };
  if (body.birthDate) profile.birthDate = body.birthDate;
  if (body.residenceCommune?.trim()) profile.residenceCommune = body.residenceCommune.trim();
  if (body.diagnoses?.trim()) profile.diagnoses = body.diagnoses.trim();
  if (body.medications?.trim()) profile.medications = body.medications.trim();

  await db.collection("users").doc(authUser.uid).set(profile);

  // If no temp password, generate a reset link so the patient can set their own
  const resetLink = hasPassword
    ? null
    : await adminAuth.generatePasswordResetLink(body.email.trim());

  return NextResponse.json({
    uid: authUser.uid,
    displayName: body.displayName.trim(),
    email: body.email.trim(),
    hasPassword,
    resetLink,
  });
}
