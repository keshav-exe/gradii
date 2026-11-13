"use client"

import { clock } from "@/lib/engine/clock"
import { thumbnail } from "@/lib/engine/renderer"
import {
  copyImage,
  fileName,
  renderFull,
  toBlob,
  type ImageFormat,
} from "@/lib/export/image"
import { extractPalette, readFile } from "@/lib/extract"
import { shareUrl } from "@/lib/share"
import { downloadBlob } from "@/lib/utils"
import { useStudio } from "@/store/studio"
import { toast } from "@/components/ui/toast"

const doc = () => useStudio.getState().doc

export async function copyCurrent() {
  try {
    await copyImage(doc(), clock.phase)
    toast("Image copied")
  } catch {
    toast("Couldn't copy the image here. Try Export instead.", "error")
  }
}

export async function downloadImage(
  format: ImageFormat,
  scale: number,
  quality = 0.92
) {
  const d = doc()
  const canvas = await renderFull(d, scale, clock.phase)
  const blob = await toBlob(canvas, format, quality)
  downloadBlob(
    blob,
    fileName(d, canvas.width, canvas.height, format === "jpeg" ? "jpg" : format)
  )
}

export function saveCurrent() {
  const d = doc()
  const thumb = thumbnail(d, 320, Math.round((320 * 10) / 16), clock.phase)
  useStudio.getState().save(thumb)
  toast("Saved to your library")
}

export async function copyShareLink() {
  const url = shareUrl(doc(), clock.phase)
  try {
    await navigator.clipboard.writeText(url)
    toast(
      doc().image.src
        ? "Link copied (without your uploaded image)"
        : "Link copied"
    )
    return true
  } catch {
    toast("Couldn't reach the clipboard", "error")
    return false
  }
}

/** Pulls a palette (and rough positions) from a picture. */
export async function paletteFromFile(file: File) {
  if (!file.type.startsWith("image/"))
    return toast("That isn't an image", "error")
  try {
    const src = await readFile(file)
    const count = Math.max(3, Math.min(6, doc().colors.length))
    const swatches = await extractPalette(src, count)
    if (!swatches.length) throw new Error()
    const s = useStudio.getState()
    s.setPalette(swatches.map((w) => w.hex))
    // Put each colour roughly where it lives in the picture.
    const next = useStudio.getState().doc.colors
    swatches.forEach(
      (w, i) => next[i] && s.setColor(next[i].id, { x: w.x, y: w.y })
    )
    toast("Palette taken from your image")
  } catch {
    toast("Couldn't read colours from that image", "error")
  }
}

export async function imageLayerFromFile(file: File) {
  if (!file.type.startsWith("image/"))
    return toast("That isn't an image", "error")
  if (file.size > 8 * 1024 * 1024)
    return toast("Images up to 8 MB, please", "error")
  const src = await readFile(file)
  useStudio.getState().setImage({ src, name: file.name, enabled: true })
}
