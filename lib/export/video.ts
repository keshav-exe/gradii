import { ArrayBufferTarget, Muxer } from "mp4-muxer"
import { renderToCanvas } from "@/lib/engine/renderer"
import { PERIOD } from "@/lib/engine/clock"
import type { Doc } from "@/lib/engine/types"
import { drawOverlay, hasOverlay } from "@/lib/overlay"

export interface VideoOptions {
  seconds: number
  fps: number
  /** Long edge in pixels; the short edge follows the artboard. */
  edge: number
  onProgress: (t: number) => void
  signal?: AbortSignal
}

export const canEncodeVideo = () =>
  typeof window !== "undefined" && "VideoEncoder" in window

const even = (n: number) => Math.max(2, Math.round(n / 2) * 2)

/** How many whole loops fit the clip, so its end meets its start. */
export const loopsFor = (seconds: number, speed: number) =>
  Math.max(1, Math.round((seconds * Math.max(speed, 0.05)) / PERIOD))

async function pickCodec(
  width: number,
  height: number,
  bitrate: number,
  fps: number
) {
  for (const codec of [
    "avc1.640034",
    "avc1.640033",
    "avc1.64002A",
    "avc1.4d0034",
  ]) {
    const config = { codec, width, height, bitrate, framerate: fps }
    const ok = await VideoEncoder.isConfigSupported(config).catch(() => null)
    if (ok?.supported) return config
  }
  return null
}

/**
 * A frame-exact, seamless MP4 loop through WebCodecs: each frame is rendered
 * offscreen at its own phase, so it's faster than real time and never drops.
 */
export async function exportVideo(doc: Doc, o: VideoOptions) {
  const landscape = doc.size.w >= doc.size.h
  const scale = o.edge / (landscape ? doc.size.w : doc.size.h)
  const width = even(doc.size.w * scale)
  const height = even(doc.size.h * scale)
  const bitrate = Math.min(60e6, Math.round(width * height * o.fps * 0.22))
  const config = await pickCodec(width, height, bitrate, o.fps)
  if (!config) throw new Error("This browser can't encode H.264 at that size")

  const muxer = new Muxer({
    target: new ArrayBufferTarget(),
    video: { codec: "avc", width, height, frameRate: o.fps },
    fastStart: "in-memory",
  })
  let failure: unknown = null
  const encoder = new VideoEncoder({
    output: (chunk, meta) => muxer.addVideoChunk(chunk, meta),
    error: (e) => (failure = e),
  })
  encoder.configure({ ...config, latencyMode: "quality" })

  const frames = Math.round(o.seconds * o.fps)
  const loops = loopsFor(o.seconds, doc.speed)
  const canvas = document.createElement("canvas")
  const overlay = hasOverlay(doc)
  const frameUs = 1e6 / o.fps

  for (let i = 0; i < frames; i++) {
    if (o.signal?.aborted) {
      encoder.close()
      throw new DOMException("Cancelled", "AbortError")
    }
    if (failure) throw failure
    const phase = ((i / frames) * loops * Math.PI * 2) % (Math.PI * 2)
    renderToCanvas(doc, width, height, phase, canvas)
    if (overlay) await drawOverlay(canvas.getContext("2d")!, doc, width, height)
    const frame = new VideoFrame(canvas, {
      timestamp: i * frameUs,
      duration: frameUs,
    })
    encoder.encode(frame, { keyFrame: i % (o.fps * 2) === 0 })
    frame.close()
    // Don't let the encoder queue run away from us.
    while (encoder.encodeQueueSize > 6)
      await new Promise((r) => setTimeout(r, 4))
    if (i % 4 === 0) {
      o.onProgress(i / frames)
      await new Promise((r) => setTimeout(r, 0))
    }
  }
  await encoder.flush()
  encoder.close()
  muxer.finalize()
  o.onProgress(1)
  return new Blob([muxer.target.buffer], { type: "video/mp4" })
}
