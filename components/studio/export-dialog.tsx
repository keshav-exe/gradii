"use client"

import { useEffect, useRef, useState } from "react"
import {
  Copy01Icon,
  Download04Icon,
  Link01Icon,
  Tick02Icon,
} from "@hugeicons/core-free-icons"
import { clock, PERIOD } from "@/lib/engine/clock"
import { toCSS, toEmbed, toHTMLPage } from "@/lib/export/code"
import { MAX_EDGE, type ImageFormat } from "@/lib/export/image"
import { exportPack } from "@/lib/export/pack"
import { canEncodeVideo, exportVideo, loopsFor } from "@/lib/export/video"
import { hasOverlay } from "@/lib/overlay"
import { ALL_SIZES, PACK } from "@/lib/sizes"
import { cn, downloadBlob } from "@/lib/utils"
import { useClientValue } from "@/hooks/use-media"
import { useStudio } from "@/store/studio"
import { Button } from "@/components/ui/button"
import { Icon } from "@/components/ui/icon"
import { Modal } from "@/components/ui/modal"
import { Segmented } from "@/components/ui/segmented"
import { SliderField } from "@/components/ui/slider-field"
import { toast } from "@/components/ui/toast"
import { copyCurrent, copyShareLink, downloadImage } from "./actions"

type Tab = "image" | "video" | "pack" | "code"

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[12.5px] text-ink-secondary">{label}</span>
      {children}
    </div>
  )
}

function Progress({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col gap-1.5" role="status">
      <div className="flex justify-between text-[12.5px] text-ink-secondary">
        <span>{label}</span>
        <span className="label tabular-nums">{Math.round(value * 100)}%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-surface-muted">
        <div
          className="h-full rounded-full bg-ink transition-[width] duration-200 ease-out"
          style={{ width: `${value * 100}%` }}
        />
      </div>
    </div>
  )
}

function ImagePane() {
  const size = useStudio((s) => s.doc.size)
  const [format, setFormat] = useState<ImageFormat>("png")
  const [scale, setScale] = useState(1)
  const [quality, setQuality] = useState(0.92)
  const [busy, setBusy] = useState(false)
  const fits = (k: number) => size.w * k <= MAX_EDGE && size.h * k <= MAX_EDGE
  const scales = [0.5, 1, 2, 3].filter((k) => k === 1 || fits(k))
  const W = Math.round(size.w * scale)
  const H = Math.round(size.h * scale)

  return (
    <div className="flex flex-col gap-4">
      <Field label="Format">
        <Segmented
          label="Format"
          value={format}
          onChange={setFormat}
          options={[
            { id: "png", label: "PNG" },
            { id: "jpeg", label: "JPG" },
            { id: "webp", label: "WebP" },
          ]}
        />
      </Field>
      <Field label="Size">
        <Segmented
          label="Scale"
          value={String(scale)}
          onChange={(v) => setScale(Number(v))}
          options={scales.map((k) => ({ id: String(k), label: `${k}×` }))}
        />
        <p className="label text-ink-tertiary tabular-nums">
          {W} × {H} px · {((W * H) / 1e6).toFixed(1)} MP
        </p>
      </Field>
      {format !== "png" && (
        <SliderField
          label="Quality"
          value={quality}
          min={0.5}
          max={1}
          step={0.01}
          format={(v) => `${Math.round(v * 100)}%`}
          onChange={setQuality}
        />
      )}
      <div className="flex gap-2 pt-1">
        <Button variant="secondary" className="flex-1" onClick={copyCurrent}>
          <Icon icon={Copy01Icon} />
          Copy PNG
        </Button>
        <Button
          variant="primary"
          className="flex-1"
          disabled={busy}
          onClick={async () => {
            setBusy(true)
            try {
              await downloadImage(format, scale, quality)
            } catch (e) {
              toast(e instanceof Error ? e.message : "Export failed", "error")
            }
            setBusy(false)
          }}
        >
          <Icon icon={Download04Icon} />
          {busy ? "Rendering…" : "Download"}
        </Button>
      </div>
    </div>
  )
}

