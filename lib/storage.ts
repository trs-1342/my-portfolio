/**
 * Firebase Storage yükleme yardımcıları — sadece client-side kullanılır.
 */

import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from "./firebase";

/** Dosyayı Storage'a yükle ve download URL döndür */
export async function uploadFile(storagePath: string, file: File): Promise<string> {
  if (!storage) throw new Error("Firebase Storage başlatılamadı.");
  const fileRef = ref(storage, storagePath);
  await uploadBytes(fileRef, file);
  return getDownloadURL(fileRef);
}

/** Storage path ile dosyayı sil (opsiyonel, hata yutulur) */
export async function deleteFileByPath(storagePath: string): Promise<void> {
  if (!storage || !storagePath) return;
  try {
    const fileRef = ref(storage, storagePath);
    await deleteObject(fileRef);
  } catch {
    // Dosya zaten silinmiş — sessizce geç
  }
}
