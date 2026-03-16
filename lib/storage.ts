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

/** URL'den path çıkar ve Storage'dan sil (opsiyonel, hata yutulur) */
export async function deleteFileByUrl(url: string): Promise<void> {
  if (!storage) return;
  try {
    const fileRef = ref(storage, url);
    await deleteObject(fileRef);
  } catch {
    // Dosya zaten silinmiş ya da harici URL — sessizce geç
  }
}
