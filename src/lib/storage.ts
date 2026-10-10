import { useCallback, useSyncExternalStore } from 'react';
import { clear, createStore, del, get, set } from 'idb-keyval';

/**
 * Everything is stored ONLY in this browser (localStorage + IndexedDB).
 * There is no server, no analytics and no account.
 */
const PREFIX = 'pujo-smriti:v1:';
const cache = new Map<string, unknown>();
const listeners = new Map<string, Set<() => void>>();

function read<T>(key: string, fallback: T): T {
  if (cache.has(key)) return cache.get(key) as T;
  let value = fallback;
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (raw !== null) value = JSON.parse(raw) as T;
  } catch {
    /* storage blocked or corrupt: fall back silently */
  }
  cache.set(key, value);
  return value;
}

function write<T>(key: string, value: T) {
  cache.set(key, value);
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    /* quota / private mode: the value still lives in memory for this session */
  }
  listeners.get(key)?.forEach((fn) => fn());
}

export function removeStored(key: string) {
  cache.delete(key);
  try {
    localStorage.removeItem(PREFIX + key);
  } catch {
    /* ignore */
  }
  listeners.get(key)?.forEach((fn) => fn());
}

/** A localStorage-backed state hook that stays in sync across components. `fallback` must be a stable reference. */
export function useStored<T>(key: string, fallback: T) {
  const subscribe = useCallback(
    (cb: () => void) => {
      let set_ = listeners.get(key);
      if (!set_) listeners.set(key, (set_ = new Set()));
      set_.add(cb);
      return () => {
        set_!.delete(cb);
      };
    },
    [key],
  );
  const value = useSyncExternalStore(
    subscribe,
    () => read(key, fallback),
    () => fallback,
  );
  const setValue = useCallback(
    (next: T | ((prev: T) => T)) => {
      const resolved = typeof next === 'function' ? (next as (p: T) => T)(read(key, fallback)) : next;
      write(key, resolved);
    },
    [key, fallback],
  );
  return [value, setValue] as const;
}

/* ---------- photos (IndexedDB) ---------- */
const photoStore = typeof indexedDB !== 'undefined' ? createStore('pujo-smriti', 'photos') : undefined;

export async function savePhoto(id: string, blob: Blob) {
  if (!photoStore) return;
  try {
    await set(id, blob, photoStore);
  } catch {
    /* ignore */
  }
}
export async function loadPhoto(id: string): Promise<Blob | undefined> {
  if (!photoStore) return undefined;
  try {
    return await get<Blob>(id, photoStore);
  } catch {
    return undefined;
  }
}
export async function deletePhoto(id: string) {
  if (!photoStore) return;
  try {
    await del(id, photoStore);
  } catch {
    /* ignore */
  }
}

/** Wipes every draft, letter, capsule, quiz answer and photo this site stored on the device. */
export async function clearAllLocalData() {
  try {
    Object.keys(localStorage)
      .filter((k) => k.startsWith(PREFIX))
      .forEach((k) => localStorage.removeItem(k));
  } catch {
    /* ignore */
  }
  if (photoStore) {
    try {
      await clear(photoStore);
    } catch {
      /* ignore */
    }
  }
  const keys = [...cache.keys()];
  cache.clear();
  keys.forEach((k) => listeners.get(k)?.forEach((fn) => fn()));
}
