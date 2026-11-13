import { hexToOklab } from "@/lib/color"
import { fragmentFor, VERTEX } from "./shader"
import { STYLE } from "./styles"
import type { Doc, StyleId } from "./types"

export type Uniforms = Record<string, number | number[]>

const cache = new WeakMap<Doc, Uniforms>()

/** Everything the shader needs from a document, except the frame. */
export function uniformsFor(doc: Doc): Uniforms {
  const hit = cache.get(doc)
  if (hit) return hit
  const colors = new Array(24).fill(0)
  const points = new Array(16).fill(0.5)
  doc.colors.slice(0, 8).forEach((c, i) => {
    const lab = hexToOklab(c.hex)
    colors.splice(i * 3, 3, ...lab)
    points.splice(i * 2, 2, c.x, c.y)
  })
  const def = STYLE[doc.style]
  const values = doc.params[doc.style] ?? {}
  const p = new Array(6).fill(0)
  def.params.forEach((d, i) => {
    const v = values[d.key] ?? d.default
    p[i] = d.uniform ? d.uniform(v) : v
  })
  const e = doc.effects
  const rad = Math.PI / 180
  const u: Uniforms = {
    u_colors: colors,
    u_points: points,
    u_count: Math.min(8, doc.colors.length),
    u_bg: hexToOklab(doc.background),
    u_center: [doc.center.x, doc.center.y],
    u_p: p,
    u_seed: doc.seed,
    u_grain: [e.grain, e.grainSize],
    u_vignette: e.vignette,
    u_glass: [e.glass, e.glassSize, e.glassAngle * rad],
    u_pixelate: e.pixelate,
    u_dither: [e.dither, e.ditherSize],
    u_adjust: [e.brightness, e.contrast, e.saturation, e.hue * rad],
  }
  cache.set(doc, u)
  return u
}

export interface Frame {
  /** Size of the whole image being drawn, in device pixels. */
  width: number
  height: number
  /** Device pixels per artboard pixel. */
  pxScale: number
  phase: number
  /** For tiled exports: this tile's corner (GL, bottom left) and size. */
  tile?: { x: number; y: number; w: number; h: number }
}

interface Program {
  program: WebGLProgram
  setters: Map<string, (v: number | number[]) => void>
}

export class Renderer {
  readonly gl: WebGL2RenderingContext
  private programs = new Map<StyleId, Program>()
  readonly maxSize: number

  constructor(
    readonly canvas: HTMLCanvasElement,
    opts: { preserve?: boolean } = {}
  ) {
    const gl = canvas.getContext("webgl2", {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      premultipliedAlpha: false,
      preserveDrawingBuffer: opts.preserve ?? false,
      powerPreference: "high-performance",
    })
    if (!gl) throw new Error("WebGL2 is not available")
    this.gl = gl
    const dims = gl.getParameter(gl.MAX_VIEWPORT_DIMS) as Int32Array
    this.maxSize = Math.min(
      gl.getParameter(gl.MAX_RENDERBUFFER_SIZE) as number,
      dims[0],
      dims[1]
    )
  }

