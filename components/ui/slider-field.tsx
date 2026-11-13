"use client"

import { Slider } from "@base-ui/react/slider"
import { useState } from "react"
import { clamp, cn } from "@/lib/utils"

const decimals = (step: number) =>
  step >= 1 ? 0 : Math.min(3, String(step).split(".")[1]?.length ?? 0)

/**
 * A scrubbable field: the label and value sit inside the track and the fill
 * shows where you are. Drag anywhere, use the arrow keys, or double-click
 * the number to type one. Ranges that cross zero fill out from zero.
 */
export function SliderField({
  label,
  value,
  min,
  max,
  step,
  unit = "",
  onChange,
  format,
  className,
  disabled,
}: {
  label: string
  value: number
  min: number
  max: number
  step: number
  unit?: string
  onChange: (v: number) => void
  format?: (v: number) => string
  className?: string
  disabled?: boolean
}) {
  const [typing, setTyping] = useState(false)
  const pct = (v: number) => ((clamp(v, min, max) - min) / (max - min)) * 100
  const origin = min < 0 && max > 0 ? pct(0) : 0
  const at = pct(value)
  const shown = format
    ? format(value)
    : `${value.toFixed(decimals(step))}${unit}`

  const commit = (raw: string) => {
    setTyping(false)
    const n = parseFloat(raw)
    if (!Number.isNaN(n)) onChange(clamp(Math.round(n / step) * step, min, max))
  }

  return (
    <Slider.Root
      value={value}
      min={min}
      max={max}
      step={step}
      disabled={disabled}
      thumbAlignment="edge"
      onValueChange={(v) => onChange(v as number)}
      className={cn(
        "group/slider relative",
        disabled && "opacity-40",
        className
      )}
    >
      <Slider.Control className="relative flex h-8 cursor-ew-resize touch-none items-center overflow-hidden rounded-[9px] bg-surface-muted shadow-[inset_0_0_0_1px_var(--color-hairline)] select-none">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 bg-ink/[0.07] transition-[background-color] duration-150 group-hover/slider:bg-ink/[0.1]"
          style={{
            left: `${Math.min(origin, at)}%`,
            width: `${Math.abs(at - origin)}%`,
          }}
        />
        {/* Base UI pins the track to position: relative, so it gets a box to fill. */}
        <div className="absolute inset-0">
          <Slider.Track className="size-full">
            <Slider.Thumb
              aria-label={label}
              className="h-4 w-[2px] rounded-full bg-ink/35 outline-none group-hover/slider:bg-ink/60 focus-visible:h-5 focus-visible:bg-accent data-[dragging]:bg-ink"
            />
          </Slider.Track>
        </div>
        <span className="pointer-events-none relative px-2.5 text-[12.5px] text-ink-secondary">
          {label}
        </span>
        {typing ? (
          <input
            autoFocus
            defaultValue={value.toFixed(decimals(step))}
            onBlur={(e) => commit(e.currentTarget.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") commit(e.currentTarget.value)
              if (e.key === "Escape") setTyping(false)
              e.stopPropagation()
            }}
            onPointerDown={(e) => e.stopPropagation()}
            inputMode="decimal"
            className="relative mr-1 ml-auto h-6 w-16 rounded-[6px] bg-surface px-1.5 text-right label text-ink tabular-nums shadow-card outline-none"
          />
        ) : (
          <span
            onDoubleClick={() => setTyping(true)}
            title="Double-click to type a value"
            className="relative mr-1 ml-auto cursor-text rounded-[6px] px-1.5 py-0.5 label text-ink tabular-nums transition-colors duration-150 hover:bg-surface/80"
          >
            {shown}
          </span>
        )}
      </Slider.Control>
    </Slider.Root>
  )
}
