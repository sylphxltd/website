import { type Atom, type DeepMap, get, subscribe } from '@sylphx/zen'
import { useSyncExternalStore } from 'react'

// ASSUMPTION: React integration for Zen using useSyncExternalStore
// Based on React 18+ concurrent features

export function useAtom<T>(atom: Atom<T>): T {
  return useSyncExternalStore(
    (callback) => subscribe(atom, callback),
    () => get(atom),
    () => get(atom)
  )
}

export function useDeepMap<T extends object>(deepMapStore: DeepMap<T>): T {
  return useSyncExternalStore(
    (callback) => subscribe(deepMapStore, callback),
    () => get(deepMapStore),
    () => get(deepMapStore)
  )
}
