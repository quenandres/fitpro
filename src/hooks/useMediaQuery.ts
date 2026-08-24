import { useSyncExternalStore } from 'react';

function subscribe(query: string, callback: () => void) {
  const mql = window.matchMedia(query);
  mql.addEventListener('change', callback);
  return () => mql.removeEventListener('change', callback);
}

function getSnapshot(query: string) {
  return window.matchMedia(query).matches;
}

function getServerSnapshot() {
  return false;
}

/** Subscribe to a CSS media query. SSR-safe (returns false on server). */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (callback) => subscribe(query, callback),
    () => getSnapshot(query),
    getServerSnapshot,
  );
}

/** Tailwind `lg` breakpoint — 1024px and up. */
export function useIsLargeScreen(): boolean {
  return useMediaQuery('(min-width: 1024px)');
}
