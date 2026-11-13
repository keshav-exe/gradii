import { forwardRef, type ButtonHTMLAttributes } from "react"
import { cn } from "@/lib/utils"

const VARIANTS = {
  /** Graphite, like the sandbox's toolbars: the one solid control on screen. */
  primary: "plaque hover:bg-[color-mix(in_oklch,var(--color-chrome),white_7%)]",
  /** A white panel with a hairline, on the page. */
  secondary:
    "panel text-ink hover:bg-[color-mix(in_oklch,var(--color-surface),var(--color-ink)_5%)]",
  /** No surface until you point at it. */
  ghost: "text-ink-secondary hover:bg-ink/[0.06] hover:text-ink",
  /** Raised graphite, for a control that sits on a plaque. */
  chrome:
    "bg-chrome-raised text-chrome-ink shadow-chrome-raised hover:bg-[color-mix(in_oklch,var(--color-chrome-raised),white_8%)]",
  /** Bare, on a plaque. */
  plaque: "text-chrome-muted hover:bg-chrome-lift hover:text-chrome-ink",
} as const

const SIZES = {
  default: "h-9 rounded-[10px] px-3.5 text-[13px]",
  sm: "h-8 rounded-[9px] px-3 text-[13px]",
  xs: "h-7 rounded-[8px] px-2.5 text-xs",
  icon: "size-9 rounded-[10px]",
  "icon-sm": "size-8 rounded-[9px]",
  "icon-xs": "size-7 rounded-[8px]",
} as const

export type ButtonVariant = keyof typeof VARIANTS
export type ButtonSize = keyof typeof SIZES

export function buttonClass(
  variant: ButtonVariant = "secondary",
  size: ButtonSize = "default",
  className?: string
) {
  return cn(
    "inline-flex shrink-0 items-center justify-center gap-1.5 font-medium whitespace-nowrap select-none",
    "transition-[scale,background-color,color,box-shadow,opacity] duration-150 ease-out active:scale-[0.97] motion-reduce:transition-none",
    "disabled:pointer-events-none disabled:opacity-40",
    SIZES[size],
    VARIANTS[variant],
    className
  )
}

export const Button = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: ButtonVariant
    size?: ButtonSize
  }
>(function Button(
  { variant, size, className, type = "button", ...props },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      className={buttonClass(variant, size, className)}
      {...props}
    />
  )
})
