"use client"

import { useSyncExternalStore } from "react"

/** A media query as state. The server assumes a desktop. */
export function useMedia(query: string, server = true) {
  return useSyncExternalStore(
    (cb) => {
      const m = matchMedia(query)
      m.addEventListener("change", cb)
      return () => m.removeEventListener("change", cb)
    },
    () => matchMedia(query).matches,
    () => server
  )
}

export const useDesktop = () => useMedia("(min-width: 1024px)")

const noop = () => () => {}

/** True in the browser, false while server rendering. No effect needed. */
export const useClientValue = <T>(read: () => T, server: T) =>
  useSyncExternalStore(noop, read, () => server)
