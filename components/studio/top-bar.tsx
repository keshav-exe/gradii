"use client"

import {
  Bookmark02Icon,
  Download04Icon,
  KeyboardIcon,
  Link01Icon,
} from "@hugeicons/core-free-icons"
import Link from "next/link"
import { useStudio } from "@/store/studio"
import { Logo, Mark } from "@/components/brand/logo"
import { Button } from "@/components/ui/button"
import { Icon } from "@/components/ui/icon"
import { Tip } from "@/components/ui/tooltip"
import { copyShareLink, saveCurrent } from "./actions"

export function TopBar({ compact = false }: { compact?: boolean }) {
  const name = useStudio((s) => s.doc.name)
  const setUI = useStudio((s) => s.setUI)
  const set = useStudio((s) => s.set)

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 px-3 sm:px-4">
      <Link href="/" aria-label="Gradii" className="shrink-0 rounded-[8px]">
        {compact ? <Mark className="size-7" /> : <Logo />}
      </Link>
      <span aria-hidden className="h-4 w-px bg-hairline" />
      <input
        value={name}
        onChange={(e) => set({ name: e.target.value })}
        onKeyDown={(e) => {
          e.stopPropagation()
          if (e.key === "Enter" || e.key === "Escape") e.currentTarget.blur()
        }}
        aria-label="Gradient name"
        placeholder="Untitled"
        spellCheck={false}
        className="h-8 min-w-0 flex-1 truncate rounded-[8px] bg-transparent px-2 text-[13.5px] font-medium text-ink outline-none placeholder:text-ink-tertiary hover:bg-ink/[0.04] focus:bg-ink/[0.05] sm:max-w-[260px]"
      />
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
            onClick={saveCurrent}
          >
            <Icon icon={Bookmark02Icon} />
          </Button>
        </Tip>
        <Tip label="Copy link" side="bottom">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Copy share link"
            onClick={copyShareLink}
          >
            <Icon icon={Link01Icon} />
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
