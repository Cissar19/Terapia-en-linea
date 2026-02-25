/**
 * Creates a professional user in Firebase Auth + Firestore.
 *
 * Usage:
 *   npx tsx scripts/create-professional.ts
 *
 * Requires FIREBASE_SERVICE_ACCOUNT_KEY in .env.local
 */

import { readFileSync } from "fs";
import { resolve } from "path";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

// Load .env.local manually
const envPath = resolve(import.meta.dirname ?? __dirname, "../.env.local");
for (const line of readFileSync(envPath, "utf-8").split("\n")) {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match && !process.env[match[1].trim()]) {
    process.env[match[1].trim()] = match[2].trim();
  }
}

// --- Init Firebase Admin ---
const encoded = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
if (!encoded) {
  console.error("FIREBASE_SERVICE_ACCOUNT_KEY not set. Check .env.local");
  process.exit(1);
}

const serviceAccount = JSON.parse(
  Buffer.from(encoded, "base64").toString("utf-8")
);

const app =
  getApps().length === 0
    ? initializeApp({ credential: cert(serviceAccount) })
    : getApps()[0];

const db = getFirestore(app);
const auth = getAuth(app);

// --- Professional data ---
const EMAIL = "to.barbaraalarconv@gmail.com";
const PASSWORD = "jota40C1";
const DISPLAY_NAME = "Bárbara Alarcón Villafaña";

async function main() {
  // 1. Create Firebase Auth user (or get existing)
  let uid: string;
  try {
    const userRecord = await auth.createUser({
      email: EMAIL,
      password: PASSWORD,
      displayName: DISPLAY_NAME,
    });
    uid = userRecord.uid;
    console.log(`Auth user created: ${uid}`);
  } catch (err: unknown) {
    if (err && typeof err === "object" && "code" in err && err.code === "auth/email-already-exists") {
      const existing = await auth.getUserByEmail(EMAIL);
      uid = existing.uid;
      // Update password in case it changed
      await auth.updateUser(uid, { password: PASSWORD });
      console.log(`Auth user already exists: ${uid} (password updated)`);
    } else {
      throw err;
    }
  }

  // 2. Create/update Firestore profile with role "profesional"
  const now = Timestamp.now();
  const profileRef = db.collection("users").doc(uid);
  const existing = await profileRef.get();

  if (existing.exists) {
    await profileRef.update({
      role: "profesional",
      displayName: DISPLAY_NAME,
      updatedAt: now,
    });
    console.log(`Firestore profile updated to "profesional"`);
  } else {
    await profileRef.set({
      uid,
      email: EMAIL,
      displayName: DISPLAY_NAME,
      photoURL: null,
      role: "profesional",
      phone: null,
      createdAt: now,
      updatedAt: now,
    });
    console.log(`Firestore profile created with role "profesional"`);
  }

  console.log(`\nDone! Professional user ready:`);
  console.log(`  Email:    ${EMAIL}`);
  console.log(`  Password: ${PASSWORD}`);
  console.log(`  UID:      ${uid}`);
  console.log(`  Role:     profesional`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
