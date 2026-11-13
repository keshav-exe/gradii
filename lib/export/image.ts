import { renderToCanvas } from "@/lib/engine/renderer"
import type { Doc } from "@/lib/engine/types"
import { drawOverlay, hasOverlay } from "@/lib/overlay"

export type ImageFormat = "png" | "jpeg" | "webp"

export const MAX_EDGE = 8192

/** The artboard at a multiple of its size, with the text and image on top. */
export async function renderFull(
  doc: Doc,
  scale: number,
  phase: number,
  size?: { w: number; h: number }
) {
  const target = size ?? doc.size
  // A different size reflows the gradient; effects keep their pixel scale.
  const d = size ? { ...doc, size } : doc
  const W = Math.round(target.w * scale)
  const H = Math.round(target.h * scale)
  const canvas = renderToCanvas(d, W, H, phase)
  if (hasOverlay(d)) await drawOverlay(canvas.getContext("2d")!, d, W, H)
  return canvas
}

export function toBlob(
  c: HTMLCanvasElement,
  format: ImageFormat,
  quality = 0.92
) {
  return new Promise<Blob>((resolve, reject) =>
    c.toBlob(
      (b) =>
        b ? resolve(b) : reject(new Error("The image was too large to encode")),
      `image/${format}`,
      format === "png" ? undefined : quality
    )
  )
}

export const fileName = (doc: Doc, w: number, h: number, ext: string) =>
  `gradii-${(doc.name || "gradient").toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${w}x${h}.${ext}`

/** Copies a PNG. The promise goes straight into ClipboardItem for Safari. */
export async function copyImage(doc: Doc, phase: number) {
  const blob = renderFull(doc, 1, phase).then((c) => toBlob(c, "png"))
  await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })])
}
