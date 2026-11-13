export type StyleId =
  "mesh" | "fluid" | "waves" | "orbs" | "linear" | "radial" | "conic"

export interface ColorStop {
  id: string
  hex: string
  /** Where the colour sits on the artboard, 0–1 from the top left. */
  x: number
  y: number
  locked?: boolean
}

export type BlendMode =
  "normal" | "overlay" | "soft-light" | "screen" | "multiply" | "difference"

export interface Effects {
  grain: number
  grainSize: number
  vignette: number
  glass: number
  glassSize: number
  glassAngle: number
  pixelate: number
  /** Ordered-dither levels per channel; 0 is off. */
  dither: number
  ditherSize: number
  brightness: number
  contrast: number
  saturation: number
  hue: number
}

export interface TextLayer {
  enabled: boolean
  content: string
  font: string
  weight: number
  italic: boolean
  uppercase: boolean
  /** Cap height as a share of the artboard's shorter side, in percent. */
  size: number
  tracking: number
  leading: number
  color: string
  opacity: number
  align: "left" | "center" | "right"
  blend: BlendMode
  glow: number
  x: number
  y: number
}

export interface ImageLayer {
  enabled: boolean
  src: string | null
  name: string
  /** Width as a share of the artboard's shorter side, in percent. */
  size: number
  opacity: number
  blend: BlendMode
  x: number
  y: number
}

export interface Doc {
  v: 2
  name: string
  style: StyleId
  colors: ColorStop[]
  background: string
  center: { x: number; y: number }
  params: Record<StyleId, Record<string, number>>
  seed: number
  speed: number
  effects: Effects
  text: TextLayer
  image: ImageLayer
  size: { w: number; h: number }
}
