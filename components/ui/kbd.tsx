import { cn, isMac } from "@/lib/utils"

const MAP: Record<string, string> = {
  mod: "⌘",
  shift: "⇧",
  alt: "⌥",
  enter: "↵",
  esc: "Esc",
  space: "Space",
}

/** A shortcut, written the way this platform writes it. */
export function Kbd({ keys, className }: { keys: string; className?: string }) {
  const mac = isMac()
  const parts = keys
    .split("+")
    .map((k) => (k === "mod" && !mac ? "Ctrl" : (MAP[k] ?? k.toUpperCase())))
  return (
    <span className={cn("inline-flex items-center gap-0.5", className)}>
      {parts.map((p, i) => (
        <kbd
          key={i}
          className="inline-grid h-[18px] min-w-[18px] place-items-center rounded-[5px] bg-current/12 px-1 label text-[11px] leading-none"
        >
          {p}
        </kbd>
      ))}
    </span>
  )
}
