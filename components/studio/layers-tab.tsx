"use client"

import { useRef } from "react"
import {
  CenterFocusIcon,
  Delete02Icon,
  ImageUpload01Icon,
  TextAlignCenterIcon,
  TextAlignLeftIcon,
  TextAlignRightIcon,
  TextItalicIcon,
} from "@hugeicons/core-free-icons"
import { FONTS, fontFor, nearestWeight } from "@/lib/fonts"
import type { BlendMode } from "@/lib/engine/types"
import { cn } from "@/lib/utils"
import { useStudio } from "@/store/studio"
import { Button } from "@/components/ui/button"
import { ColorPicker } from "@/components/ui/color-picker"
import { Icon } from "@/components/ui/icon"
import { Pop } from "@/components/ui/popover"
import { Row, Section } from "@/components/ui/section"
import { Segmented } from "@/components/ui/segmented"
import { Select } from "@/components/ui/select"
import { SliderField } from "@/components/ui/slider-field"
import { Switch } from "@/components/ui/switch"
import { Tip } from "@/components/ui/tooltip"
import { imageLayerFromFile } from "./actions"

const BLENDS: { id: BlendMode; label: string }[] = [
  { id: "normal", label: "Normal" },
  { id: "overlay", label: "Overlay" },
  { id: "soft-light", label: "Soft light" },
  { id: "screen", label: "Screen" },
  { id: "multiply", label: "Multiply" },
  { id: "difference", label: "Difference" },
]

const WEIGHT_NAMES: Record<number, string> = {
  100: "Thin",
  200: "Extra light",
  300: "Light",
  400: "Regular",
  500: "Medium",
  600: "Semibold",
  700: "Bold",
  800: "Extra bold",
  900: "Black",
}

function ColorChip({
  value,
  onChange,
}: {
  value: string
  onChange: (hex: string) => void
}) {
  return (
    <Pop
      align="end"
      trigger={
        <button
          type="button"
          aria-label={`Colour ${value}`}
          className="flex h-8 items-center gap-2 rounded-[9px] bg-surface-muted pr-2.5 pl-1.5 shadow-[inset_0_0_0_1px_var(--color-hairline)]"
        >
          <span
            className="size-5 rounded-[6px] shadow-[inset_0_0_0_1px_rgb(0_0_0/0.12)]"
            style={{ backgroundColor: value }}
          />
          <span className="label text-ink uppercase">
            {value.replace("#", "")}
          </span>
        </button>
      }
    >
      <ColorPicker value={value} onChange={onChange} />
    </Pop>
  )
}

function TextSection() {
  const t = useStudio((s) => s.doc.text)
  const setText = useStudio((s) => s.setText)
  const font = fontFor(t.font)
  const weights = font.weights
  return (
    <Section
      title="Text"
      actions={
        <Switch
          label="Show text"
          checked={t.enabled}
          onChange={(enabled) => setText({ enabled })}
        />
      }
    >
      {!t.enabled ? (
        <p className="text-[12px] leading-relaxed text-ink-tertiary">
          Set a word or a line on the gradient. Drag it on the canvas; it snaps
          to the centre.
        </p>
      ) : (
        <>
          <textarea
            value={t.content}
            onChange={(e) => setText({ content: e.target.value })}
            onKeyDown={(e) => e.stopPropagation()}
            rows={Math.min(5, Math.max(2, t.content.split("\n").length))}
            spellCheck={false}
            aria-label="Text"
            className="w-full resize-none rounded-[9px] bg-surface-muted px-2.5 py-2 text-[13px] text-ink shadow-[inset_0_0_0_1px_var(--color-hairline)] outline-none focus:shadow-[inset_0_0_0_1.5px_var(--color-accent)]"
          />
          <Select
            label="Typeface"
            value={t.font}
            width={250}
            className="w-full"
            onChange={(id) =>
              setText({ font: id, weight: nearestWeight(id, t.weight) })
            }
            options={FONTS.map((f) => ({
              id: f.id,
              label: f.label,
              group: f.category,
              style: { fontFamily: f.family },
            }))}
          />
          <SliderField
            label="Weight"
            value={nearestWeight(t.font, t.weight)}
            min={weights[0]}
            max={Math.max(weights[0] + 100, weights.at(-1)!)}
            step={100}
            disabled={weights.length < 2}
            format={(v) => WEIGHT_NAMES[v] ?? String(v)}
            onChange={(v) => setText({ weight: v })}
          />
          <SliderField
            label="Size"
            value={t.size}
            min={1}
            max={60}
            step={0.5}
            unit="%"
            onChange={(size) => setText({ size })}
          />
          <SliderField
            label="Tracking"
            value={t.tracking}
            min={-0.12}
            max={0.4}
            step={0.005}
            format={(v) => `${(v * 100).toFixed(1)}%`}
            onChange={(tracking) => setText({ tracking })}
          />
          <SliderField
            label="Leading"
            value={t.leading}
            min={0.7}
            max={2}
            step={0.01}
            onChange={(leading) => setText({ leading })}
          />
          <div className="flex items-center gap-1.5 pt-0.5">
            <Segmented
              label="Alignment"
              size="sm"
              className="flex-1"
              value={t.align}
              onChange={(align) => setText({ align })}
              options={[
                {
                  id: "left",
                  label: (
                    <Icon icon={TextAlignLeftIcon} className="size-[15px]" />
                  ),
                  title: "Align left",
                },
                {
                  id: "center",
                  label: (
                    <Icon icon={TextAlignCenterIcon} className="size-[15px]" />
                  ),
                  title: "Align centre",
                },
                {
                  id: "right",
                  label: (
                    <Icon icon={TextAlignRightIcon} className="size-[15px]" />
                  ),
                  title: "Align right",
                },
              ]}
            />
            <Tip label={font.italic ? "Italic" : "This typeface has no italic"}>
              <Button
                variant={t.italic && font.italic ? "primary" : "secondary"}
                size="icon-sm"
                aria-pressed={t.italic}
                aria-label="Italic"
                disabled={!font.italic}
                onClick={() => setText({ italic: !t.italic })}
              >
                <Icon icon={TextItalicIcon} className="size-[15px]" />
              </Button>
            </Tip>
            <Tip label="All caps">
              <Button
                variant={t.uppercase ? "primary" : "secondary"}
                size="icon-sm"
                aria-pressed={t.uppercase}
                aria-label="All caps"
                onClick={() => setText({ uppercase: !t.uppercase })}
                className="text-[11px] font-semibold"
              >
                AA
              </Button>
            </Tip>
          </div>
          <Row label="Colour">
            <ColorChip
              value={t.color}
              onChange={(color) => setText({ color })}
            />
          </Row>
          <SliderField
            label="Opacity"
            value={t.opacity}
            min={0}
            max={1}
            step={0.01}
            format={(v) => `${Math.round(v * 100)}%`}
            onChange={(opacity) => setText({ opacity })}
          />
          <SliderField
            label="Glow"
            value={t.glow}
            min={0}
            max={1}
            step={0.01}
            onChange={(glow) => setText({ glow })}
          />
          <Row label="Blend">
            <Select
              label="Blend mode"
              value={t.blend}
              width={170}
              onChange={(blend) => setText({ blend })}
              options={BLENDS}
              className="w-[132px]"
            />
          </Row>
          <Button
            variant="secondary"
            size="sm"
            className="mt-1"
            onClick={() => setText({ x: 0.5, y: 0.5 })}
          >
            <Icon icon={CenterFocusIcon} className="size-[15px]" />
            Centre on canvas
          </Button>
        </>
      )}
    </Section>
  )
}

