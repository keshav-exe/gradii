"use client"

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react"
import {
  Cancel01Icon,
  Delete02Icon,
  LockedIcon,
  SquareUnlock02Icon,
} from "@hugeicons/core-free-icons"
import { clock, PERIOD } from "@/lib/engine/clock"
import { Renderer } from "@/lib/engine/renderer"
import { STYLE, STYLES } from "@/lib/engine/styles"
import {
  drawImageLayer,
  drawText,
  ensureFont,
  loadImage,
  type Box,
} from "@/lib/overlay"
import { clamp, cn } from "@/lib/utils"
import { useStudio } from "@/store/studio"
import { Button } from "@/components/ui/button"
import { ColorPicker } from "@/components/ui/color-picker"
import { Icon } from "@/components/ui/icon"
import { Pop } from "@/components/ui/popover"
import { Tip } from "@/components/ui/tooltip"
import { paletteFromFile } from "./actions"

const TAU = Math.PI * 2

/** How much of the screen's pixel density the live preview spends. */
function useQuality() {
  const q = useRef(1)
  const samples = useRef<number[]>([])
  const [sample] = useState(() => (ms: number) => {
    const s = samples.current
    s.push(ms)
    if (s.length < 24) return
    const avg = s.reduce((a, b) => a + b, 0) / s.length
    s.length = 0
    if (avg > 22 && q.current > 0.45)
      q.current = Math.max(0.45, q.current * 0.8)
    else if (avg < 13 && q.current < 1)
      q.current = Math.min(1, q.current * 1.15)
  })
  return { q, sample }
}

