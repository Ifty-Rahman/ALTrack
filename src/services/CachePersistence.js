import { ApolloLink, Observable } from "@apollo/client";

export const CACHE_STORAGE_KEY = "altrack:apollo-cache-v1";
export const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

let hydrated = false;

export function hydrateCache(cache, ttlMs = CACHE_TTL_MS) {
  if (hydrated) return cache;
  hydrated = true;
  try {
    const raw = localStorage.getItem(CACHE_STORAGE_KEY);
    if (!raw) return cache;
    const snapshot = JSON.parse(raw);
    if (!snapshot?.data || typeof snapshot.savedAt !== "number") return cache;
    if (Date.now() - snapshot.savedAt > ttlMs) return cache;
    cache.restore(snapshot.data);
  } catch {
    // Corrupt or unavailable storage: fall through to a cold start.
  }
  return cache;
}

export function createPersistenceLink(cache) {
  let saveTimer = null;

  const save = () => {
    saveTimer = null;
    try {
      localStorage.setItem(
        CACHE_STORAGE_KEY,
        JSON.stringify({ data: cache.extract(), savedAt: Date.now() }),
      );
    } catch {
      // Storage full or disabled: skip this write.
    }
  };

  const scheduleSave = () => {
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(save, 1000);
  };

  return new ApolloLink((operation, forward) =>
    new Observable((observer) => {
      const subscription = forward(operation).subscribe({
        next: (response) => {
          // Cache writes happen synchronously while the QueryManager consumes
          // this result, so defer the snapshot to the next macrotask.
          setTimeout(scheduleSave, 0);
          observer.next(response);
        },
        error: (err) => observer.error(err),
        complete: () => observer.complete(),
      });
      return () => subscription.unsubscribe();
    }),
  );
}