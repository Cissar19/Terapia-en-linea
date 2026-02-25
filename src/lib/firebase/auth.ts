import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  updateProfile,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail,
} from "firebase/auth";
import { getFirebaseAuth } from "./config";
import { createUserProfile, getUserProfile } from "./firestore";

function setCookie(token: string | null) {
  if (token) {
    document.cookie = `__session=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
  } else {
    document.cookie = "__session=; path=/; max-age=0";
  }
}

export async function signUp(
  email: string,
  password: string,
  displayName: string
) {
  const cred = await createUserWithEmailAndPassword(getFirebaseAuth(), email, password);
  await updateProfile(cred.user, { displayName });

  const profile = await createUserProfile(
    cred.user.uid,
    email,
    displayName
  );

  const token = await cred.user.getIdToken();
  setCookie(token);

  return { user: cred.user, profile };
}

export async function signIn(email: string, password: string) {
  const cred = await signInWithEmailAndPassword(getFirebaseAuth(), email, password);
  const token = await cred.user.getIdToken();
  setCookie(token);
  return cred.user;
}

export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider();
  const cred = await signInWithPopup(getFirebaseAuth(), provider);

  // Create profile if first time
  let profile = await getUserProfile(cred.user.uid);
  if (!profile) {
    profile = await createUserProfile(
      cred.user.uid,
      cred.user.email!,
      cred.user.displayName || "Usuario",
      cred.user.photoURL
    );
  }

  const token = await cred.user.getIdToken();
  setCookie(token);

  return { user: cred.user, profile };
}

export async function sendPasswordReset(email: string) {
  await firebaseSendPasswordResetEmail(getFirebaseAuth(), email);
}

export async function signOut() {
  await firebaseSignOut(getFirebaseAuth());
  setCookie(null);
}
