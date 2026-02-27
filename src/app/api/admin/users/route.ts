import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb, getAdminStorage } from "@/lib/firebase/admin";

/** Verify the caller is an admin by checking their Firebase ID token + Firestore role. */
async function verifyAdmin(req: NextRequest): Promise<string | null> {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  const token = authHeader.slice(7);
  try {
    const decoded = await getAdminAuth().verifyIdToken(token);
    const userDoc = await getAdminDb().collection("users").doc(decoded.uid).get();
    if (!userDoc.exists || userDoc.data()?.role !== "admin") return null;
    return decoded.uid;
  } catch {
    return null;
  }
}

/**
 * Delete all documents in a collection where any of the given fields matches uid.
 * Uses batched deletes (max 500 per batch).
 */
async function deleteDocsByFields(
  collectionName: string,
  fields: string[],
  uid: string
) {
  const db = getAdminDb();

  for (const field of fields) {
    const snap = await db.collection(collectionName).where(field, "==", uid).get();
    if (snap.empty) continue;

    // Firestore batch limit is 500
    const chunks: FirebaseFirestore.QueryDocumentSnapshot[][] = [];
    for (let i = 0; i < snap.docs.length; i += 500) {
      chunks.push(snap.docs.slice(i, i + 500));
    }

    for (const chunk of chunks) {
      const batch = db.batch();
      for (const doc of chunk) {
        batch.delete(doc.ref);
      }
      await batch.commit();
    }
  }
}

/**
 * Cascade delete all data related to a user:
 * - appointments (userId, professionalId)
 * - clinical_notes (patientId, professionalId)
 * - patient_tasks (patientId, professionalId)
 * - intervention_plans (patientId, professionalId)
 * - profile photo in Storage
 */
async function cascadeDeleteUserData(uid: string) {
  // Delete related Firestore documents
  await Promise.all([
    deleteDocsByFields("appointments", ["userId", "professionalId"], uid),
    deleteDocsByFields("clinical_notes", ["patientId", "professionalId"], uid),
    deleteDocsByFields("patient_tasks", ["patientId", "professionalId"], uid),
    deleteDocsByFields("intervention_plans", ["patientId", "professionalId"], uid),
  ]);

  // Delete profile photo from Storage
  try {
    const bucket = getAdminStorage().bucket();
    const [files] = await bucket.getFiles({ prefix: `profile-photos/${uid}/` });
    await Promise.all(files.map((f) => f.delete()));
  } catch (err) {
    // Non-critical: log but don't fail the whole delete
    console.warn("Error deleting profile photo from Storage:", err);
  }
}

/**
 * DELETE /api/admin/users?uid=xxx
 * Cascade deletes user data, then removes user from Firebase Auth + Firestore.
 */
export async function DELETE(req: NextRequest) {
  const adminUid = await verifyAdmin(req);
  if (!adminUid) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const uid = req.nextUrl.searchParams.get("uid");
  if (!uid) {
    return NextResponse.json({ error: "uid requerido" }, { status: 400 });
  }

  if (uid === adminUid) {
    return NextResponse.json({ error: "No puedes eliminarte a ti mismo" }, { status: 400 });
  }

  // 1. Cascade delete all related data first
  try {
    await cascadeDeleteUserData(uid);
  } catch (err) {
    console.error("Error in cascade delete:", err);
    return NextResponse.json({ error: "Error al eliminar datos relacionados" }, { status: 500 });
  }

  // 2. Delete from Firebase Auth
  try {
    await getAdminAuth().deleteUser(uid);
  } catch (err: unknown) {
    if (!(err && typeof err === "object" && "code" in err && err.code === "auth/user-not-found")) {
      console.error("Error deleting auth user:", err);
      return NextResponse.json({ error: "Error al eliminar usuario de Auth" }, { status: 500 });
    }
  }

  // 3. Delete user profile from Firestore
  try {
    await getAdminDb().collection("users").doc(uid).delete();
  } catch (err) {
    console.error("Error deleting Firestore profile:", err);
    return NextResponse.json({ error: "Error al eliminar perfil de Firestore" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
