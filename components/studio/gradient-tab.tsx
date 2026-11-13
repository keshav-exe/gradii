"use client"

import { useEffect, useRef, useState } from "react"
import {
  Add01Icon,
  ArrowDataTransferHorizontalIcon,
  Delete02Icon,
  DiceFaces03Icon,
  ImageUpload01Icon,
  LockedIcon,
  ShuffleIcon,
  SquareUnlock02Icon,
} from "@hugeicons/core-free-icons"
import { thumbnail } from "@/lib/engine/renderer"
import { DEFAULT_EFFECTS, STYLE, STYLES } from "@/lib/engine/styles"
import type { ColorStop, Doc } from "@/lib/engine/types"
import { readableInk } from "@/lib/color"
import { HARMONY_NAMES, MOOD_NAMES } from "@/lib/random"
import { cn } from "@/lib/utils"
import { useStudio } from "@/store/studio"
import { Button } from "@/components/ui/button"
import { ColorPicker } from "@/components/ui/color-picker"
import { Icon } from "@/components/ui/icon"
import { Pop } from "@/components/ui/popover"
import { Row, Section } from "@/components/ui/section"
import { Select } from "@/components/ui/select"
import { SliderField } from "@/components/ui/slider-field"
import { Tip } from "@/components/ui/tooltip"
import { paletteFromFile } from "./actions"

const cap = (s: string) => s[0].toUpperCase() + s.slice(1)

/** Each style drawn with your palette, so you pick by look, not by name. */
function useStyleThumbs(doc: Doc) {
  const [thumbs, setThumbs] = useState<Record<string, string>>({})
  const key = JSON.stringify([
    doc.colors.map((c) => [c.hex, c.x, c.y]),
    doc.background,
    doc.seed,
    doc.center,
  ])
  useEffect(() => {
    const t = setTimeout(() => {
      const d = useStudio.getState().doc
      const out: Record<string, string> = {}
      try {
        for (const s of STYLES) {
          out[s.id] = thumbnail(
            {
              ...d,
              style: s.id,
              size: { w: 1200, h: 800 },
              effects: { ...DEFAULT_EFFECTS, grain: 0 },
            },
            120,
            80,
            0.9
          )
        }
        setThumbs(out)
      } catch {}
    }, 160)
    return () => clearTimeout(t)
  }, [key])
  return thumbs
}

function StylePicker() {
  const doc = useStudio((s) => s.doc)
  const setStyle = useStudio((s) => s.setStyle)
  const thumbs = useStyleThumbs(doc)
  return (
    <Section title="Style">
      <div
        role="radiogroup"
        aria-label="Style"
        className="grid grid-cols-4 gap-x-2 gap-y-2.5"
      >
        {STYLES.map((s, i) => {
          const on = doc.style === s.id
          return (
            <Tip key={s.id} label={s.blurb} keys={String(i + 1)}>
              <button
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => setStyle(s.id)}
                className="group flex min-w-0 flex-col items-center gap-1"
              >
                <span
                  className={cn(
                    "block aspect-[3/2] w-full overflow-hidden rounded-[9px] bg-surface-muted shadow-card transition-[box-shadow,scale] duration-150 ease-out group-active:scale-[0.96]",
                    on
                      ? "shadow-[0_0_0_2px_var(--color-ink)]"
                      : "group-hover:shadow-float"
                  )}
                >
                  {thumbs[s.id] && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={thumbs[s.id]}
                      alt=""
                      draggable={false}
                      className="size-full object-cover"
                    />
                  )}
                </span>
                <span
                  className={cn(
                    "text-[11.5px]",
                    on
                      ? "font-medium text-ink"
                      : "text-ink-secondary group-hover:text-ink"
                  )}
                >
                  {s.name}
                </span>
              </button>
            </Tip>
          )
        })}
      </div>
    </Section>
  )
}

