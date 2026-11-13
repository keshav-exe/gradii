"use client"

import { useSyncExternalStore } from "react"
import { flushSync } from "react-dom"
import { motion, useReducedMotion } from "motion/react"
import { ComputerIcon, Moon02Icon, Sun03Icon } from "@hugeicons/core-free-icons"
import { THEME_KEY } from "@/lib/theme"
import { cn } from "@/lib/utils"
import { Icon } from "@/components/ui/icon"

type Choice = "system" | "light" | "dark"

/* Colour lives only in the icons, each control with a hue of its own. */
const CHOICES = [
  {
    id: "system",
    label: "Match the system",
    icon: ComputerIcon,
    hue: "text-[oklch(0.7_0.19_255)]",
  },
  {
    id: "light",
    label: "Light",
    icon: Sun03Icon,
    hue: "text-[oklch(0.87_0.18_92)]",
  },
  {
    id: "dark",
    label: "Dark",
    icon: Moon02Icon,
    hue: "text-[oklch(0.68_0.22_298)]",
  },
] as const

function read(): Choice {
  try {
    const saved = localStorage.getItem(THEME_KEY)
    return saved === "light" || saved === "dark" ? saved : "system"
  } catch {
    return "system"
  }
}

const CHANGE = "theme-change"

function apply(choice: Choice) {
  try {
    if (choice === "system") localStorage.removeItem(THEME_KEY)
    else localStorage.setItem(THEME_KEY, choice)
  } catch {}
  const dark =
    choice === "dark" ||
    (choice === "system" && matchMedia("(prefers-color-scheme: dark)").matches)
  document.documentElement.classList.toggle("dark", dark)
  window.dispatchEvent(new Event(CHANGE))
}

const subscribe = (onChange: () => void) => {
  window.addEventListener(CHANGE, onChange)
  window.addEventListener("storage", onChange)
  return () => {
    window.removeEventListener(CHANGE, onChange)
    window.removeEventListener("storage", onChange)
  }
}

/** Light, dark, or the system's: a small graphite plaque, as in the sandbox. */
export function ThemeSwitch({ className }: { className?: string }) {
  const reduce = useReducedMotion()
  const choice = useSyncExternalStore<Choice | null>(
    subscribe,
    read,
    () => null
  )

  const pick = (next: Choice) => {
    const root = document.documentElement
    if (reduce || !("startViewTransition" in document)) return apply(next)
    root.setAttribute("data-theme-switching", "")
    document
      .startViewTransition(() => flushSync(() => apply(next)))
      .finished.finally(() => root.removeAttribute("data-theme-switching"))
  }

  return (
    <div
      role="radiogroup"
      aria-label="Theme"
      className={cn("inline-flex rounded-[12px] plaque p-1", className)}
    >
      {CHOICES.map(({ id, label, icon, hue }) => {
        const on = choice === id
        return (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={on}
            aria-label={label}
            title={label}
            onClick={() => pick(id)}
            className="relative grid size-7 place-items-center rounded-[8px] text-chrome-muted transition-colors duration-150 ease-out hover:text-chrome-ink"
          >
            {on && (
              <motion.span
                layoutId="theme-thumb"
                transition={
                  reduce
                    ? { duration: 0 }
                    : { type: "spring", duration: 0.28, bounce: 0 }
                }
                className="absolute inset-0 rounded-[8px] bg-chrome-raised shadow-chrome-raised"
              />
            )}
            <Icon
              icon={icon}
              className={cn("relative size-[15px]", on && hue)}
            />
          </button>
        )
      })}
    </div>
  )
}
