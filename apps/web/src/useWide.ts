import { useSyncExternalStore } from 'react';

/** Desktop breakpoint; keep in sync with the @media rule in styles.css. */
export const WIDE_QUERY = '(min-width: 900px)';

function subscribe(onChange: () => void) {
  const mq = window.matchMedia(WIDE_QUERY);
  mq.addEventListener('change', onChange);
  return () => mq.removeEventListener('change', onChange);
}

/** True on desktop-width screens, where the app uses the sidebar layout. */
export function useWide(): boolean {
  return useSyncExternalStore(subscribe, () => window.matchMedia(WIDE_QUERY).matches);
}
