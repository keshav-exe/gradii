"use client"

import { useEffect, useState, useSyncExternalStore } from "react"
import {
  Cancel01Icon,
  GithubIcon,
  NewTwitterIcon,
} from "@hugeicons/core-free-icons"
import { makeDoc } from "@/lib/doc"
import { thumbnail } from "@/lib/engine/renderer"
import { STYLES } from "@/lib/engine/styles"
import { PRESETS } from "@/lib/presets"
import { SITE } from "@/lib/site"
import { cn } from "@/lib/utils"
import { useStudio } from "@/store/studio"
import { Icon } from "@/components/ui/icon"
import { Kbd } from "@/components/ui/kbd"
import { Segmented } from "@/components/ui/segmented"
import { ThemeSwitch } from "./theme-switch"

/* Preset thumbnails, drawn once by the real shader, a few per idle slice. */
const thumbs = new Map<string, string>()
const listeners = new Set<() => void>()
let started = false

function startThumbs() {
  if (started || typeof window === "undefined") return
  started = true
  const queue = [...PRESETS]
  const size = { w: 1920, h: 1200 }
  const next = () => {
    const batch = queue.splice(0, 3)
    for (const p of batch) {
      try {
        const d = { ...makeDoc(p), size }
        thumbs.set(p.id, thumbnail(d, 288, 180, 0.9))
      } catch {}
    }
    listeners.forEach((l) => l())
    if (queue.length) setTimeout(next, 16)
  }
  setTimeout(next, 120)
}

function useThumb(id: string) {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb)
      return () => listeners.delete(cb)
    },
    () => thumbs.get(id) ?? null,
    () => null
  )
}

function Tile({
  id,
  name,
  active,
  onPick,
}: {
  id: string
  name: string
  active: boolean
  onPick: () => void
}) {
  const src = useThumb(id)
  return (
    <button
      type="button"
      onClick={onPick}
      className="group flex min-w-0 flex-col gap-1.5 text-left"
    >
      <span
        className={cn(
          "relative block aspect-[16/10] w-full overflow-hidden rounded-[10px] bg-surface-muted shadow-card transition-[box-shadow,scale] duration-200 ease-out group-hover:shadow-float group-active:scale-[0.96]",
          active &&
            "shadow-[0_0_0_2px_var(--color-ink)] group-hover:shadow-[0_0_0_2px_var(--color-ink)]"
        )}
      >
        {src && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt=""
            draggable={false}
            className="size-full object-cover"
          />
        )}
      </span>
      <span
        className={cn(
          "truncate px-0.5 text-[12px] text-ink-secondary group-hover:text-ink",
          active && "text-ink"
        )}
      >
        {name}
      </span>
    </button>
  )
}

function Presets() {
  const presetId = useStudio((s) => s.presetId)
  const apply = useStudio((s) => s.applyPreset)
  useEffect(startThumbs, [])
  return (
    <div className="flex flex-col gap-5">
      {STYLES.map((st) => {
        const list = PRESETS.filter((p) => p.style === st.id)
        if (!list.length) return null
        return (
          <section key={st.id}>
            <h3 className="mb-2 px-0.5 text-[12px] font-medium text-ink-tertiary">
              {st.name}
            </h3>
            <div className="grid grid-cols-2 gap-x-2.5 gap-y-3">
              {list.map((p) => (
                <Tile
                  key={p.id}
                  id={p.id}
                  name={p.name}
                  active={presetId === p.id}
                  onPick={() => apply(p.id)}
                />
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}

function Library() {
  const saved = useStudio((s) => s.saved)
  const replace = useStudio((s) => s.replace)
  const unsave = useStudio((s) => s.unsave)
  if (!saved.length)
    return (
      <div className="flex flex-col items-center gap-2 rounded-[14px] px-4 py-10 text-center">
        <p className="text-[13px] font-medium text-ink">Nothing saved yet</p>
        <p className="text-[12.5px] text-ink-secondary">
          Keep the gradient you&rsquo;re on with{" "}
          <Kbd keys="mod+s" className="text-ink-secondary" />. It stays in this
          browser.
        </p>
      </div>
    )
  return (
    <div className="grid grid-cols-2 gap-x-2.5 gap-y-3">
      {saved.map((s) => (
        <div
          key={s.id}
          className="group relative flex min-w-0 flex-col gap-1.5"
        >
          <button
            type="button"
            onClick={() => replace(s.doc)}
            className="block aspect-[16/10] w-full overflow-hidden rounded-[10px] bg-surface-muted shadow-card transition-[box-shadow,scale] duration-200 hover:shadow-float active:scale-[0.96]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={s.thumb}
              alt=""
              draggable={false}
              className="size-full object-cover"
            />
          </button>
          <span className="truncate px-0.5 text-[12px] text-ink-secondary">
            {s.doc.name || "Untitled"}
          </span>
          <button
            type="button"
            aria-label={`Remove ${s.doc.name || "gradient"} from library`}
            onClick={() => unsave(s.id)}
            className="absolute top-1.5 right-1.5 grid size-6 place-items-center rounded-full plaque opacity-0 transition-opacity duration-150 group-hover:opacity-100 before:absolute before:-inset-2 focus-visible:opacity-100 [@media(hover:none)]:opacity-100"
          >
            <Icon icon={Cancel01Icon} className="size-3" strokeWidth={2.2} />
          </button>
        </div>
      ))}
    </div>
  )
}

export function PresetsPanel({ footer = true }: { footer?: boolean }) {
  const [tab, setTab] = useState<"presets" | "saved">("presets")
  const count = useStudio((s) => s.saved.length)
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="px-4 pt-1 pb-3">
        <Segmented
          label="Gallery"
          value={tab}
          onChange={setTab}
          options={[
            { id: "presets", label: "Presets" },
            {
              id: "saved",
              label: (
                <>
                  Saved
                  {count > 0 && (
                    <span className="label text-ink-tertiary">{count}</span>
                  )}
                </>
              ),
            },
          ]}
        />
      </div>
      <div className="min-h-0 flex-1 scroll-quiet overflow-y-auto px-4 pb-4">
        {tab === "presets" ? <Presets /> : <Library />}
      </div>
      {footer && (
        <footer className="flex items-center justify-between gap-2 border-t border-hairline px-4 py-3">
          <ThemeSwitch />
          <div className="flex items-center gap-0.5 text-ink-secondary">
            <a
              href={SITE.repo}
              target="_blank"
              rel="noreferrer"
              aria-label="Source on GitHub"
              className="grid size-8 place-items-center rounded-[8px] hover:bg-ink/[0.05] hover:text-ink"
            >
              <Icon icon={GithubIcon} />
            </a>
            <a
              href="https://x.com/kshvbgde"
              target="_blank"
              rel="noreferrer"
              aria-label="Keshav on X"
              className="grid size-8 place-items-center rounded-[8px] hover:bg-ink/[0.05] hover:text-ink"
            >
              <Icon icon={NewTwitterIcon} />
            </a>
          </div>
        </footer>
      )}
    </div>
  )
}