function ImageSection() {
  const l = useStudio((s) => s.doc.image)
  const setImage = useStudio((s) => s.setImage)
  const file = useRef<HTMLInputElement>(null)
  const pick = () => file.current?.click()
  return (
    <Section
      title="Image"
      actions={
        <Switch
          label="Show image"
          checked={l.enabled}
          onChange={(enabled) =>
            enabled && !l.src ? pick() : setImage({ enabled })
          }
        />
      }
    >
      <input
        ref={file}
        type="file"
        accept="image/png,image/svg+xml,image/jpeg,image/webp,image/gif"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) imageLayerFromFile(f)
          e.target.value = ""
        }}
      />
      {!l.src ? (
        <button
          type="button"
          onClick={pick}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault()
            e.stopPropagation()
            const f = e.dataTransfer.files[0]
            if (f) imageLayerFromFile(f)
          }}
          className="flex flex-col items-center gap-1.5 rounded-[12px] border border-dashed border-ink/15 px-4 py-5 text-center transition-colors hover:border-ink/30 hover:bg-ink/[0.02]"
        >
          <Icon
            icon={ImageUpload01Icon}
            className="size-5 text-ink-secondary"
          />
          <span className="text-[13px] font-medium text-ink">
            Add a logo or picture
          </span>
          <span className="text-[12px] text-ink-tertiary">
            PNG, SVG, JPG or WebP, up to 8 MB
          </span>
        </button>
      ) : (
        <>
          <div className="flex items-center gap-2.5 rounded-[10px] bg-surface-muted p-1.5 pr-1 shadow-[inset_0_0_0_1px_var(--color-hairline)]">
            <span className="grid size-9 shrink-0 place-items-center overflow-hidden rounded-[7px] checker">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={l.src}
                alt=""
                className="max-h-full max-w-full object-contain"
              />
            </span>
            <span className="min-w-0 flex-1 truncate text-[12.5px] text-ink">
              {l.name || "Image"}
            </span>
            <Button variant="ghost" size="xs" onClick={pick}>
              Replace
            </Button>
            <Tip label="Remove image">
              <Button
                variant="ghost"
                size="icon-xs"
                aria-label="Remove image"
                onClick={() =>
                  setImage({ src: null, name: "", enabled: false })
                }
              >
                <Icon icon={Delete02Icon} className="size-[15px]" />
              </Button>
            </Tip>
          </div>
          <div
            className={cn(
              "flex flex-col gap-1.5",
              !l.enabled && "pointer-events-none opacity-50"
            )}
          >
            <SliderField
              label="Size"
              value={l.size}
              min={2}
              max={100}
              step={0.5}
              unit="%"
              onChange={(size) => setImage({ size })}
            />
            <SliderField
              label="Opacity"
              value={l.opacity}
              min={0}
              max={1}
              step={0.01}
              format={(v) => `${Math.round(v * 100)}%`}
              onChange={(opacity) => setImage({ opacity })}
            />
            <Row label="Blend">
              <Select
                label="Blend mode"
                value={l.blend}
                width={170}
                onChange={(blend) => setImage({ blend })}
                options={BLENDS}
                className="w-[132px]"
              />
            </Row>
            <Button
              variant="secondary"
              size="sm"
              className="mt-1"
              onClick={() => setImage({ x: 0.5, y: 0.5 })}
            >
              <Icon icon={CenterFocusIcon} className="size-[15px]" />
              Centre on canvas
            </Button>
          </div>
        </>
      )}
    </Section>
  )
}

export function LayersTab() {
  return (
    <>
      <TextSection />
      <ImageSection />
    </>
  )
}
