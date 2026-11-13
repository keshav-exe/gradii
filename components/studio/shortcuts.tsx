"use client"

import { useEffect } from "react"
import { STYLES } from "@/lib/engine/styles"
import { useStudio } from "@/store/studio"
import { Kbd } from "@/components/ui/kbd"
import { Modal } from "@/components/ui/modal"
import { copyCurrent, saveCurrent } from "./actions"

export const SHORTCUTS: { keys: string; label: string }[] = [
  { keys: "space", label: "Play or pause" },
  { keys: "r", label: "New colours" },
  { keys: "l", label: "New layout" },
  { keys: "shift+r", label: "Surprise me" },
  { keys: "[", label: "Previous preset" },
  { keys: "]", label: "Next preset" },
  { keys: "1", label: "Styles 1 to 7" },
  { keys: "h", label: "Show or hide handles" },
  { keys: "f", label: "Focus: the canvas alone" },
  { keys: "e", label: "Export" },
  { keys: "mod+c", label: "Copy as PNG" },
  { keys: "mod+s", label: "Save to library" },
  { keys: "mod+z", label: "Undo" },
  { keys: "mod+shift+z", label: "Redo" },
  { keys: "delete", label: "Remove the selected colour" },
  { keys: "?", label: "This list" },
]

const typing = (t: EventTarget | null) =>
  t instanceof HTMLElement &&
  (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))

export function useShortcuts() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (typing(e.target)) return
      const s = useStudio.getState()
      const mod = e.metaKey || e.ctrlKey
      const k = e.key.toLowerCase()

      if (mod) {
        if (k === "z") {
          e.preventDefault()
          return e.shiftKey ? s.redo() : s.undo()
        }
        if (k === "y") {
          e.preventDefault()
          return s.redo()
        }
        if (k === "s") {
          e.preventDefault()
          return saveCurrent()
        }
        if (k === "c" && !window.getSelection()?.toString()) {
          e.preventDefault()
          return copyCurrent()
        }
        if (k === "e") {
          e.preventDefault()
          return s.setUI({ dialog: "export" })
        }
        return
      }
      if (e.altKey || s.dialog) return
      if (document.querySelector("[data-base-ui-popup-open], [role=dialog]")) {
        if (k !== "escape") return
      }

      switch (k) {
        case " ":
          e.preventDefault()
          if (s.doc.speed === 0) s.set({ speed: 1 })
          return s.setUI({ playing: !(s.playing && s.doc.speed > 0) })
        case "r":
          return e.shiftKey ? s.surprise() : s.shuffleColors()
        case "l":
          return s.shuffleLayout()
        case "h":
          return s.setUI({ handles: !s.handles })
        case "f":
          return s.setUI({ zen: !s.zen })
        case "escape":
          if (s.zen) return s.setUI({ zen: false })
          return s.setUI({ selected: null })
        case "e":
          return s.setUI({ dialog: "export" })
        case "[":
          return s.stepPreset(-1)
        case "]":
          return s.stepPreset(1)
        case "?":
          return s.setUI({ dialog: "shortcuts" })
        case "backspace":
        case "delete":
          if (s.selected) {
            e.preventDefault()
            s.removeColor(s.selected)
          }
          return
      }
      const n = Number(k)
      if (n >= 1 && n <= STYLES.length) s.setStyle(STYLES[n - 1].id)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])
}

export function ShortcutsDialog() {
  const open = useStudio((s) => s.dialog === "shortcuts")
  const setUI = useStudio((s) => s.setUI)
  return (
    <Modal
      open={open}
      onOpenChange={(o) => setUI({ dialog: o ? "shortcuts" : null })}
      title="Keyboard shortcuts"
      className="sm:max-w-[440px]"
    >
      <ul className="flex flex-col">
        {SHORTCUTS.map((s) => (
          <li
            key={s.label}
            className="flex items-center justify-between border-b border-hairline py-2 text-[13px] last:border-b-0"
          >
            <span className="text-ink">{s.label}</span>
            <Kbd keys={s.keys} className="text-ink-secondary" />
          </li>
        ))}
      </ul>
    </Modal>
  )
}
