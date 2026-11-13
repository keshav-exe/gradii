"use client"

import { create } from "zustand"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { Tick02Icon, Cancel01Icon } from "@hugeicons/core-free-icons"
import { Icon } from "./icon"

interface Toast {
  id: number
  text: string
  tone: "ok" | "error" | "info"
}

const useToasts = create<{ items: Toast[] }>(() => ({ items: [] }))
let n = 0

/** A short note in a graphite pill, bottom centre. One line, then gone. */
export function toast(text: string, tone: Toast["tone"] = "ok") {
  const id = ++n
  useToasts.setState((s) => ({
    items: [...s.items.slice(-2), { id, text, tone }],
  }))
  setTimeout(
    () =>
      useToasts.setState((s) => ({
        items: s.items.filter((t) => t.id !== id),
      })),
    tone === "error" ? 5000 : 2400
  )
}

export function Toaster() {
  const items = useToasts((s) => s.items)
  const reduce = useReducedMotion()
  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 top-3 z-[60] flex flex-col items-center gap-2 px-4"
    >
      <AnimatePresence initial={false}>
        {items.map((t) => (
          <motion.div
            key={t.id}
            layout={!reduce}
            initial={
              reduce ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.97 }
            }
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -6, scale: 0.98 }}
            transition={{ type: "spring", duration: 0.32, bounce: 0 }}
            className="flex max-w-full items-center gap-2 rounded-[12px] plaque py-2 pr-3.5 pl-2.5 text-[13px] font-medium"
          >
            {t.tone !== "info" && (
              <span
                className={
                  t.tone === "ok"
                    ? "text-[oklch(0.79_0.21_148)]"
                    : "text-[oklch(0.72_0.2_25)]"
                }
              >
                <Icon
                  icon={t.tone === "ok" ? Tick02Icon : Cancel01Icon}
                  strokeWidth={2.2}
                />
              </span>
            )}
            <span className="truncate">{t.text}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
