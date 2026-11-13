"use client"

import { RefreshIcon } from "@hugeicons/core-free-icons"
import { DEFAULT_EFFECTS, EFFECT } from "@/lib/engine/styles"
import type { Effects } from "@/lib/engine/types"
import { useStudio } from "@/store/studio"
import { Button } from "@/components/ui/button"
import { Icon } from "@/components/ui/icon"
import { Section } from "@/components/ui/section"
import { SliderField } from "@/components/ui/slider-field"
import { Tip } from "@/components/ui/tooltip"

const off = (v: number) => (v === 0 ? "Off" : undefined)

const GROUPS: {
  title: string
  keys: (keyof Effects)[]
  note?: string
  format?: Partial<Record<keyof Effects, (v: number) => string | undefined>>
  reset?: Partial<Effects>
}[] = [
  {
    title: "Grain",
    keys: ["grain", "grainSize"],
    reset: { grain: 0, grainSize: 1 },
  },
  {
    title: "Fluted glass",
    keys: ["glass", "glassSize", "glassAngle"],
    note: "Reeded glass in front of the gradient.",
  },
  {
    title: "Retro",
    keys: ["dither", "ditherSize", "pixelate"],
    format: { dither: off, pixelate: off },
    note: "Ordered dithering and pixel cells, sized in artboard pixels.",
  },
  {
    title: "Colour",
    keys: ["brightness", "contrast", "saturation", "hue", "vignette"],
  },
]

export function EffectsTab() {
  const effects = useStudio((s) => s.doc.effects)
  const setEffect = useStudio((s) => s.setEffect)
  const set = useStudio((s) => s.set)
  return (
    <>
      {GROUPS.map((g) => {
        const base = { ...DEFAULT_EFFECTS, ...g.reset }
        const changed = g.keys.some((k) => effects[k] !== base[k])
        return (
          <Section
            key={g.title}
            title={g.title}
            actions={
              changed && (
                <Tip label={`Reset ${g.title.toLowerCase()}`}>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    aria-label={`Reset ${g.title.toLowerCase()}`}
                    onClick={() =>
                      set({
                        effects: {
                          ...effects,
                          ...Object.fromEntries(
                            g.keys.map((k) => [k, base[k]])
                          ),
                        },
                      })
                    }
                  >
                    <Icon icon={RefreshIcon} className="size-[15px]" />
                  </Button>
                </Tip>
              )
            }
          >
            {g.keys.map((k) => {
              const d = EFFECT[k]
              const fmt = g.format?.[k]
              return (
                <SliderField
                  key={k}
                  label={d.label}
                  value={effects[k]}
                  min={k === "dither" ? 0 : d.min}
                  max={d.max}
                  step={d.step}
                  unit={d.unit}
                  format={
                    fmt ? (v) => fmt(v) ?? `${v}${d.unit ?? ""}` : undefined
                  }
                  onChange={(v) => {
                    // Dithering below two levels means nothing; snap to off.
                    if (k === "dither" && v > 0 && v < 2)
                      v = effects.dither >= 2 ? 0 : 2
                    if (k === "pixelate" && v > 0 && v < 2)
                      v = effects.pixelate >= 2 ? 0 : 2
                    setEffect(k, v)
                  }}
                />
              )
            })}
            {g.note && (
              <p className="mt-1 text-[12px] leading-relaxed text-ink-tertiary">
                {g.note}
              </p>
            )}
          </Section>
        )
      })}
    </>
  )
}
