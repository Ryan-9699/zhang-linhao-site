import type { ContentData, WorkItem } from "@/types/content";

const dbName = "zlh-portfolio-image-store";
const storeName = "images";
const imageRefPrefix = "idb://zlh-portfolio/";

interface StoredImageRecord {
  id: string;
  blob: Blob;
  name: string;
  type: string;
  size: number;
  updatedAt: number;
}

function openImageDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB is not available"));
      return;
    }

    const request = indexedDB.open(dbName, 1);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName, { keyPath: "id" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Failed to open image database"));
  });
}

function transactionDone(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error ?? new Error("Image transaction failed"));
    transaction.onabort = () => reject(transaction.error ?? new Error("Image transaction aborted"));
  });
}

function requestResult<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Image request failed"));
  });
}

function createImageRef(id: string) {
  return `${imageRefPrefix}${id}`;
}

function imageIdFromRef(ref: string) {
  return ref.slice(imageRefPrefix.length);
}

export function isStoredImageRef(src?: string | null): src is string {
  return Boolean(src?.startsWith(imageRefPrefix));
}

export function isEmbeddedImage(src?: string | null): src is string {
  return Boolean(src?.startsWith("data:image/"));
}

export async function saveImageBlob(blob: Blob, name = "portfolio-image"): Promise<string> {
  const db = await openImageDb();
  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  try {
    const transaction = db.transaction(storeName, "readwrite");
    transaction.objectStore(storeName).put({
      id,
      blob,
      name,
      type: blob.type,
      size: blob.size,
      updatedAt: Date.now(),
    } satisfies StoredImageRecord);
    await transactionDone(transaction);
    return createImageRef(id);
  } finally {
    db.close();
  }
}

export function saveImageFile(file: File): Promise<string> {
  return saveImageBlob(file, file.name);
}

export async function getStoredImageBlob(ref: string): Promise<Blob | null> {
  if (!isStoredImageRef(ref)) return null;

  const db = await openImageDb();
  try {
    const transaction = db.transaction(storeName, "readonly");
    const record = await requestResult<StoredImageRecord | undefined>(
      transaction.objectStore(storeName).get(imageIdFromRef(ref)),
    );
    return record?.blob ?? null;
  } finally {
    db.close();
  }
}

async function migrateImageSource(src: string | undefined, migrated: Map<string, string>) {
  if (!src || isStoredImageRef(src) || !isEmbeddedImage(src)) return src;
  const cachedRef = migrated.get(src);
  if (cachedRef) return cachedRef;

  const response = await fetch(src);
  const blob = await response.blob();
  const ref = await saveImageBlob(blob, "migrated-portfolio-image");
  migrated.set(src, ref);
  return ref;
}

export async function migrateContentImagesToStoredRefs(
  content: ContentData,
): Promise<{ content: ContentData; changed: boolean }> {
  const migrated = new Map<string, string>();
  let changed = false;

  const migrate = async (src: string | undefined) => {
    const nextSrc = await migrateImageSource(src, migrated);
    if (nextSrc !== src) changed = true;
    return nextSrc;
  };

  const works = await Promise.all(
    content.works.map(async (work): Promise<WorkItem> => {
      const nextGalleryImages = work.galleryImages
        ? {
            onsite: await migrate(work.galleryImages.onsite),
            signal: await migrate(work.galleryImages.signal),
            output: await migrate(work.galleryImages.output),
          }
        : undefined;

      return {
        ...work,
        image: (await migrate(work.image)) ?? work.image,
        videoImage: await migrate(work.videoImage),
        galleryImages: nextGalleryImages,
      };
    }),
  );

  const profile = content.profile
    ? {
        ...content.profile,
        avatar: await migrate(content.profile.avatar),
      }
    : content.profile;

  return {
    content: {
      ...content,
      profile,
      works,
    },
    changed,
  };
}
