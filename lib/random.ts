import { hexToOklch, oklchToHex } from "@/lib/color"
import { rng } from "@/lib/utils"

/**
 * Palettes are drawn in OKLCH: a base hue, a harmony that spreads the other
 * hues around it, and a mood that fixes how light and how colourful they are.
 */
const HARMONIES = {
  analogous: [0, 25, -25, 50, -50, 12, -12, 38],
  complementary: [0, 180, 20, 200, -20, 160, 10, 190],
  triadic: [0, 120, 240, 20, 140, 260, 0, 120],
  split: [0, 150, 210, 15, 165, 225, -15, 195],
  tetradic: [0, 90, 180, 270, 20, 110, 200, 290],
  monochrome: [0, 4, -4, 8, -8, 2, -2, 6],
} as const

const MOODS = {
  vivid: { L: [0.55, 0.82], C: [0.14, 0.24] },
  pastel: { L: [0.84, 0.95], C: [0.04, 0.11] },
  deep: { L: [0.18, 0.5], C: [0.08, 0.18] },
  dusk: { L: [0.12, 0.78], C: [0.06, 0.2] },
  muted: { L: [0.45, 0.82], C: [0.03, 0.09] },
} as const

export type Harmony = keyof typeof HARMONIES
export type Mood = keyof typeof MOODS
export const HARMONY_NAMES = Object.keys(HARMONIES) as Harmony[]
export const MOOD_NAMES = Object.keys(MOODS) as Mood[]

export interface PaletteOptions {
  count: number
  harmony?: Harmony
  mood?: Mood
  /** Colours to keep where they are; null slots get new ones. */
  keep?: (string | null)[]
  seed?: number
}

const pick = <T>(r: () => number, xs: readonly T[]) =>
  xs[Math.floor(r() * xs.length)]

export function randomPalette(o: PaletteOptions) {
  const r = rng(o.seed ?? Math.random())
  const harmony = o.harmony ?? pick(r, HARMONY_NAMES)
  const mood = o.mood ?? pick(r, MOOD_NAMES)
  const kept = o.keep?.find(Boolean)
  const base = kept ? hexToOklch(kept)[2] : r() * 360
  const { L, C } = MOODS[mood]
  const offsets = HARMONIES[harmony]
  const out: string[] = []
  for (let i = 0; i < o.count; i++) {
    const keep = o.keep?.[i]
    if (keep) {
      out.push(keep)
      continue
    }
    // Spread lightness across the palette so it never reads flat.
    const t = o.count > 1 ? (i / (o.count - 1)) * 0.8 + r() * 0.2 : r()
    const l = L[0] + (L[1] - L[0]) * (mood === "dusk" ? t : r() * 0.6 + t * 0.4)
    const c = C[0] + (C[1] - C[0]) * r()
    const h = base + offsets[i % offsets.length] + (r() - 0.5) * 14
    out.push(oklchToHex(l, c, ((h % 360) + 360) % 360))
  }
  // Shuffle the new ones so the light end doesn't always come last.
  return out
}

/** Points spread evenly but loosely: best-candidate sampling. */
export function randomLayout(count: number, seed = Math.random()) {
  const r = rng(seed)
  const pts: [number, number][] = []
  for (let i = 0; i < count; i++) {
    let best: [number, number] = [r(), r()]
    let bestD = -1
    for (let k = 0; k < 12; k++) {
      const c: [number, number] = [0.08 + r() * 0.84, 0.08 + r() * 0.84]
      const d = pts.length
        ? Math.min(...pts.map((p) => Math.hypot(p[0] - c[0], p[1] - c[1])))
        : 1
      if (d > bestD) {
        bestD = d
        best = c
      }
    }
    pts.push(best)
  }
  return pts
}

/** A ground colour for the Orbs style that sits under a palette. */
export function groundFor(colors: string[], seed = Math.random()) {
  const r = rng(seed)
  const [, , h] = hexToOklch(colors[Math.floor(r() * colors.length)])
  return r() > 0.35
    ? oklchToHex(0.12 + r() * 0.08, 0.02 + r() * 0.04, h)
    : oklchToHex(0.93 + r() * 0.04, 0.01 + r() * 0.03, h)
}
