/**
 * Colour maths. Gradients blend in OKLab so the midpoints stay vivid instead
 * of going grey, and new palettes are picked in OKLCH so lightness is even.
 */

export type Vec3 = [number, number, number]

export function hexToRgb(hex: string): Vec3 {
  let h = hex.replace("#", "").trim()
  if (h.length === 3)
    h = h
      .split("")
      .map((c) => c + c)
      .join("")
  const n = parseInt(h.slice(0, 6), 16)
  if (Number.isNaN(n)) return [0, 0, 0]
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]
}

export function rgbToHex([r, g, b]: Vec3) {
  const to = (v: number) =>
    Math.round(Math.min(1, Math.max(0, v)) * 255)
      .toString(16)
      .padStart(2, "0")
  return `#${to(r)}${to(g)}${to(b)}`
}

export const isHex = (s: string) =>
  /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.test(s.trim())

export function normalizeHex(s: string) {
  const h = s.trim().replace("#", "").toLowerCase()
  return h.length === 3
    ? `#${h
        .split("")
        .map((c) => c + c)
        .join("")}`
    : `#${h}`
}

const toLinear = (c: number) =>
  c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
const toGamma = (c: number) =>
  c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055

export function srgbToOklab([r, g, b]: Vec3): Vec3 {
  const lr = toLinear(r)
  const lg = toLinear(g)
  const lb = toLinear(b)
  const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb)
  const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb)
  const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb)
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ]
}

function oklabToLinear([L, a, b]: Vec3): Vec3 {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ]
}

export function oklabToSrgb(lab: Vec3): Vec3 {
  const [r, g, b] = oklabToLinear(lab)
  return [toGamma(r), toGamma(g), toGamma(b)]
}

export const hexToOklab = (hex: string) => srgbToOklab(hexToRgb(hex))

/** L 0–1, C 0–0.37, H degrees. Chroma is pulled in until it fits sRGB. */
export function oklchToHex(L: number, C: number, H: number) {
  const h = (H * Math.PI) / 180
  let c = C
  for (let i = 0; i < 24; i++) {
    const lin = oklabToLinear([L, c * Math.cos(h), c * Math.sin(h)])
    if (lin.every((v) => v >= -0.0005 && v <= 1.0005)) break
    c *= 0.9
  }
  return rgbToHex(oklabToSrgb([L, c * Math.cos(h), c * Math.sin(h)]))
}

export function hexToOklch(hex: string): Vec3 {
  const [L, a, b] = hexToOklab(hex)
  const C = Math.hypot(a, b)
  let H = (Math.atan2(b, a) * 180) / Math.PI
  if (H < 0) H += 360
  return [L, C, H]
}

/** WCAG relative luminance, for picking legible ink over a colour. */
export function luminance(hex: string) {
  const [r, g, b] = hexToRgb(hex).map(toLinear)
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

export const readableInk = (hex: string) =>
  luminance(hex) > 0.36 ? "#0a0a0a" : "#ffffff"

/** The colour halfway between two others, in OKLab. */
export function mixHex(a: string, b: string, t = 0.5) {
  const A = hexToOklab(a)
  const B = hexToOklab(b)
  return rgbToHex(
    oklabToSrgb([
      A[0] + (B[0] - A[0]) * t,
      A[1] + (B[1] - A[1]) * t,
      A[2] + (B[2] - A[2]) * t,
    ])
  )
}
