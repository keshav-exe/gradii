import type { Effects, StyleId } from "./types"

export interface ParamDef {
  key: string
  label: string
  min: number
  max: number
  step: number
  default: number
  unit?: string
  /** Turns the stored value into what the shader reads. */
  uniform?: (v: number) => number
}

export interface StyleDef {
  id: StyleId
  name: string
  blurb: string
  /** Each colour has a position on the artboard you can drag. */
  points: boolean
  /** One draggable centre. */
  center: boolean
  /** The background colour shows through. */
  background: boolean
  params: ParamDef[]
}

const deg = (v: number) => (v * Math.PI) / 180

const warp: ParamDef[] = [
  { key: "warp", label: "Warp", min: 0, max: 1, step: 0.01, default: 0 },
  {
    key: "turbulence",
    label: "Turbulence",
    min: 0.3,
    max: 6,
    step: 0.05,
    default: 1.8,
  },
]

export const STYLES: StyleDef[] = [
  {
    id: "mesh",
    name: "Mesh",
    blurb: "Soft colour points that melt into each other",
    points: true,
    center: false,
    background: false,
    params: [
      {
        key: "sharpness",
        label: "Sharpness",
        min: 1,
        max: 7,
        step: 0.05,
        default: 2.6,
      },
      { key: "warp", label: "Warp", min: 0, max: 1, step: 0.01, default: 0.3 },
      {
        key: "turbulence",
        label: "Turbulence",
        min: 0.3,
        max: 6,
        step: 0.05,
        default: 1.4,
      },
      { key: "swirl", label: "Swirl", min: -4, max: 4, step: 0.05, default: 0 },
    ],
  },
  {
    id: "fluid",
    name: "Fluid",
    blurb: "Marbled, domain-warped noise",
    points: false,
    center: false,
    background: false,
    params: [
      {
        key: "scale",
        label: "Scale",
        min: 0.2,
        max: 4,
        step: 0.01,
        default: 1.1,
      },
      { key: "warp", label: "Warp", min: 0, max: 6, step: 0.05, default: 2.4 },
      { key: "detail", label: "Detail", min: 1, max: 6, step: 1, default: 4 },
      {
        key: "contrast",
        label: "Contrast",
        min: 0.4,
        max: 3,
        step: 0.01,
        default: 1.3,
      },
    ],
  },
  {
    id: "waves",
    name: "Silk",
    blurb: "Flowing bands of colour",
    points: false,
    center: false,
    background: false,
    params: [
      {
        key: "frequency",
        label: "Frequency",
        min: 0.2,
        max: 5,
        step: 0.01,
        default: 1.4,
      },
      {
        key: "amplitude",
        label: "Amplitude",
        min: 0,
        max: 2,
        step: 0.01,
        default: 0.7,
      },
      {
        key: "bands",
        label: "Bands",
        min: 0.4,
        max: 5,
        step: 0.01,
        default: 1,
      },
      {
        key: "angle",
        label: "Angle",
        min: -180,
        max: 180,
        step: 1,
        default: -12,
        unit: "°",
        uniform: deg,
      },
    ],
  },
  {
    id: "orbs",
    name: "Orbs",
    blurb: "Blurred shapes on a ground colour",
    points: true,
    center: false,
    background: true,
    params: [
      {
        key: "size",
        label: "Size",
        min: 0.1,
        max: 1.6,
        step: 0.01,
        default: 0.75,
      },
      { key: "blur", label: "Blur", min: 0, max: 1, step: 0.01, default: 0.75 },
      {
        key: "variance",
        label: "Variance",
        min: 0,
        max: 1,
        step: 0.01,
        default: 0.45,
      },
    ],
  },
  {
    id: "linear",
    name: "Linear",
    blurb: "A straight blend, perceptually even",
    points: false,
    center: false,
    background: false,
    params: [
      {
        key: "angle",
        label: "Angle",
        min: -180,
        max: 180,
        step: 1,
        default: 45,
        unit: "°",
        uniform: deg,
      },
      ...warp,
    ],
  },
  {
    id: "radial",
    name: "Radial",
    blurb: "Rings out from a centre",
    points: false,
    center: true,
    background: false,
    params: [
      {
        key: "radius",
        label: "Radius",
        min: 0.1,
        max: 2.5,
        step: 0.01,
        default: 0.9,
      },
      ...warp,
    ],
  },
  {
    id: "conic",
    name: "Conic",
    blurb: "Sweeps around a centre",
    points: false,
    center: true,
    background: false,
    params: [
      {
        key: "twist",
        label: "Twist",
        min: -4,
        max: 4,
        step: 0.01,
        default: 0.6,
      },
      ...warp,
    ],
  },
]

export const STYLE = Object.fromEntries(STYLES.map((s) => [s.id, s])) as Record<
  StyleId,
  StyleDef
>

export const defaultParams = () =>
  Object.fromEntries(
    STYLES.map((s) => [
      s.id,
      Object.fromEntries(s.params.map((p) => [p.key, p.default])),
    ])
  ) as Record<StyleId, Record<string, number>>

export interface EffectDef {
  key: keyof Effects
  label: string
  min: number
  max: number
  step: number
  default: number
  unit?: string
}

export const DEFAULT_EFFECTS: Effects = {
  grain: 0.12,
  grainSize: 1,
  vignette: 0,
  glass: 0,
  glassSize: 16,
  glassAngle: 0,
  pixelate: 0,
  dither: 0,
  ditherSize: 2,
  brightness: 0,
  contrast: 0,
  saturation: 1,
  hue: 0,
}

export const EFFECT: Record<keyof Effects, EffectDef> = {
  grain: {
    key: "grain",
    label: "Amount",
    min: 0,
    max: 1,
    step: 0.01,
    default: 0.12,
  },
  grainSize: {
    key: "grainSize",
    label: "Size",
    min: 1,
    max: 6,
    step: 0.1,
    default: 1,
    unit: "px",
  },
  vignette: {
    key: "vignette",
    label: "Vignette",
    min: 0,
    max: 1,
    step: 0.01,
    default: 0,
  },
  glass: {
    key: "glass",
    label: "Refraction",
    min: 0,
    max: 1,
    step: 0.01,
    default: 0,
  },
  glassSize: {
    key: "glassSize",
    label: "Flutes",
    min: 2,
    max: 80,
    step: 1,
    default: 16,
  },
  glassAngle: {
    key: "glassAngle",
    label: "Angle",
    min: 0,
    max: 180,
    step: 1,
    default: 0,
    unit: "°",
  },
  pixelate: {
    key: "pixelate",
    label: "Cell size",
    min: 0,
    max: 96,
    step: 1,
    default: 0,
    unit: "px",
  },
  dither: {
    key: "dither",
    label: "Levels",
    min: 0,
    max: 16,
    step: 1,
    default: 0,
  },
  ditherSize: {
    key: "ditherSize",
    label: "Pixel",
    min: 1,
    max: 12,
    step: 1,
    default: 2,
    unit: "px",
  },
  brightness: {
    key: "brightness",
    label: "Brightness",
    min: -1,
    max: 1,
    step: 0.01,
    default: 0,
  },
  contrast: {
    key: "contrast",
    label: "Contrast",
    min: -1,
    max: 1,
    step: 0.01,
    default: 0,
  },
  saturation: {
    key: "saturation",
    label: "Saturation",
    min: 0,
    max: 2,
    step: 0.01,
    default: 1,
  },
  hue: {
    key: "hue",
    label: "Hue shift",
    min: -180,
    max: 180,
    step: 1,
    default: 0,
    unit: "°",
  },
}
