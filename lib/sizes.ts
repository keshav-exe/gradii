export interface SizePreset {
  id: string
  label: string
  w: number
  h: number
}

export interface SizeGroup {
  label: string
  sizes: SizePreset[]
}

export const SIZE_GROUPS: SizeGroup[] = [
  {
    label: "Desktop",
    sizes: [
      { id: "4k", label: "4K UHD", w: 3840, h: 2160 },
      { id: "5k", label: "5K Retina", w: 5120, h: 2880 },
      { id: "mbp14", label: "MacBook Pro 14″", w: 3024, h: 1964 },
      { id: "mba13", label: "MacBook Air 13″", w: 2560, h: 1664 },
      { id: "ultrawide", label: "Ultrawide", w: 3440, h: 1440 },
      { id: "qhd", label: "1440p", w: 2560, h: 1440 },
      { id: "fhd", label: "1080p", w: 1920, h: 1080 },
    ],
  },
  {
    label: "Phone & tablet",
    sizes: [
      { id: "iphone-max", label: "iPhone Pro Max", w: 1320, h: 2868 },
      { id: "iphone", label: "iPhone Pro", w: 1206, h: 2622 },
      { id: "android", label: "Android QHD+", w: 1440, h: 3200 },
      { id: "ipad-13", label: "iPad Pro 13″", w: 2064, h: 2752 },
      { id: "ipad-11", label: "iPad Air 11″", w: 1640, h: 2360 },
    ],
  },
  {
    label: "Social",
    sizes: [
      { id: "square", label: "Square", w: 2160, h: 2160 },
      { id: "portrait", label: "Instagram post", w: 1080, h: 1350 },
      { id: "story", label: "Story & Reel", w: 1080, h: 1920 },
      { id: "og", label: "Open Graph", w: 1200, h: 630 },
      { id: "x-header", label: "X header", w: 1500, h: 500 },
      { id: "linkedin", label: "LinkedIn banner", w: 1584, h: 396 },
      { id: "youtube", label: "YouTube thumbnail", w: 1280, h: 720 },
    ],
  },
]

export const ALL_SIZES = SIZE_GROUPS.flatMap((g) => g.sizes)

export const sizeLabel = (w: number, h: number) =>
  ALL_SIZES.find((s) => s.w === w && s.h === h)?.label ?? "Custom"

/** The wallpaper pack: one export per device, all from the same gradient. */
export const PACK = [
  "5k",
  "mbp14",
  "ultrawide",
  "iphone-max",
  "android",
  "ipad-13",
]

export function aspectLabel(w: number, h: number) {
  const g = (a: number, b: number): number => (b ? g(b, a % b) : a)
  const d = g(w, h)
  const a = w / d
  const b = h / d
  return a <= 32 && b <= 32 ? `${a}:${b}` : (w / h).toFixed(2)
}
