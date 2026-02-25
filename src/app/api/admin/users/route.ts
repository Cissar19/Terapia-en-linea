import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin";

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
 * DELETE /api/admin/users?uid=xxx
 * Deletes user from Firebase Auth + Firestore.
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

  try {
    // Delete from Firebase Auth
    await getAdminAuth().deleteUser(uid);
  } catch (err: unknown) {
    // If user doesn't exist in Auth, continue to clean up Firestore
    if (!(err && typeof err === "object" && "code" in err && err.code === "auth/user-not-found")) {
      console.error("Error deleting auth user:", err);
      return NextResponse.json({ error: "Error al eliminar usuario de Auth" }, { status: 500 });
    }
  }

  try {
    // Delete from Firestore
    await getAdminDb().collection("users").doc(uid).delete();
  } catch (err) {
    console.error("Error deleting Firestore profile:", err);
    return NextResponse.json({ error: "Error al eliminar perfil de Firestore" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