function Swatch({ c, index }: { c: ColorStop; index: number }) {
  const selected = useStudio((s) => s.selected === c.id)
  const setColor = useStudio((s) => s.setColor)
  const remove = useStudio((s) => s.removeColor)
  const setUI = useStudio((s) => s.setUI)
  const count = useStudio((s) => s.doc.colors.length)
  const [open, setOpen] = useState(false)
  return (
    <Pop
      open={open}
      onOpenChange={(o) => {
        setOpen(o)
        if (o) setUI({ selected: c.id })
      }}
      side="bottom"
      trigger={
        <button
          type="button"
          aria-label={`Colour ${index + 1}, ${c.hex}${c.locked ? ", locked" : ""}`}
          className={cn(
            "relative grid aspect-square w-full place-items-center rounded-[9px] shadow-[inset_0_0_0_1px_rgb(0_0_0/0.08)] transition-[box-shadow,scale] duration-150 ease-out active:scale-[0.96]",
            selected &&
              "shadow-[inset_0_0_0_1px_rgb(0_0_0/0.08),0_0_0_2px_var(--color-background),0_0_0_3.5px_var(--color-ink)]"
          )}
          style={{ backgroundColor: c.hex, color: readableInk(c.hex) }}
        >
          {c.locked && (
            <Icon
              icon={LockedIcon}
              className="size-3.5 opacity-80"
              strokeWidth={2}
            />
          )}
        </button>
      }
    >
      <ColorPicker
        value={c.hex}
        onChange={(hex) => setColor(c.id, { hex })}
        footer={
          <div className="flex items-center gap-1.5 border-t border-hairline pt-2.5">
            <Button
              variant="ghost"
              size="xs"
              aria-pressed={!!c.locked}
              onClick={() => setColor(c.id, { locked: !c.locked })}
              className={cn(c.locked && "text-ink")}
            >
              <Icon
                icon={c.locked ? LockedIcon : SquareUnlock02Icon}
                className="size-[15px]"
              />
              {c.locked ? "Locked" : "Lock"}
            </Button>
            <Button
              variant="ghost"
              size="xs"
              className="ml-auto hover:text-[oklch(0.6_0.2_25)]"
              disabled={count <= 2}
              onClick={() => {
                remove(c.id)
                setOpen(false)
              }}
            >
              <Icon icon={Delete02Icon} className="size-[15px]" />
              Remove
            </Button>
          </div>
        }
      />
    </Pop>
  )
}

