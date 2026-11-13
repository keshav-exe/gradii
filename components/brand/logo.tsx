import { useId } from "react"
import { cn } from "@/lib/utils"

/**
 * The mark: a mesh gradient on a graphite tile, with one of the editor's
 * colour handles sitting on it. Colour lives in the mark, nowhere else.
 */
export function Mark({ className }: { className?: string }) {
  const id = useId().replace(/:/g, "")
  const g = (n: string) => `${id}-${n}`
  return (
    <svg viewBox="0 0 32 32" className={cn("size-7", className)} aria-hidden>
      <defs>
        <radialGradient id={g("a")} cx="0.18" cy="0.16" r="0.85">
          <stop offset="0" stopColor="#ff8a3d" />
          <stop offset="1" stopColor="#ff8a3d" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={g("b")} cx="0.92" cy="0.22" r="0.75">
          <stop offset="0" stopColor="#ff3d7f" />
          <stop offset="1" stopColor="#ff3d7f" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={g("c")} cx="0.22" cy="0.98" r="0.85">
          <stop offset="0" stopColor="#3d63ff" />
          <stop offset="1" stopColor="#3d63ff" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={g("d")} cx="0.9" cy="0.92" r="0.7">
          <stop offset="0" stopColor="#9b5cff" />
          <stop offset="1" stopColor="#9b5cff" stopOpacity="0" />
        </radialGradient>
        <clipPath id={g("clip")}>
          <rect width="32" height="32" rx="9" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${g("clip")})`}>
        <rect width="32" height="32" fill="#1b1c1f" />
        <rect width="32" height="32" fill={`url(#${g("c")})`} />
        <rect width="32" height="32" fill={`url(#${g("d")})`} />
        <rect width="32" height="32" fill={`url(#${g("b")})`} />
        <rect width="32" height="32" fill={`url(#${g("a")})`} />
        <rect
          x="0.5"
          y="0.5"
          width="31"
          height="31"
          rx="8.5"
          fill="none"
          stroke="#fff"
          strokeOpacity="0.16"
        />
      </g>
      <circle
        cx="20.5"
        cy="12"
        r="4.2"
        fill="#ff3d7f"
        stroke="#fff"
        strokeWidth="2"
      />
    </svg>
  )
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <Mark className="size-6" />
      <span className="text-[17px] leading-none display text-ink">gradii</span>
    </span>
  )
}