  private compile(style: StyleId): Program {
    const existing = this.programs.get(style)
    if (existing) return existing
    const gl = this.gl
    const shader = (type: number, src: string) => {
      const s = gl.createShader(type)!
      gl.shaderSource(s, src)
      gl.compileShader(s)
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS) && !gl.isContextLost())
        throw new Error(gl.getShaderInfoLog(s) ?? "Shader failed")
      return s
    }
    const program = gl.createProgram()!
    gl.attachShader(program, shader(gl.VERTEX_SHADER, VERTEX))
    gl.attachShader(program, shader(gl.FRAGMENT_SHADER, fragmentFor(style)))
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS) && !gl.isContextLost())
      throw new Error(gl.getProgramInfoLog(program) ?? "Link failed")

    const setters = new Map<string, (v: number | number[]) => void>()
    const count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS) as number
    for (let i = 0; i < count; i++) {
      const info = gl.getActiveUniform(program, i)
      if (!info) continue
      const name = info.name.replace(/\[0\]$/, "")
      const loc = gl.getUniformLocation(program, info.name)
      const arr = (v: number | number[]) => (Array.isArray(v) ? v : [v])
      const set: Record<number, (v: number | number[]) => void> = {
        [gl.FLOAT]: (v) => gl.uniform1fv(loc, arr(v)),
        [gl.FLOAT_VEC2]: (v) => gl.uniform2fv(loc, arr(v)),
        [gl.FLOAT_VEC3]: (v) => gl.uniform3fv(loc, arr(v)),
        [gl.FLOAT_VEC4]: (v) => gl.uniform4fv(loc, arr(v)),
        [gl.INT]: (v) => gl.uniform1i(loc, arr(v)[0]),
      }
      if (set[info.type]) setters.set(name, set[info.type])
    }
    const made = { program, setters }
    this.programs.set(style, made)
    return made
  }

  /** Draws one frame. The canvas is resized to the frame (or tile). */
  render(doc: Doc, f: Frame) {
    const gl = this.gl
    if (gl.isContextLost()) return
    const w = f.tile?.w ?? f.width
    const h = f.tile?.h ?? f.height
    if (this.canvas.width !== w) this.canvas.width = w
    if (this.canvas.height !== h) this.canvas.height = h
    const { program, setters } = this.compile(doc.style)
    gl.useProgram(program)
    gl.viewport(0, 0, w, h)
    const all: Uniforms = {
      ...uniformsFor(doc),
      u_res: [f.width, f.height],
      u_offset: [f.tile?.x ?? 0, f.tile?.y ?? 0],
      u_pxScale: f.pxScale,
      u_phase: f.phase,
    }
    for (const [k, v] of Object.entries(all)) setters.get(k)?.(v)
    gl.drawArrays(gl.TRIANGLES, 0, 3)
  }

  /** Compiles every style ahead of time so switching never stutters. */
  warm(styles: StyleId[]) {
    for (const s of styles) this.compile(s)
  }

  dispose() {
    this.gl.getExtension("WEBGL_lose_context")?.loseContext()
  }
}

let shared: Renderer | null = null

/** One hidden renderer for thumbnails and exports. */
export function offscreen() {
  if (shared && !shared.gl.isContextLost()) return shared
  shared = new Renderer(document.createElement("canvas"), { preserve: true })
  return shared
}

/**
 * Draws a document at any size onto a 2D canvas, in tiles when it's bigger
 * than the GPU allows in one go.
 */
export function renderToCanvas(
  doc: Doc,
  width: number,
  height: number,
  phase: number,
  target?: HTMLCanvasElement
) {
  const r = offscreen()
  const out = target ?? document.createElement("canvas")
  out.width = width
  out.height = height
  const ctx = out.getContext("2d")!
  const pxScale = width / doc.size.w
  const step = Math.min(2048, r.maxSize)
  if (width <= step && height <= step) {
    r.render(doc, { width, height, pxScale, phase })
    ctx.drawImage(r.canvas, 0, 0)
    return out
  }
  for (let ty = 0; ty < height; ty += step) {
    for (let tx = 0; tx < width; tx += step) {
      const tw = Math.min(step, width - tx)
      const th = Math.min(step, height - ty)
      r.render(doc, {
        width,
        height,
        pxScale,
        phase,
        tile: { x: tx, y: height - ty - th, w: tw, h: th },
      })
      ctx.drawImage(r.canvas, tx, ty)
    }
  }
  return out
}

/** A small picture of a document, as a data URL. */
export function thumbnail(doc: Doc, w = 240, h?: number, phase = 0) {
  const height = h ?? Math.round((w * doc.size.h) / doc.size.w)
  const r = offscreen()
  r.render(doc, { width: w, height, pxScale: w / doc.size.w, phase })
  return r.canvas.toDataURL("image/webp", 0.85)
}
