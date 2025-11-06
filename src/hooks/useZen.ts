import { type DeepMapZen, type Zen, get, onNotify } from '@sylphx/zen'
import { useSyncExternalStore } from 'react'

// ASSUMPTION: React integration for Zen using useSyncExternalStore
// Based on React 18+ concurrent features
// NOTE: get and onNotify have incomplete type definitions but work at runtime

export function useZen<T>(zenStore: Zen<T>): T {
  return useSyncExternalStore<T>(
    // @ts-ignore - onNotify type is incomplete
    (callback) => onNotify(zenStore, callback),
    // @ts-ignore - get type is incomplete
    () => get(zenStore) as T,
    // @ts-ignore - get type is incomplete
    () => get(zenStore) as T
  )
}

export function useDeepMap<T extends object>(deepMapStore: DeepMapZen<T>): T {
  return useSyncExternalStore<T>(
    // @ts-ignore - onNotify type is incomplete
    (callback) => onNotify(deepMapStore, callback),
    // @ts-ignore - get type is incomplete
    () => get(deepMapStore) as T,
    // @ts-ignore - get type is incomplete
    () => get(deepMapStore) as T
  )
}