export function Stage({
  inset,
}: {
  inset: { top: number; bottom: number; x: number }
}) {
  const doc = useStudio((s) => s.doc)
  const handlesOn = useStudio((s) => s.handles)
  const zen = useStudio((s) => s.zen)
  const selected = useStudio((s) => s.selected)
  const setUI = useStudio((s) => s.setUI)
  const setColor = useStudio((s) => s.setColor)

  const wrapRef = useRef<HTMLDivElement>(null)
  const artRef = useRef<HTMLDivElement>(null)
  const glRef = useRef<HTMLCanvasElement>(null)
  const imgRef = useRef<HTMLCanvasElement>(null)
  const textRef = useRef<HTMLCanvasElement>(null)
  const renderer = useRef<Renderer | null>(null)
  const dirty = useRef(true)
  const boxes = useRef<{ text: Box | null; image: Box | null }>({
    text: null,
    image: null,
  })
  const [failed, setFailed] = useState(false)
  const [box, setBox] = useState({ w: 0, h: 0 })
  const [guides, setGuides] = useState({ x: false, y: false })
  const [dropping, setDropping] = useState(false)
  const { q, sample } = useQuality()

  // Fit the artboard into the space left around the chrome.
  useLayoutEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const fit = () => {
      const r = el.getBoundingClientRect()
      const pad = zen ? 24 : inset.x
      const aw = Math.max(40, r.width - pad * 2)
      const ah = Math.max(40, r.height - (zen ? 48 : inset.top + inset.bottom))
      const s = Math.min(aw / doc.size.w, ah / doc.size.h)
      setBox({ w: Math.round(doc.size.w * s), h: Math.round(doc.size.h * s) })
    }
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(el)
    return () => ro.disconnect()
  }, [doc.size.w, doc.size.h, zen, inset.top, inset.bottom, inset.x])

  // The GL renderer and its loop.
  useEffect(() => {
    const canvas = glRef.current
    if (!canvas) return
    try {
      renderer.current = new Renderer(canvas)
    } catch {
      // WebGL2 is off: an external system failing, reported once.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFailed(true)
      return
    }
    const r = renderer.current
    // Compile the rest in idle time, so the first switch is instant.
    const idle = setTimeout(() => {
      try {
        r.warm(STYLES.map((s) => s.id))
      } catch {}
      dirty.current = true
    }, 300)
    const onLost = (e: Event) => e.preventDefault()
    const onRestored = () => {
      renderer.current = new Renderer(canvas)
      dirty.current = true
    }
    canvas.addEventListener("webglcontextlost", onLost)
    canvas.addEventListener("webglcontextrestored", onRestored)

    let raf = 0
    let last = performance.now()
    const unsub = useStudio.subscribe((s, p) => {
      if (s.doc !== p.doc || s.playing !== p.playing) dirty.current = true
    })
    const loop = (t: number) => {
      raf = requestAnimationFrame(loop)
      const s = useStudio.getState()
      const dt = Math.min(0.1, (t - last) / 1000)
      last = t
      const moving = s.playing && s.doc.speed > 0
      if (moving) {
        clock.phase = (clock.phase + (dt * s.doc.speed * TAU) / PERIOD) % TAU
        dirty.current = true
      }
      if (!dirty.current || !renderer.current) return
      dirty.current = false
      const el = glRef.current!
      const cssW = el.clientWidth
      const cssH = el.clientHeight
      if (!cssW || !cssH) return
      const dpr =
        Math.min(window.devicePixelRatio || 1, 2) * (moving ? q.current : 1)
      // Never more than ~5 MP per frame, however big the screen.
      const cap = Math.min(1, Math.sqrt(5e6 / (cssW * cssH * dpr * dpr)))
      const w = Math.max(1, Math.round(cssW * dpr * cap))
      const h = Math.max(1, Math.round(cssH * dpr * cap))
      renderer.current.render(s.doc, {
        width: w,
        height: h,
        pxScale: w / s.doc.size.w,
        phase: clock.phase,
      })
      // Frame interval is the honest measure: GPU work finishes later.
      if (moving && document.visibilityState === "visible") sample(dt * 1000)
    }
    raf = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(idle)
      unsub()
      canvas.removeEventListener("webglcontextlost", onLost)
      canvas.removeEventListener("webglcontextrestored", onRestored)
      // Not disposed: a remount (Strict Mode, fast refresh) reuses this context.
      void r
      renderer.current = null
    }
  }, [q, sample])

  useEffect(() => {
    dirty.current = true
  }, [box])

  // The text and image layers, drawn by the same code the export uses.
  const drawOverlays = useCallback(async () => {
    const { doc } = useStudio.getState()
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const W = Math.round(box.w * dpr)
    const H = Math.round(box.h * dpr)
    if (!W || !H) return
    const prep = (c: HTMLCanvasElement | null) => {
      if (!c) return null
      if (c.width !== W) c.width = W
      if (c.height !== H) c.height = H
      const ctx = c.getContext("2d")!
      ctx.clearRect(0, 0, W, H)
      return ctx
    }
    await ensureFont(doc.text)
    const img =
      doc.image.enabled && doc.image.src
        ? await loadImage(doc.image.src).catch(() => null)
        : null
    const latest = useStudio.getState().doc
    if (latest.text !== doc.text || latest.image !== doc.image) return
    const ic = prep(imgRef.current)
    const tc = prep(textRef.current)
    const scale = (b: Box | null) =>
      b && { x: b.x / dpr, y: b.y / dpr, w: b.w / dpr, h: b.h / dpr }
    boxes.current.image = scale(
      ic
        ? drawImageLayer(ic, { ...doc.image, blend: "normal" }, img, W, H)
        : null
    )
    boxes.current.text = scale(
      tc ? drawText(tc, { ...doc.text, blend: "normal" }, W, H) : null
    )
  }, [box])

  useEffect(() => {
    drawOverlays()
  }, [drawOverlays, doc.text, doc.image])

  // Fonts that arrive late (first pick of a family) trigger a redraw.
  useEffect(() => {
    const redo = () => drawOverlays()
    document.fonts?.addEventListener?.("loadingdone", redo)
    return () => document.fonts?.removeEventListener?.("loadingdone", redo)
  }, [drawOverlays])

  /* ---- Pointer: drag colour points, the centre, and the layers ---- */

  const toUV = (e: { clientX: number; clientY: number }) => {
    const r = artRef.current!.getBoundingClientRect()
    return {
      x: (e.clientX - r.left) / r.width,
      y: (e.clientY - r.top) / r.height,
    }
  }

  const SNAP = 6
  const snap = (v: number, size: number) =>
    Math.abs(v - 0.5) * size < SNAP ? 0.5 : v

  const onArtPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return
    const r = artRef.current!.getBoundingClientRect()
    const px = e.clientX - r.left
    const py = e.clientY - r.top
    const hit = (b: Box | null) =>
      b &&
      px >= b.x - 8 &&
      px <= b.x + b.w + 8 &&
      py >= b.y - 8 &&
      py <= b.y + b.h + 8
    const s = useStudio.getState()
    const layer = hit(boxes.current.text)
      ? "text"
      : hit(boxes.current.image)
        ? "image"
        : null
    if (!layer) {
      if (selected) setUI({ selected: null })
      return
    }
    e.preventDefault()
    const start = toUV(e)
    const origin =
      layer === "text"
        ? { x: s.doc.text.x, y: s.doc.text.y }
        : { x: s.doc.image.x, y: s.doc.image.y }
    const el = e.currentTarget as HTMLElement
    el.setPointerCapture(e.pointerId)
    const move = (ev: PointerEvent) => {
      const p = toUV(ev)
      const x = snap(clamp(origin.x + p.x - start.x, -0.2, 1.2), r.width)
      const y = snap(clamp(origin.y + p.y - start.y, -0.2, 1.2), r.height)
      setGuides({ x: x === 0.5, y: y === 0.5 })
      const st = useStudio.getState()
      if (layer === "text") st.setText({ x, y })
      else st.setImage({ x, y })
    }
    const up = () => {
      setGuides({ x: false, y: false })
      el.removeEventListener("pointermove", move)
      el.removeEventListener("pointerup", up)
      el.removeEventListener("pointercancel", up)
    }
    el.addEventListener("pointermove", move)
    el.addEventListener("pointerup", up)
    el.addEventListener("pointercancel", up)
  }

  const onArtDoubleClick = (e: React.MouseEvent) => {
    if (!STYLE[doc.style].points || doc.colors.length >= 8) return
    const p = toUV(e)
    useStudio.getState().addColor({ x: clamp(p.x, 0, 1), y: clamp(p.y, 0, 1) })
  }

  const [openId, setOpenId] = useState<string | null>(null)
  const moved = useRef(false)

  const dragHandle = (
    e: React.PointerEvent,
    apply: (x: number, y: number) => void
  ) => {
    if (e.button !== 0) return
    e.stopPropagation()
    moved.current = false
    const el = e.currentTarget as HTMLElement
    el.setPointerCapture(e.pointerId)
    const sx = e.clientX
    const sy = e.clientY
    const move = (ev: PointerEvent) => {
      if (!moved.current && Math.hypot(ev.clientX - sx, ev.clientY - sy) < 3)
        return
      if (!moved.current) dismissPointsHint()
      moved.current = true
      setOpenId(null)
      const p = toUV(ev)
      apply(clamp(p.x, 0, 1), clamp(p.y, 0, 1))
    }
    const up = () => {
      el.removeEventListener("pointermove", move)
      el.removeEventListener("pointerup", up)
      el.removeEventListener("pointercancel", up)
    }
    el.addEventListener("pointermove", move)
    el.addEventListener("pointerup", up)
    el.addEventListener("pointercancel", up)
  }

  const def = STYLE[doc.style]
  const showHandles = handlesOn && !zen

  return (
    <div
      ref={wrapRef}
      className={cn(
        "relative h-full w-full overflow-hidden canvas",
        dropping &&
          "after:absolute after:inset-3 after:rounded-[18px] after:border-2 after:border-dashed after:border-accent"
      )}
      onDragOver={(e) => {
        if (![...e.dataTransfer.types].includes("Files")) return
        e.preventDefault()
        setDropping(true)
      }}
      onDragLeave={() => setDropping(false)}
      onDrop={(e) => {
        e.preventDefault()
        setDropping(false)
        const f = e.dataTransfer.files[0]
        if (f) paletteFromFile(f)
      }}
      onPointerDown={(e) => {
        if (e.target === e.currentTarget && selected) setUI({ selected: null })
      }}
    >
      <div
        className="absolute flex items-center justify-center"
        style={{
          left: zen ? 24 : inset.x,
          right: zen ? 24 : inset.x,
          top: zen ? 24 : inset.top,
          bottom: zen ? 24 : inset.bottom,
        }}
      >
        <div
          ref={artRef}
          onPointerDown={onArtPointerDown}
          onDoubleClick={onArtDoubleClick}
          className="relative isolate shadow-window"
          style={{
            width: box.w,
            height: box.h,
            borderRadius: Math.min(14, box.w * 0.02),
          }}
        >
          <div
            className="absolute inset-0 overflow-hidden"
            style={{ borderRadius: "inherit" }}
          >
            <canvas ref={glRef} className="absolute inset-0 block size-full" />
            <canvas
              ref={imgRef}
              className="pointer-events-none absolute inset-0 block size-full"
              style={{
                mixBlendMode:
                  doc.image.blend === "normal" ? undefined : doc.image.blend,
              }}
            />
            <canvas
              ref={textRef}
              className="pointer-events-none absolute inset-0 block size-full"
              style={{
                mixBlendMode:
                  doc.text.blend === "normal" ? undefined : doc.text.blend,
              }}
            />
            {failed && (
              <div className="absolute inset-0 grid place-items-center bg-chrome p-6 text-center text-sm text-chrome-muted">
                Gradii needs WebGL2, which this browser has turned off.
              </div>
            )}
          </div>

          {guides.x && (
            <div className="pointer-events-none absolute inset-y-0 left-1/2 w-px bg-accent" />
          )}
          {guides.y && (
            <div className="pointer-events-none absolute inset-x-0 top-1/2 h-px bg-accent" />
          )}

          {showHandles &&
            def.points &&
            doc.colors.map((c, i) => {
              const on = selected === c.id
              return (
                <Pop
                  key={c.id}
                  open={openId === c.id}
                  onOpenChange={(o) => {
                    if (o && moved.current) return
                    setOpenId(o ? c.id : null)
                    if (o) setUI({ selected: c.id })
                  }}
                  side="right"
                  align="center"
                  trigger={
                    <button
                      type="button"
                      aria-label={`Colour ${i + 1}, ${c.hex}. Drag to move.`}
                      onPointerDown={(e) => {
                        setUI({ selected: c.id })
                        dragHandle(e, (x, y) => setColor(c.id, { x, y }))
                      }}
                      onKeyDown={(e) => {
                        const k = e.shiftKey ? 0.05 : 0.01
                        const d = {
                          ArrowLeft: [-k, 0],
                          ArrowRight: [k, 0],
                          ArrowUp: [0, -k],
                          ArrowDown: [0, k],
                        }[e.key]
                        if (!d) return
                        e.preventDefault()
                        setColor(c.id, {
                          x: clamp(c.x + d[0], 0, 1),
                          y: clamp(c.y + d[1], 0, 1),
                        })
                      }}
                      className={cn(
                        "absolute -translate-x-1/2 -translate-y-1/2 cursor-grab touch-none rounded-full border-[2.5px] border-white transition-[width,height,box-shadow] duration-150 ease-out outline-none active:cursor-grabbing",
                        "shadow-[0_0_0_1px_rgb(0_0_0/0.18),0_2px_8px_rgb(0_0_0/0.3)] focus-visible:shadow-[0_0_0_2px_rgb(0_0_0/0.55),0_0_0_5px_#fff]",
                        on ? "z-10 size-[26px]" : "size-5 hover:size-[23px]"
                      )}
                      style={{
                        left: `${c.x * 100}%`,
                        top: `${c.y * 100}%`,
                        backgroundColor: c.hex,
                      }}
                    />
                  }
                >
                  <ColorPicker
                    value={c.hex}
                    onChange={(hex) => setColor(c.id, { hex })}
                    footer={
                      <HandleFooter
                        id={c.id}
                        locked={!!c.locked}
                        onDone={() => setOpenId(null)}
                      />
                    }
                  />
                </Pop>
              )
            })}

          {showHandles && def.center && (
            <button
              type="button"
              aria-label="Centre. Drag to move."
              onPointerDown={(e) =>
                dragHandle(e, (x, y) =>
                  useStudio.getState().set({ center: { x, y } })
                )
              }
              className="absolute size-6 -translate-x-1/2 -translate-y-1/2 cursor-grab touch-none rounded-full border-[2.5px] border-white bg-white/25 shadow-[0_0_0_1px_rgb(0_0_0/0.18),0_2px_8px_rgb(0_0_0/0.3)] backdrop-blur-sm active:cursor-grabbing"
              style={{
                left: `${doc.center.x * 100}%`,
                top: `${doc.center.y * 100}%`,
              }}
            >
              <span className="absolute top-1/2 left-1/2 size-1.5 -translate-1/2 rounded-full bg-white" />
            </button>
          )}
        </div>
      </div>
      {showHandles && def.points && <PointsHint top={inset.top} />}
    </div>
  )
}

