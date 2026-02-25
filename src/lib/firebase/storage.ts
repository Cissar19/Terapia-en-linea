import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { getFirebaseStorage } from "./config";
import type { TaskAttachment } from "./types";

export async function uploadTaskAttachment(
  file: File,
  taskId: string
): Promise<TaskAttachment> {
  const storage = getFirebaseStorage();
  const storageRef = ref(storage, `task-attachments/${taskId}/${file.name}`);
  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);
  return { name: file.name, url, type: "file" };
}

export async function deleteTaskAttachment(path: string): Promise<void> {
  const storage = getFirebaseStorage();
  const storageRef = ref(storage, path);
  await deleteObject(storageRef);
}
