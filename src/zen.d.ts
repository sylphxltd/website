// Type definitions補充for @sylphx/zen v1.0.0
// The package has incomplete TypeScript definitions

declare module '@sylphx/zen' {
  export interface Toast {
    id: number
    message: string
    type: string
    timeout: number
    startTime: number
    timeLeft: number
  }

  export type AnyZen = unknown
  export type Zen<T> = {
    _kind: string
    _value: T
  }
  export type DeepMapZen<T extends object> = {
    _kind: 'deepMap'
    _value: T
  }
  export type Unsubscribe = () => void
  export type Listener<T> = (value: T) => void
  export type LifecycleListener<T> = (value: T) => void

  export function deepMap<T extends object>(initial: T): DeepMapZen<T>
  export function get<T>(store: Zen<T> | DeepMapZen<any>): T
  export function setDeepMapPath<T extends object>(
    store: DeepMapZen<T>,
    path: (string | number)[],
    value: unknown
  ): void
  export function onNotify<T>(store: Zen<T> | DeepMapZen<any>, listener: Listener<T>): Unsubscribe
}
