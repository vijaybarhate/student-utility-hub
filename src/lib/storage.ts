/**
 * storageLoad<T>(key, fallback) — typed localStorage reader.
 * Returns `fallback` when the key is missing, the stored JSON is corrupt,
 * or localStorage is unavailable (SSR / privacy mode / tests).
 */
export function storageLoad<T>(key: string, fallback: T): T {
  if (typeof localStorage === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

/**
 * storageSave(key, value) — serialises and persists any JSON-serialisable
 * value. Swallows quota/unavailable errors so UI code never throws.
 */
export function storageSave(key: string, value: unknown): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage unavailable or full — fail silently, callers keep in-memory state
  }
}
