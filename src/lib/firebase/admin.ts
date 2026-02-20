import { initializeApp, getApps, cert, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

let _adminApp: App | undefined;
let _adminDb: Firestore | undefined;

function getAdminApp(): App {
  if (!_adminApp) {
    if (getApps().length === 0) {
      const encoded = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
      if (!encoded) {
        throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY env var is missing");
      }
      const serviceAccount = JSON.parse(
        Buffer.from(encoded, "base64").toString("utf-8")
      );
      _adminApp = initializeApp({ credential: cert(serviceAccount) });
    } else {
      _adminApp = getApps()[0];
    }
  }
  return _adminApp;
}

export function getAdminDb(): Firestore {
  if (!_adminDb) {
    _adminDb = getFirestore(getAdminApp());
  }
  return _adminDb;
}
