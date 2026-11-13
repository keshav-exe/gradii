"use client"

import { useState, type CSSProperties, type ReactNode } from "react"
import { ArrowDown01Icon, Tick02Icon } from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"
import { Icon } from "./icon"
import { Pop } from "./popover"

export interface Option<T extends string> {
  id: T
  label: ReactNode
  hint?: ReactNode
  style?: CSSProperties
  group?: string
}

/** A compact field that opens a list. Groups get a quiet heading. */
export function Select<T extends string>({
  label,
  value,
  options,
  onChange,
  className,
  width = 240,
}: {
  label: string
  value: T
  options: Option<T>[]
  onChange: (v: T) => void
  className?: string
  width?: number
}) {
  const [open, setOpen] = useState(false)
  const current = options.find((o) => o.id === value)
  return (
    <Pop
      open={open}
      onOpenChange={setOpen}
      align="end"
      className="p-1.5"
      trigger={
        <button
          type="button"
          aria-label={label}
          className={cn(
            "flex h-8 min-w-0 items-center gap-1.5 rounded-[9px] bg-surface-muted pr-2 pl-2.5 text-[12.5px] text-ink shadow-[inset_0_0_0_1px_var(--color-hairline)] transition-colors hover:bg-[color-mix(in_oklch,var(--color-surface-muted),var(--color-ink)_4%)]",
            className
          )}
        >
          <span className="truncate" style={current?.style}>
            {current?.label}
          </span>
          <Icon
            icon={ArrowDown01Icon}
            className="ml-auto size-3.5 text-ink-tertiary"
          />
        </button>
      }
    >
      <div
        role="listbox"
        aria-label={label}
        className="max-h-[min(50dvh,380px)] scroll-quiet overflow-y-auto"
        style={{ width }}
      >
        {options.map((o, i) => {
          const heading =
            o.group && o.group !== options[i - 1]?.group ? o.group : null
          const on = o.id === value
          return (
            <div key={o.id}>
              {heading && (
                <p className="px-2 pt-2 pb-1 text-[11.5px] font-medium text-ink-tertiary">
                  {heading}
                </p>
              )}
              <button
                type="button"
                role="option"
                aria-selected={on}
                onClick={() => {
                  onChange(o.id)
                  setOpen(false)
                }}
                className={cn(
                  "flex min-h-8 w-full items-center gap-2 rounded-[8px] px-2 text-left text-[13px] text-ink transition-colors duration-100 hover:bg-ink/[0.05]",
                  on && "bg-ink/[0.05]"
                )}
              >
                <span className="truncate" style={o.style}>
                  {o.label}
                </span>
                {o.hint && (
                  <span className="ml-auto shrink-0 label text-ink-tertiary">
                    {o.hint}
                  </span>
                )}
                <Icon
                  icon={Tick02Icon}
                  className={cn(
                    "size-3.5 shrink-0",
                    !o.hint && "ml-auto",
                    !on && "invisible"
                  )}
                />
              </button>
            </div>
          )
        })}
      </div>
    </Pop>
  )
}
