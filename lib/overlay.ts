import { fontFor, nearestWeight } from "@/lib/fonts"
import type { BlendMode, Doc, ImageLayer, TextLayer } from "@/lib/engine/types"

export interface Box {
  x: number
  y: number
  w: number
  h: number
}

const images = new Map<string, Promise<HTMLImageElement>>()

export function loadImage(src: string) {
  let p = images.get(src)
  if (!p) {
    p = new Promise((resolve, reject) => {
      const img = new Image()
      img.decoding = "async"
      img.onload = () => resolve(img)
      img.onerror = reject
      img.src = src
    })
    images.set(src, p)
  }
  return p
}

export const composite = (b: BlendMode): GlobalCompositeOperation =>
  b === "normal" ? "source-over" : b

function fontString(t: TextLayer, px: number) {
  const f = fontFor(t.font)
  const italic = t.italic && f.italic ? "italic " : ""
  return `${italic}${nearestWeight(t.font, t.weight)} ${px}px ${f.family}`
}

/** Waits for the text layer's face, so the first draw isn't a fallback. */
export async function ensureFont(t: TextLayer) {
  if (!t.enabled || typeof document === "undefined") return
  try {
    await document.fonts.load(fontString(t, 64), t.content || "A")
  } catch {}
}

const lines = (t: TextLayer) =>
  (t.uppercase ? t.content.toUpperCase() : t.content).split("\n")

/** Draws the text layer and returns its box, in canvas pixels. */
export function drawText(
  ctx: CanvasRenderingContext2D,
  t: TextLayer,
  W: number,
  H: number
): Box | null {
  if (!t.enabled || !t.content.trim()) return null
  const px = (Math.min(W, H) * t.size) / 100
  ctx.save()
  ctx.font = fontString(t, px)
  if ("letterSpacing" in ctx)
    (
      ctx as CanvasRenderingContext2D & { letterSpacing: string }
    ).letterSpacing = `${t.tracking * px}px`
  const rows = lines(t)
  const lh = px * t.leading
  const widths = rows.map((r) => ctx.measureText(r).width)
  const bw = Math.max(...widths, 1)
  const bh = lh * rows.length
  const cx = t.x * W
  const cy = t.y * H
  const left = cx - bw / 2
  const top = cy - bh / 2

  ctx.globalAlpha = t.opacity
  ctx.globalCompositeOperation = composite(t.blend)
  ctx.fillStyle = t.color
  ctx.textBaseline = "middle"
  ctx.textAlign = t.align
  if (t.glow > 0) {
    ctx.shadowColor = t.color
    ctx.shadowBlur = t.glow * px * 0.9
  }
  const ax = t.align === "left" ? left : t.align === "right" ? left + bw : cx
  rows.forEach((row, i) => ctx.fillText(row, ax, top + lh * (i + 0.5)))
  ctx.restore()
  return { x: left, y: top, w: bw, h: bh }
}

/** Draws the image layer if its picture has loaded; returns its box. */
export function drawImageLayer(
  ctx: CanvasRenderingContext2D,
  l: ImageLayer,
  img: HTMLImageElement | null,
  W: number,
  H: number
): Box | null {
  if (!l.enabled || !l.src || !img) return null
  const w = (Math.min(W, H) * l.size) / 100
  const h = (w * img.naturalHeight) / Math.max(1, img.naturalWidth)
  const box = { x: l.x * W - w / 2, y: l.y * H - h / 2, w, h }
  ctx.save()
  ctx.globalAlpha = l.opacity
  ctx.globalCompositeOperation = composite(l.blend)
  ctx.drawImage(img, box.x, box.y, box.w, box.h)
  ctx.restore()
  return box
}

/** Both layers, for exports: the image sits under the text. */
export async function drawOverlay(
  ctx: CanvasRenderingContext2D,
  doc: Doc,
  W: number,
  H: number
) {
  await ensureFont(doc.text)
  const img =
    doc.image.enabled && doc.image.src
      ? await loadImage(doc.image.src).catch(() => null)
      : null
  drawImageLayer(ctx, doc.image, img, W, H)
  drawText(ctx, doc.text, W, H)
}

export const hasOverlay = (doc: Doc) =>
  (doc.text.enabled && !!doc.text.content.trim()) ||
  (doc.image.enabled && !!doc.image.src)
