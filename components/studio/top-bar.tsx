"use client"

import {
  Bookmark02Icon,
  Download04Icon,
  KeyboardIcon,
  Link01Icon,
} from "@hugeicons/core-free-icons"
import { useRef, useState } from "react"
import Link from "next/link"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { Edit02Icon, Tick02Icon } from "@hugeicons/core-free-icons"
import type { IconSvgElement } from "@hugeicons/react"
import { useStudio } from "@/store/studio"
import { Logo, Mark } from "@/components/brand/logo"
import { Button } from "@/components/ui/button"
import { Icon } from "@/components/ui/icon"
import { Tip } from "@/components/ui/tooltip"
import { copyShareLink, saveCurrent } from "./actions"

export function TopBar({ compact = false }: { compact?: boolean }) {
  const setUI = useStudio((s) => s.setUI)
  const [done, flash] = useFlash()

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 px-3 sm:px-4">
      <Link href="/" aria-label="Gradii" className="shrink-0 rounded-[8px]">
        {compact ? <Mark className="size-7" /> : <Logo />}
      </Link>
      <span aria-hidden className="h-4 w-px bg-hairline" />
      <NameField />
      <div className="ml-auto flex items-center gap-1">
        {!compact && (
          <Tip label="Keyboard shortcuts" keys="?" side="bottom">
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Keyboard shortcuts"
              onClick={() => setUI({ dialog: "shortcuts" })}
            >
              <Icon icon={KeyboardIcon} />
            </Button>
          </Tip>
        )}
        <Tip label="Save to library" keys="mod+s" side="bottom">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Save to library"
            onClick={() => {
              saveCurrent()
              flash("save")
            }}
          >
            <Swap on={done === "save"} icon={Bookmark02Icon} />
          </Button>
        </Tip>
        <Tip label="Copy link" side="bottom">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Copy share link"
            onClick={async () => {
              if (await copyShareLink()) flash("link")
            }}
          >
            <Swap on={done === "link"} icon={Link01Icon} />
          </Button>
        </Tip>
        <Tip label="Export" keys="e" side="bottom">
          <Button
            variant="primary"
            size="sm"
            className="ml-1 pl-2.5"
            onClick={() => setUI({ dialog: "export" })}
          >
            <Icon icon={Download04Icon} />
            Export
          </Button>
        </Tip>
      </div>
    </header>
  )
}

/** Briefly marks which button just did its job. */
function useFlash() {
  const [done, setDone] = useState<string | null>(null)
  const t = useRef<ReturnType<typeof setTimeout>>(undefined)
  const flash = (id: string) => {
    clearTimeout(t.current)
    setDone(id)
    t.current = setTimeout(() => setDone(null), 1400)
  }
  return [done, flash] as const
}

/** An icon that turns into a tick for a moment once its action lands. */
function Swap({ on, icon }: { on: boolean; icon: IconSvgElement }) {
  const reduce = useReducedMotion()
  return (
    <span className="relative grid size-4 place-items-center">
      <AnimatePresence initial={false} mode="popLayout">
        <motion.span
          key={on ? "tick" : "icon"}
          initial={
            reduce
              ? { opacity: 0 }
              : { opacity: 0, scale: 0.6, filter: "blur(2px)" }
          }
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          exit={
            reduce
              ? { opacity: 0 }
              : { opacity: 0, scale: 0.6, filter: "blur(2px)" }
          }
          transition={{ type: "spring", duration: 0.25, bounce: 0 }}
          className={
            on
              ? "text-[oklch(0.62_0.19_148)] dark:text-[oklch(0.79_0.21_148)]"
              : undefined
          }
        >
          <Icon icon={on ? Tick02Icon : icon} strokeWidth={on ? 2.2 : 1.8} />
        </motion.span>
      </AnimatePresence>
    </span>
  )
}

/**
 * The gradient's name, which names every file it exports. It reads as text
 * but says it's editable: a quiet pencil, a surface on hover, a tooltip.
 */
function NameField() {
  const name = useStudio((s) => s.doc.name)
  const set = useStudio((s) => s.set)
  const ref = useRef<HTMLInputElement>(null)
  return (
    <Tip label="Rename · used for exported file names" side="bottom">
      <label className="group relative flex h-8 min-w-0 cursor-text items-center gap-1.5 rounded-[8px] px-2 transition-colors duration-150 ease-out hover:bg-ink/[0.05] has-[:focus]:bg-ink/[0.05] has-[:focus]:shadow-[inset_0_0_0_1px_var(--color-hairline)]">
        <input
          ref={ref}
          value={name}
          onChange={(e) => set({ name: e.target.value })}
          onFocus={(e) => e.currentTarget.select()}
          onBlur={(e) => {
            const v = e.currentTarget.value.trim()
            if (v !== name) set({ name: v || "Untitled" })
          }}
          onKeyDown={(e) => {
            e.stopPropagation()
            if (e.key === "Enter" || e.key === "Escape") e.currentTarget.blur()
          }}
          aria-label="Gradient name"
          placeholder="Untitled"
          spellCheck={false}
          maxLength={48}
          className="field-sizing-content max-w-[34vw] min-w-[5ch] truncate bg-transparent text-[13.5px] font-medium text-ink outline-none placeholder:text-ink-tertiary sm:max-w-[260px]"
        />
        <Icon
          icon={Edit02Icon}
          className="size-3.5 text-ink-tertiary transition-opacity duration-150 group-hover:text-ink-secondary group-has-[:focus]:opacity-0"
        />
      </label>
    </Tip>
  )
}