function VideoPane() {
  const doc = useStudio((s) => s.doc)
  const [seconds, setSeconds] = useState(10)
  const [fps, setFps] = useState(30)
  const [edge, setEdge] = useState(1920)
  const [progress, setProgress] = useState<number | null>(null)
  const abort = useRef<AbortController | null>(null)
  const supported = useClientValue(canEncodeVideo, true)
  useEffect(() => () => abort.current?.abort(), [])

  const loops = loopsFor(seconds, doc.speed)
  const longEdge = Math.max(doc.size.w, doc.size.h)
  const edges = [1280, 1920, 2560, 3840].filter(
    (e) => e <= Math.max(1280, longEdge)
  )

  if (!supported)
    return (
      <p className="rounded-[12px] bg-surface-muted p-4 text-[13px] text-ink-secondary">
        Video export uses WebCodecs, which this browser doesn&rsquo;t have.
        Chrome, Edge, Safari 17+ and Firefox 130+ do.
      </p>
    )

  return (
    <div className="flex flex-col gap-4">
      <Field label="Length">
        <Segmented
          label="Length"
          value={String(seconds)}
          onChange={(v) => setSeconds(Number(v))}
          options={[6, 10, 15, 30].map((s) => ({
            id: String(s),
            label: `${s}s`,
          }))}
        />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Long edge">
          <Segmented
            label="Resolution"
            size="sm"
            value={String(edge)}
            onChange={(v) => setEdge(Number(v))}
            options={edges.map((e) => ({
              id: String(e),
              label: e === 3840 ? "4K" : `${Math.round((e * 9) / 16)}p`,
            }))}
          />
        </Field>
        <Field label="Frame rate">
          <Segmented
            label="Frame rate"
            size="sm"
            value={String(fps)}
            onChange={(v) => setFps(Number(v))}
            options={[24, 30, 60].map((f) => ({
              id: String(f),
              label: `${f}`,
            }))}
          />
        </Field>
      </div>
      <p className="text-[12.5px] leading-relaxed text-ink-secondary">
        {doc.speed === 0
          ? "Speed is set to still, so the clip won't move. Raise it under Gradient → Motion."
          : `An MP4 that loops seamlessly: ${loops} full ${loops === 1 ? "cycle" : "cycles"} in ${seconds} seconds${
              Math.abs((seconds * doc.speed) / PERIOD - loops) > 0.25
                ? ", so the pace is nudged to fit"
                : ""
            }.`}
        {hasOverlay(doc) && " Text and image layers are included."}
      </p>
      {progress !== null ? (
        <div className="flex items-end gap-3">
          <div className="flex-1">
            <Progress value={progress} label="Rendering frames" />
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => abort.current?.abort()}
          >
            Cancel
          </Button>
        </div>
      ) : (
        <Button
          variant="primary"
          onClick={async () => {
            abort.current = new AbortController()
            setProgress(0)
            try {
              const blob = await exportVideo(useStudio.getState().doc, {
                seconds,
                fps,
                edge,
                onProgress: setProgress,
                signal: abort.current.signal,
              })
              downloadBlob(
                blob,
                `gradii-${(doc.name || "loop").toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${seconds}s.mp4`
              )
              toast("Video ready")
            } catch (e) {
              if ((e as Error).name !== "AbortError")
                toast(
                  e instanceof Error ? e.message : "Video export failed",
                  "error"
                )
            }
            setProgress(null)
          }}
        >
          <Icon icon={Download04Icon} />
          Render MP4
        </Button>
      )}
    </div>
  )
}

function PackPane() {
  const [ids, setIds] = useState<string[]>(PACK)
  const [progress, setProgress] = useState<number | null>(null)
  const toggle = (id: string) =>
    setIds((xs) => (xs.includes(id) ? xs.filter((x) => x !== id) : [...xs, id]))
  const candidates = ALL_SIZES.filter(
    (s) => !["og", "x-header", "linkedin", "youtube"].includes(s.id)
  )
  return (
    <div className="flex flex-col gap-4">
      <p className="text-[12.5px] leading-relaxed text-ink-secondary">
        The same gradient, laid out for every screen you own. Points and layers
        keep their place relative to each frame.
      </p>
      <div className="grid grid-cols-2 gap-1.5">
        {candidates.map((s) => {
          const on = ids.includes(s.id)
          return (
            <button
              key={s.id}
              type="button"
              role="checkbox"
              aria-checked={on}
              onClick={() => toggle(s.id)}
              className={cn(
                "flex items-center gap-2 rounded-[10px] px-2.5 py-2 text-left shadow-[inset_0_0_0_1px_var(--color-hairline)] transition-colors duration-100",
                on ? "bg-surface-muted" : "hover:bg-ink/[0.03]"
              )}
            >
              <span
                className={cn(
                  "grid size-4 shrink-0 place-items-center rounded-[5px] transition-colors",
                  on
                    ? "bg-ink text-background"
                    : "shadow-[inset_0_0_0_1.5px_var(--color-ink-tertiary)]"
                )}
              >
                {on && (
                  <Icon
                    icon={Tick02Icon}
                    className="size-3"
                    strokeWidth={2.6}
                  />
                )}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-[12.5px] text-ink">
                  {s.label}
                </span>
                <span className="block label text-ink-tertiary tabular-nums">
                  {s.w}×{s.h}
                </span>
              </span>
            </button>
          )
        })}
      </div>
      {progress !== null ? (
        <Progress value={progress} label="Rendering wallpapers" />
      ) : (
        <Button
          variant="primary"
          disabled={!ids.length}
          onClick={async () => {
            setProgress(0)
            try {
              const doc = useStudio.getState().doc
              const blob = await exportPack(doc, ids, clock.phase, (d, t) =>
                setProgress(d / t)
              )
              downloadBlob(
                blob,
                `gradii-${(doc.name || "wallpapers").toLowerCase().replace(/[^a-z0-9]+/g, "-")}-pack.zip`
              )
              toast(`${ids.length} wallpapers ready`)
            } catch (e) {
              toast(
                e instanceof Error ? e.message : "Pack export failed",
                "error"
              )
            }
            setProgress(null)
          }}
        >
          <Icon icon={Download04Icon} />
          Download {ids.length} {ids.length === 1 ? "wallpaper" : "wallpapers"}{" "}
          (.zip)
        </Button>
      )}
    </div>
  )
}

