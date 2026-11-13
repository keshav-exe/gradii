"use client"

import { useId, type ReactNode } from "react"
import { motion, useReducedMotion } from "motion/react"
import { cn } from "@/lib/utils"

/**
 * A segmented control. `chrome` is the graphite plaque from the sandbox;
 * `light` sits in a panel, a white thumb on a sunken track.
 */
export function Segmented<T extends string>({
  label,
  options,
  value,
  onChange,
  variant = "light",
  className,
  size = "default",
}: {
  label: string
  options: readonly { id: T; label: ReactNode; title?: string }[]
  value: T
  onChange: (id: T) => void
  variant?: "light" | "chrome"
  size?: "default" | "sm"
  className?: string
}) {
  const reduce = useReducedMotion()
  const group = useId()
  const chrome = variant === "chrome"
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn(
        "flex rounded-[11px] p-[3px]",
        chrome
          ? "plaque"
          : "bg-surface-muted shadow-[inset_0_0_0_1px_var(--color-hairline)]",
        className
      )}
    >
      {options.map((o) => {
        const on = o.id === value
        return (
          <button
            key={o.id}
            type="button"
            role="radio"
            aria-checked={on}
            title={o.title}
            onClick={() => onChange(o.id)}
            className={cn(
              "relative flex flex-1 items-center justify-center gap-1.5 rounded-[8px] px-2.5 font-medium whitespace-nowrap transition-colors duration-150 ease-out",
              size === "sm" ? "h-7 text-xs" : "h-[30px] text-[13px]",
              chrome
                ? on
                  ? "text-chrome-ink"
                  : "text-chrome-muted hover:text-chrome-ink"
                : on
                  ? "text-ink"
                  : "text-ink-secondary hover:text-ink"
            )}
          >
            {on && (
              <motion.span
                layoutId={`seg-${group}`}
                transition={
                  reduce
                    ? { duration: 0 }
                    : { type: "spring", duration: 0.3, bounce: 0 }
                }
                className={cn(
                  "absolute inset-0 rounded-[8px]",
                  chrome ? "bg-chrome-raised shadow-chrome-raised" : "panel"
                )}
              />
            )}
            <span className="relative flex items-center gap-1.5">
              {o.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}
