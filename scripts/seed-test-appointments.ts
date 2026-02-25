/**
 * Seed script: creates 5 test patients with appointments for today.
 *
 * Usage:
 *   npx tsx scripts/seed-test-appointments.ts
 *
 * Requires FIREBASE_SERVICE_ACCOUNT_KEY in .env.local
 */

import { readFileSync } from "fs";
import { resolve } from "path";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";

// Load .env.local manually (no dotenv dependency)
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

// --- Test patients ---
const patients = [
  { name: "María González",     email: "maria.gonzalez@test.cl" },
  { name: "Carlos Muñoz",       email: "carlos.munoz@test.cl" },
  { name: "Valentina Rojas",    email: "valentina.rojas@test.cl" },
  { name: "Andrés Sepúlveda",   email: "andres.sepulveda@test.cl" },
  { name: "Camila Fuentes",     email: "camila.fuentes@test.cl" },
];

const services = [
  { slug: "adaptacion-puesto",       name: "Adaptación de Puesto de Trabajo" },
  { slug: "atencion-temprana",        name: "Atención Temprana" },
  { slug: "babysitting-terapeutico",  name: "Babysitting Terapéutico" },
  { slug: "adaptacion-puesto",       name: "Adaptación de Puesto de Trabajo" },
  { slug: "atencion-temprana",        name: "Atención Temprana" },
];

// Appointment times for today (hours in 24h format)
const hours = [9, 10, 11, 14, 16];

async function main() {
  // Find the professional user
  const proSnap = await db
    .collection("users")
    .where("role", "==", "profesional")
    .limit(1)
    .get();

  let professionalId: string;
  let professionalName: string;

  if (proSnap.empty) {
    console.log("No professional user found. Using fallback values.");
    professionalId = "test-profesional";
    professionalName = "Bárbara Alarcón Villafaña";
  } else {
    const proDoc = proSnap.docs[0];
    const proData = proDoc.data();
    professionalId = proData.uid || proDoc.id;
    professionalName = proData.displayName || "Bárbara Alarcón Villafaña";
    console.log(`Professional found: ${professionalName} (${professionalId})`);
  }

  const today = new Date();
  const now = Timestamp.now();

  for (let i = 0; i < patients.length; i++) {
    const patient = patients[i];
    const service = services[i];
    const hour = hours[i];

    // Create patient user profile
    const patientId = `test-patient-${i + 1}`;
    await db.collection("users").doc(patientId).set({
      uid: patientId,
      email: patient.email,
      displayName: patient.name,
      photoURL: null,
      role: "paciente",
      phone: null,
      createdAt: now,
      updatedAt: now,
    });

    // Create appointment for today at the specified hour
    const appointmentDate = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      hour,
      i === 2 ? 30 : 0 // 11:30 for third appointment to test offset
    );

    const status = i < 4 ? "confirmed" : "completed"; // 4 confirmed, 1 completed

    const ref = await db.collection("appointments").add({
      userId: patientId,
      userEmail: patient.email,
      userName: patient.name,
      professionalId,
      professionalName,
      serviceSlug: service.slug,
      serviceName: service.name,
      date: Timestamp.fromDate(appointmentDate),
      status,
      createdAt: now,
      notes: "",
    });

    console.log(
      `  [${status}] ${hour.toString().padStart(2, "0")}:${i === 2 ? "30" : "00"} — ${patient.name} — ${service.name} (${ref.id})`
    );
  }

  console.log("\nDone! 5 test appointments created for today.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