function CodeBlock({
  code,
  label,
  onCopy,
}: {
  code: string
  label: string
  onCopy?: () => void
}) {
  const [done, setDone] = useState(false)
  return (
    <div className="overflow-hidden rounded-[12px] bg-surface-muted shadow-[inset_0_0_0_1px_var(--color-hairline)]">
      <div className="flex items-center justify-between border-b border-hairline py-1 pr-1 pl-3">
        <span className="label text-ink-tertiary">{label}</span>
        <Button
          variant="ghost"
          size="xs"
          onClick={async () => {
            await navigator.clipboard.writeText(code)
            setDone(true)
            onCopy?.()
            setTimeout(() => setDone(false), 1400)
          }}
        >
          <Icon icon={done ? Tick02Icon : Copy01Icon} className="size-3.5" />
          {done ? "Copied" : "Copy"}
        </Button>
      </div>
      <pre className="max-h-40 scroll-quiet overflow-auto p-3 label text-[11.5px] leading-relaxed whitespace-pre text-ink select-text">
        {code}
      </pre>
    </div>
  )
}

function CodePane() {
  const doc = useStudio((s) => s.doc)
  const embed = toEmbed(doc, clock.phase)
  return (
    <div className="flex flex-col gap-4">
      <Field label="Share">
        <Button variant="secondary" onClick={copyShareLink}>
          <Icon icon={Link01Icon} />
          Copy a link to this gradient
        </Button>
      </Field>
      <Field label="Live canvas">
        <p className="-mt-0.5 text-[12px] leading-relaxed text-ink-tertiary">
          The real shader in {Math.round(embed.length / 1024)} KB, no
          dependencies. Drop it in any positioned element. It holds still for
          reduced motion.
        </p>
        <CodeBlock code={embed} label="HTML" />
        <Button
          variant="ghost"
          size="sm"
          className="self-start"
          onClick={() =>
            downloadBlob(
              new Blob([toHTMLPage(doc, clock.phase)], { type: "text/html" }),
              "gradii.html"
            )
          }
        >
          <Icon icon={Download04Icon} className="size-[15px]" />
          Download as a page
        </Button>
      </Field>
      <Field label="CSS">
        <p className="-mt-0.5 text-[12px] leading-relaxed text-ink-tertiary">
          A close cousin in plain CSS, without grain, motion or effects.
        </p>
        <CodeBlock code={toCSS(doc)} label="CSS" />
      </Field>
    </div>
  )
}

export function ExportDialog() {
  const open = useStudio((s) => s.dialog === "export")
  const setUI = useStudio((s) => s.setUI)
  const [tab, setTab] = useState<Tab>("image")
  return (
    <Modal
      open={open}
      onOpenChange={(o) => setUI({ dialog: o ? "export" : null })}
      title="Export"
      description="Rendered fresh at full resolution, from the frame on screen."
    >
      <div className="flex flex-col gap-5">
        <Segmented
          label="Export as"
          value={tab}
          onChange={setTab}
          options={[
            { id: "image", label: "Image" },
            { id: "video", label: "Video" },
            { id: "pack", label: "Wallpapers" },
            { id: "code", label: "Code" },
          ]}
        />
        {tab === "image" && <ImagePane />}
        {tab === "video" && <VideoPane />}
        {tab === "pack" && <PackPane />}
        {tab === "code" && <CodePane />}
      </div>
    </Modal>
  )
}
