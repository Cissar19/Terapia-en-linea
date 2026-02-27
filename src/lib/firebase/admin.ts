import { initializeApp, getApps, cert, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getStorage, type Storage } from "firebase-admin/storage";

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

let _adminAuth: Auth | undefined;

export function getAdminAuth(): Auth {
  if (!_adminAuth) {
    _adminAuth = getAuth(getAdminApp());
  }
  return _adminAuth;
}

let _adminStorage: Storage | undefined;

export function getAdminStorage(): Storage {
  if (!_adminStorage) {
    _adminStorage = getStorage(getAdminApp());
  }
  return _adminStorage;
}
