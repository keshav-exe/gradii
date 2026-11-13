"use client"

import { useState } from "react"
import {
  ArrowDataTransferHorizontalIcon,
  ArrowDown01Icon,
  Tick02Icon,
} from "@hugeicons/core-free-icons"
import { SIZE_GROUPS, aspectLabel, sizeLabel } from "@/lib/sizes"
import { cn } from "@/lib/utils"
import { useStudio } from "@/store/studio"
import { Button } from "@/components/ui/button"
import { Icon } from "@/components/ui/icon"
import { Pop } from "@/components/ui/popover"

function NumberBox({
  label,
  value,
  onCommit,
}: {
  label: string
  value: number
  onCommit: (v: number) => void
}) {
  const [draft, setDraft] = useState<string | null>(null)
  return (
    <label className="flex h-8 flex-1 items-center gap-1.5 rounded-[9px] bg-surface-muted px-2.5 shadow-[inset_0_0_0_1px_var(--color-hairline)] focus-within:shadow-[inset_0_0_0_1.5px_var(--color-accent)]">
      <span className="label text-ink-tertiary">{label}</span>
      <input
        inputMode="numeric"
        value={draft ?? String(value)}
        onChange={(e) => setDraft(e.target.value.replace(/[^0-9]/g, ""))}
        onBlur={() => {
          if (draft) onCommit(parseInt(draft, 10))
          setDraft(null)
        }}
        onKeyDown={(e) => {
          e.stopPropagation()
          if (e.key === "Enter") e.currentTarget.blur()
        }}
        className="w-full bg-transparent label text-[13px] text-ink tabular-nums outline-none"
      />
    </label>
  )
}

/** The artboard size: device presets, social formats, or your own. */
export function SizePicker({ className }: { className?: string }) {
  const size = useStudio((s) => s.doc.size)
  const setSize = useStudio((s) => s.setSize)
  const [open, setOpen] = useState(false)
  const name = sizeLabel(size.w, size.h)

  return (
    <Pop
      open={open}
      onOpenChange={setOpen}
      align="center"
      className="w-[300px] p-1.5"
      trigger={
        <button
          type="button"
          className={cn(
            "flex h-8 items-center gap-2 rounded-[11px] plaque pr-2 pl-3 text-[12.5px] font-medium transition-[scale] duration-150 active:scale-[0.96]",
            className
          )}
        >
          <span className="text-chrome-ink">{name}</span>
          <span className="label text-chrome-muted tabular-nums">
            {size.w} × {size.h}
          </span>
          <Icon icon={ArrowDown01Icon} className="size-3.5 text-chrome-muted" />
        </button>
      }
    >
      <div className="max-h-[min(56dvh,440px)] scroll-quiet overflow-y-auto p-1">
        {SIZE_GROUPS.map((g) => (
          <div key={g.label} className="mb-1.5">
            <p className="px-2 pt-1.5 pb-1 text-[11.5px] font-medium text-ink-tertiary">
              {g.label}
            </p>
            {g.sizes.map((s) => {
              const on = s.w === size.w && s.h === size.h
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    setSize(s.w, s.h)
                    setOpen(false)
                  }}
                  className={cn(
                    "flex h-8 w-full items-center gap-2 rounded-[8px] px-2 text-left text-[13px] transition-colors duration-100 hover:bg-ink/[0.05]",
                    on && "bg-ink/[0.05]"
                  )}
                >
                  <span aria-hidden className="grid size-5 place-items-center">
                    <span
                      className="rounded-[2px] border-[1.5px] border-ink-secondary"
                      style={{
                        width: s.w >= s.h ? 16 : (16 * s.w) / s.h,
                        height: s.h > s.w ? 16 : Math.max(5, (16 * s.h) / s.w),
                      }}
                    />
                  </span>
                  <span className="text-ink">{s.label}</span>
                  <span className="ml-auto label text-ink-tertiary tabular-nums">
                    {s.w}×{s.h}
                  </span>
                  <Icon
                    icon={Tick02Icon}
                    className={cn("size-3.5 text-ink", !on && "invisible")}
                  />
                </button>
              )
            })}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-1.5 border-t border-hairline p-1.5 pt-2">
        <NumberBox
          label="W"
          value={size.w}
          onCommit={(w) => setSize(w, size.h)}
        />
        <NumberBox
          label="H"
          value={size.h}
          onCommit={(h) => setSize(size.w, h)}
        />
        <Button
          variant="secondary"
          size="icon-sm"
          aria-label="Swap width and height"
          title="Swap width and height"
          onClick={() => setSize(size.h, size.w)}
        >
          <Icon icon={ArrowDataTransferHorizontalIcon} />
        </Button>
      </div>
      <p className="px-3 pb-1.5 label text-ink-tertiary">
        {aspectLabel(size.w, size.h)} · up to 8192 px a side
      </p>
    </Pop>
  )
}
