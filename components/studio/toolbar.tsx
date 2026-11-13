"use client"

import {
  DiceFaces03Icon,
  FullScreenIcon,
  MagicWand01Icon,
  PauseIcon,
  PlayIcon,
  Redo02Icon,
  ShuffleIcon,
  Target02Icon,
  Undo02Icon,
} from "@hugeicons/core-free-icons"
import type { IconSvgElement } from "@hugeicons/react"
import { cn } from "@/lib/utils"
import { useStudio } from "@/store/studio"
import { Icon } from "@/components/ui/icon"
import { Tip } from "@/components/ui/tooltip"

function Tool({
  icon,
  label,
  keys,
  onClick,
  pressed,
  disabled,
  accent,
}: {
  icon: IconSvgElement
  label: string
  keys?: string
  onClick: () => void
  pressed?: boolean
  disabled?: boolean
  accent?: string
}) {
  return (
    <Tip label={label} keys={keys}>
      <button
        type="button"
        aria-label={label}
        aria-pressed={pressed}
        disabled={disabled}
        onClick={onClick}
        className={cn(
          "grid size-9 place-items-center rounded-[9px] text-chrome-muted transition-[background-color,color,scale] duration-150 ease-out hover:bg-chrome-lift hover:text-chrome-ink active:scale-[0.96] disabled:opacity-35 disabled:hover:bg-transparent",
          pressed &&
            "bg-chrome-raised text-chrome-ink shadow-chrome-raised hover:bg-chrome-raised"
        )}
      >
        <Icon
          icon={icon}
          className={cn(
            "size-[18px]",
            icon === PlayIcon && "translate-x-px",
            accent
          )}
        />
      </button>
    </Tip>
  )
}

const Divider = () => (
  <span aria-hidden className="mx-1 h-5 w-px bg-chrome-lift" />
)

/** The floating graphite toolbar over the canvas, as in the sandbox. */
export function Toolbar({ compact = false }: { compact?: boolean }) {
  const playing = useStudio((s) => s.playing)
  const speed = useStudio((s) => s.doc.speed)
  const canUndo = useStudio((s) => s.past.length > 0 || s.doc !== s.committed)
  const canRedo = useStudio((s) => s.future.length > 0)
  const handles = useStudio((s) => s.handles)
  const a = useStudio.getState()

  return (
    <div
      role="toolbar"
      aria-label="Canvas tools"
      className="flex items-center rounded-[14px] plaque p-1"
    >
      <Tool
        icon={playing && speed > 0 ? PauseIcon : PlayIcon}
        label={playing ? "Pause" : "Play"}
        keys="space"
        onClick={() => {
          if (speed === 0) a.set({ speed: 1 })
          a.setUI({ playing: !(playing && speed > 0) })
        }}
      />
      <Divider />
      <Tool
        icon={Undo02Icon}
        label="Undo"
        keys="mod+z"
        onClick={a.undo}
        disabled={!canUndo}
      />
      <Tool
        icon={Redo02Icon}
        label="Redo"
        keys="mod+shift+z"
        onClick={a.redo}
        disabled={!canRedo}
      />
      <Divider />
      <Tool
        icon={DiceFaces03Icon}
        label="New colours"
        keys="r"
        onClick={a.shuffleColors}
        accent="text-[oklch(0.76_0.19_52)]"
      />
      <Tool
        icon={ShuffleIcon}
        label="New layout"
        keys="l"
        onClick={a.shuffleLayout}
        accent="text-[oklch(0.7_0.19_255)]"
      />
      <Tool
        icon={MagicWand01Icon}
        label="Surprise me"
        keys="shift+r"
        onClick={a.surprise}
        accent="text-[oklch(0.72_0.22_352)]"
      />
      {!compact && (
        <>
          <Divider />
          <Tool
            icon={Target02Icon}
            label={handles ? "Hide handles" : "Show handles"}
            keys="h"
            pressed={handles}
            onClick={() => a.setUI({ handles: !handles })}
          />
          <Tool
            icon={FullScreenIcon}
            label="Focus"
            keys="f"
            onClick={() => a.setUI({ zen: true })}
          />
        </>
      )}
    </div>
  )
}
