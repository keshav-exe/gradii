import { oklabToSrgb, rgbToHex, srgbToOklab, type Vec3 } from "@/lib/color"
import { loadImage } from "@/lib/overlay"

export interface Swatch {
  hex: string
  x: number
  y: number
  weight: number
}

/**
 * Pulls a palette out of a picture with k-means in OKLab, and remembers where
 * each colour lives so the mesh points land roughly where they were.
 */
export async function extractPalette(src: string, k = 5): Promise<Swatch[]> {
  const img = await loadImage(src)
  const N = 72
  const c = document.createElement("canvas")
  const ratio = img.naturalWidth / img.naturalHeight
  c.width = ratio >= 1 ? N : Math.round(N * ratio)
  c.height = ratio >= 1 ? Math.round(N / ratio) : N
  const ctx = c.getContext("2d", { willReadFrequently: true })!
  ctx.drawImage(img, 0, 0, c.width, c.height)
  const data = ctx.getImageData(0, 0, c.width, c.height).data

  const px: { lab: Vec3; x: number; y: number }[] = []
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 128) continue
    const n = i / 4
    px.push({
      lab: srgbToOklab([data[i] / 255, data[i + 1] / 255, data[i + 2] / 255]),
      x: (n % c.width) / c.width,
      y: Math.floor(n / c.width) / c.height,
    })
  }
  if (!px.length) return []

  const dist = (a: Vec3, b: Vec3) =>
    (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2

  // k-means++ seeding: each new centre far from the ones already picked.
  const centres: Vec3[] = [px[Math.floor(Math.random() * px.length)].lab]
  while (centres.length < k) {
    const d = px.map((p) => Math.min(...centres.map((c) => dist(p.lab, c))))
    const total = d.reduce((a, b) => a + b, 0)
    let r = Math.random() * total
    let idx = 0
    while (r > d[idx] && idx < d.length - 1) r -= d[idx++]
    centres.push(px[idx].lab)
  }

  const assign = new Array(px.length).fill(0)
  for (let iter = 0; iter < 14; iter++) {
    px.forEach((p, i) => {
      let best = 0
      let bd = Infinity
      centres.forEach((c, j) => {
        const d = dist(p.lab, c)
        if (d < bd) {
          bd = d
          best = j
        }
      })
      assign[i] = best
    })
    centres.forEach((_, j) => {
      const members = px.filter((_, i) => assign[i] === j)
      if (!members.length) return
      centres[j] = [0, 1, 2].map(
        (ch) => members.reduce((s, m) => s + m.lab[ch], 0) / members.length
      ) as Vec3
    })
  }

  return centres
    .map((lab, j) => {
      const members = px.filter((_, i) => assign[i] === j)
      const n = Math.max(1, members.length)
      return {
        hex: rgbToHex(oklabToSrgb(lab)),
        x: members.reduce((s, m) => s + m.x, 0) / n,
        y: members.reduce((s, m) => s + m.y, 0) / n,
        weight: members.length / px.length,
      }
    })
    .filter((s) => s.weight > 0)
    .sort((a, b) => b.weight - a.weight)
}

export function readFile(file: File) {
  return new Promise<string>((resolve, reject) => {
    const r = new FileReader()
    r.onload = () => resolve(r.result as string)
    r.onerror = () => reject(r.error)
    r.readAsDataURL(file)
  })
}
