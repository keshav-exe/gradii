import { DEFAULT_EFFECTS, defaultParams } from "@/lib/engine/styles"
import type { Doc, ImageLayer, StyleId, TextLayer } from "@/lib/engine/types"
import { randomLayout } from "@/lib/random"
import { uid } from "@/lib/utils"

export const DEFAULT_TEXT: TextLayer = {
  enabled: false,
  content: "gradii",
  font: "geist",
  weight: 500,
  italic: false,
  uppercase: false,
  size: 14,
  tracking: -0.04,
  leading: 1.05,
  color: "#ffffff",
  opacity: 1,
  align: "center",
  blend: "normal",
  glow: 0,
  x: 0.5,
  y: 0.5,
}

export const DEFAULT_IMAGE: ImageLayer = {
  enabled: false,
  src: null,
  name: "",
  size: 24,
  opacity: 1,
  blend: "normal",
  x: 0.5,
  y: 0.5,
}

export interface DocSeed {
  name: string
  style: StyleId
  colors: string[]
  points?: [number, number][]
  background?: string
  center?: { x: number; y: number }
  params?: Record<string, number>
  effects?: Partial<Doc["effects"]>
  seed?: number
  speed?: number
}

export function makeDoc(s: DocSeed, base?: Doc): Doc {
  const seed = s.seed ?? 0.37
  const layout = s.points ?? randomLayout(s.colors.length, seed)
  const params = base ? structuredClone(base.params) : defaultParams()
  params[s.style] = { ...defaultParams()[s.style], ...s.params }
  return {
    v: 2,
    name: s.name,
    style: s.style,
    colors: s.colors.map((hex, i) => ({
      id: uid(),
      hex,
      x: layout[i]?.[0] ?? 0.5,
      y: layout[i]?.[1] ?? 0.5,
    })),
    background: s.background ?? "#0a0b0c",
    center: s.center ?? { x: 0.5, y: 0.5 },
    params,
    seed,
    speed: s.speed ?? 1,
    effects: { ...DEFAULT_EFFECTS, ...s.effects },
    text: base?.text ?? DEFAULT_TEXT,
    image: base?.image ?? DEFAULT_IMAGE,
    size: base?.size ?? { w: 3840, h: 2160 },
  }
}

/** Fills in anything a saved or shared document is missing. */
export function hydrate(raw: Partial<Doc>): Doc | null {
  if (!raw || !Array.isArray(raw.colors) || raw.colors.length < 1) return null
  const params = defaultParams()
  for (const k of Object.keys(params) as StyleId[])
    params[k] = { ...params[k], ...raw.params?.[k] }
  return {
    v: 2,
    name: raw.name ?? "Untitled",
    style: raw.style && raw.style in params ? raw.style : "mesh",
    colors: raw.colors.slice(0, 8).map((c) => ({
      id: c.id ?? uid(),
      hex: c.hex,
      x: c.x ?? 0.5,
      y: c.y ?? 0.5,
      locked: c.locked,
    })),
    background: raw.background ?? "#0a0b0c",
    center: raw.center ?? { x: 0.5, y: 0.5 },
    params,
    seed: raw.seed ?? 0.37,
    speed: raw.speed ?? 1,
    effects: { ...DEFAULT_EFFECTS, ...raw.effects },
    text: { ...DEFAULT_TEXT, ...raw.text },
    image: { ...DEFAULT_IMAGE, ...raw.image },
    size: raw.size ?? { w: 3840, h: 2160 },
  }
}
