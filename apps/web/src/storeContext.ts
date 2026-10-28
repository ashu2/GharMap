import { createContext } from 'react';
import type { Store } from './store';

// Kept apart from store.tsx so the context object survives hot reloads: editing
// store.tsx or @gharmap/core re-runs that module, and a fresh context there would
// leave already-mounted components reading an empty one.
export const StoreContext = createContext<Store | null>(null);
