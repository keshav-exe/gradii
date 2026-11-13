import { deflateSync, inflateSync, strFromU8, strToU8 } from "fflate"
import { hydrate } from "@/lib/doc"
import type { Doc } from "@/lib/engine/types"

const b64url = (u8: Uint8Array) => {
  let s = ""
  for (const b of u8) s += String.fromCharCode(b)
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
}

const fromB64url = (s: string) => {
  const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/"))
  return Uint8Array.from(bin, (c) => c.charCodeAt(0))
}

const round = (v: number) => Math.round(v * 1000) / 1000

/** The doc in a URL fragment, minus any uploaded image (too big to share). */
export function encodeDoc(doc: Doc, phase: number) {
  const slim = {
    ...doc,
    params: { [doc.style]: doc.params[doc.style] },
    colors: doc.colors.map(({ hex, x, y }) => ({
      hex,
      x: round(x),
      y: round(y),
    })),
    image: { ...doc.image, src: null, enabled: false },
    phase: round(phase),
  }
  return b64url(deflateSync(strToU8(JSON.stringify(slim)), { level: 9 }))
}

export function decodeDoc(s: string): { doc: Doc; phase: number } | null {
  try {
    const raw = JSON.parse(strFromU8(inflateSync(fromB64url(s))))
    const doc = hydrate(raw)
    return doc ? { doc, phase: Number(raw.phase) || 0 } : null
  } catch {
    return null
  }
}

export const shareUrl = (doc: Doc, phase: number) =>
  `${location.origin}${location.pathname}#g=${encodeDoc(doc, phase)}`
