import { zip } from "fflate"
import type { Doc } from "@/lib/engine/types"
import { ALL_SIZES } from "@/lib/sizes"
import { fileName, renderFull, toBlob } from "./image"

/** Renders the gradient at each device size and zips them up. */
export async function exportPack(
  doc: Doc,
  ids: string[],
  phase: number,
  onProgress: (done: number, total: number) => void
) {
  const files: Record<string, Uint8Array> = {}
  const sizes = ALL_SIZES.filter((s) => ids.includes(s.id))
  for (const [i, s] of sizes.entries()) {
    onProgress(i, sizes.length)
    // Let the progress paint between the heavy renders.
    await new Promise((r) => setTimeout(r, 16))
    const canvas = await renderFull(doc, 1, phase, { w: s.w, h: s.h })
    const blob = await toBlob(canvas, "png")
    files[fileName(doc, s.w, s.h, "png")] = new Uint8Array(
      await blob.arrayBuffer()
    )
  }
  onProgress(sizes.length, sizes.length)
  const data = await new Promise<Uint8Array>((resolve, reject) =>
    zip(files, { level: 0 }, (err, out) => (err ? reject(err) : resolve(out)))
  )
  return new Blob([data as BlobPart], { type: "application/zip" })
}