function Colors() {
  const colors = useStudio((s) => s.doc.colors)
  const style = useStudio((s) => s.doc.style)
  const background = useStudio((s) => s.doc.background)
  const harmony = useStudio((s) => s.harmony)
  const mood = useStudio((s) => s.mood)
  const a = useStudio.getState()
  const file = useRef<HTMLInputElement>(null)

  return (
    <Section
      title="Colours"
      actions={
        <>
          <Tip label="Reverse order">
            <Button
              variant="ghost"
              size="icon-xs"
              aria-label="Reverse colour order"
              onClick={a.reverseColors}
            >
              <Icon
                icon={ArrowDataTransferHorizontalIcon}
                className="size-[15px]"
              />
            </Button>
          </Tip>
          <Tip label="Palette from an image">
            <Button
              variant="ghost"
              size="icon-xs"
              aria-label="Palette from an image"
              onClick={() => file.current?.click()}
            >
              <Icon icon={ImageUpload01Icon} className="size-[15px]" />
            </Button>
          </Tip>
          <Tip label="New colours" keys="r">
            <Button
              variant="ghost"
              size="icon-xs"
              aria-label="New colours"
              onClick={a.shuffleColors}
            >
              <Icon icon={DiceFaces03Icon} className="size-[15px]" />
            </Button>
          </Tip>
          <input
            ref={file}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) paletteFromFile(f)
              e.target.value = ""
            }}
          />
        </>
      }
    >
      <div className="grid grid-cols-8 gap-1.5">
        {colors.map((c, i) => (
          <Swatch key={c.id} c={c} index={i} />
        ))}
        {colors.length < 8 && (
          <Tip label="Add a colour">
            <button
              type="button"
              aria-label="Add a colour"
              onClick={() => a.addColor()}
              className="grid aspect-square w-full place-items-center rounded-[9px] text-ink-secondary shadow-[inset_0_0_0_1px_var(--color-hairline)] transition-colors hover:bg-ink/[0.04] hover:text-ink"
            >
              <Icon icon={Add01Icon} className="size-4" />
            </button>
          </Tip>
        )}
      </div>
      {STYLE[style].background && (
        <Row label="Ground">
          <Pop
            align="end"
            trigger={
              <button
                type="button"
                className="flex h-8 items-center gap-2 rounded-[9px] bg-surface-muted pr-2.5 pl-1.5 shadow-[inset_0_0_0_1px_var(--color-hairline)]"
              >
                <span
                  className="size-5 rounded-[6px] shadow-[inset_0_0_0_1px_rgb(0_0_0/0.1)]"
                  style={{ backgroundColor: background }}
                />
                <span className="label text-ink uppercase">
                  {background.replace("#", "")}
                </span>
              </button>
            }
          >
            <ColorPicker
              value={background}
              onChange={(hex) => a.set({ background: hex })}
            />
          </Pop>
        </Row>
      )}
      <div className="mt-1 grid grid-cols-2 gap-1.5">
        <Select
          label="Harmony for new colours"
          value={harmony}
          onChange={(v) => a.setUI({ harmony: v })}
          width={200}
          options={[
            { id: "auto", label: "Any harmony" },
            ...HARMONY_NAMES.map((h) => ({ id: h, label: cap(h) })),
          ]}
        />
        <Select
          label="Mood for new colours"
          value={mood}
          onChange={(v) => a.setUI({ mood: v })}
          width={200}
          options={[
            { id: "auto", label: "Any mood" },
            ...MOOD_NAMES.map((m) => ({ id: m, label: cap(m) })),
          ]}
        />
      </div>
    </Section>
  )
}

function Shape() {
  const style = useStudio((s) => s.doc.style)
  const values = useStudio((s) => s.doc.params[s.doc.style])
  const setParam = useStudio((s) => s.setParam)
  const shuffleLayout = useStudio((s) => s.shuffleLayout)
  const def = STYLE[style]
  return (
    <Section
      title="Shape"
      actions={
        <Tip label="New layout" keys="l">
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label="New layout"
            onClick={shuffleLayout}
          >
            <Icon icon={ShuffleIcon} className="size-[15px]" />
          </Button>
        </Tip>
      }
    >
      {def.params.map((p) => (
        <SliderField
          key={p.key}
          label={p.label}
          value={values?.[p.key] ?? p.default}
          min={p.min}
          max={p.max}
          step={p.step}
          unit={p.unit}
          onChange={(v) => setParam(p.key, v)}
        />
      ))}
      {(def.points || def.center) && (
        <p className="mt-1 text-[12px] leading-relaxed text-ink-tertiary">
          {def.points
            ? "Drag the points on the canvas. Double-click it to add one."
            : "Drag the centre on the canvas to move it."}
        </p>
      )}
    </Section>
  )
}

function Motion() {
  const speed = useStudio((s) => s.doc.speed)
  const set = useStudio((s) => s.set)
  return (
    <Section title="Motion">
      <SliderField
        label="Speed"
        value={speed}
        min={0}
        max={3}
        step={0.05}
        format={(v) => (v === 0 ? "Still" : `${v.toFixed(2)}×`)}
        onChange={(v) => set({ speed: v })}
      />
      <p className="mt-1 text-[12px] leading-relaxed text-ink-tertiary">
        Every style loops seamlessly, so video exports repeat without a seam.
      </p>
    </Section>
  )
}

export function GradientTab() {
  return (
    <>
      <StylePicker />
      <Colors />
      <Shape />
      <Motion />
    </>
  )
}