const HINT_KEY = "gradii:hint-points"
const read = () => {
  try {
    return !localStorage.getItem(HINT_KEY)
  } catch {
    return false
  }
}
export function dismissPointsHint() {
  try {
    localStorage.setItem(HINT_KEY, "1")
  } catch {}
  window.dispatchEvent(new Event(HINT_KEY))
}

/** Said once: the points are the interface. Gone after your first drag. */
function PointsHint({ top }: { top: number }) {
  const show = useSyncExternalStore(
    (cb) => {
      window.addEventListener(HINT_KEY, cb)
      return () => window.removeEventListener(HINT_KEY, cb)
    },
    read,
    () => false
  )
  if (!show) return null
  return (
    <div
      className="absolute left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 rounded-[11px] plaque py-1 pr-1 pl-3 text-[12.5px]"
      style={{ top: top - 4 + 36 }}
      role="status"
    >
      <span
        className="size-2.5 rounded-full border-2 border-white bg-[#2dd4bf]"
        aria-hidden
      />
      <span className="text-chrome-ink">Drag the points</span>
      <span className="hidden text-chrome-muted sm:inline">
        · click one to recolour · double-click to add
      </span>
      <button
        type="button"
        onClick={dismissPointsHint}
        aria-label="Dismiss hint"
        className="relative grid size-6 place-items-center rounded-[7px] text-chrome-muted transition-colors duration-150 before:absolute before:-inset-1.5 hover:bg-chrome-lift hover:text-chrome-ink"
      >
        <Icon icon={Cancel01Icon} className="size-3" strokeWidth={2.2} />
      </button>
    </div>
  )
}

function HandleFooter({
  id,
  locked,
  onDone,
}: {
  id: string
  locked: boolean
  onDone: () => void
}) {
  const setColor = useStudio((s) => s.setColor)
  const remove = useStudio((s) => s.removeColor)
  const count = useStudio((s) => s.doc.colors.length)
  return (
    <div className="flex items-center gap-1.5 border-t border-hairline pt-2.5">
      <Tip
        label={
          locked ? "Unlock: shuffles can change it" : "Lock: shuffles keep it"
        }
      >
        <Button
          variant="ghost"
          size="xs"
          aria-pressed={locked}
          onClick={() => setColor(id, { locked: !locked })}
          className={cn(locked && "text-ink")}
        >
          <Icon
            icon={locked ? LockedIcon : SquareUnlock02Icon}
            className="size-[15px]"
          />
          {locked ? "Locked" : "Lock"}
        </Button>
      </Tip>
      <Button
        variant="ghost"
        size="xs"
        className="ml-auto hover:text-[oklch(0.6_0.2_25)]"
        disabled={count <= 2}
        onClick={() => {
          remove(id)
          onDone()
        }}
      >
        <Icon icon={Delete02Icon} className="size-[15px]" />
        Remove
      </Button>
    </div>
  )
}
