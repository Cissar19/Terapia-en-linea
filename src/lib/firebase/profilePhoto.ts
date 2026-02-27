import { compressImageToBase64 } from "../imageUtils";
import { updateUserProfile } from "./firestore";

/**
 * Compress the image and store as base64 in the user's Firestore document.
 * Returns the base64 data URL string.
 */
export async function uploadProfilePhoto(
  file: File,
  userId: string
): Promise<string> {
  const base64 = await compressImageToBase64(file);
  await updateUserProfile(userId, { photoURL: base64 });
  return base64;
}

/**
 * Remove the profile photo by setting photoURL to null.
 */
export async function deleteProfilePhoto(userId: string): Promise<void> {
  await updateUserProfile(userId, { photoURL: null });
}
