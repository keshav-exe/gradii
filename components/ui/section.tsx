import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

/** A titled group in the inspector, split from the next by a hairline. */
export function Section({
  title,
  actions,
  children,
  className,
}: {
  title?: ReactNode
  actions?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <section
      className={cn(
        "border-b border-hairline px-4 py-4 last:border-b-0",
        className
      )}
    >
      {(title || actions) && (
        <header className="mb-3 flex min-h-7 items-center justify-between gap-2">
          <h3 className="text-[13px] font-medium text-ink">{title}</h3>
          {actions && (
            <div className="-mr-1.5 flex items-center gap-0.5">{actions}</div>
          )}
        </header>
      )}
      <div className="flex flex-col gap-1.5">{children}</div>
    </section>
  )
}

/** A label on the left, a control on the right. */
export function Row({
  label,
  children,
}: {
  label: ReactNode
  children: ReactNode
}) {
  return (
    <div className="flex min-h-8 items-center justify-between gap-3">
      <span className="text-[12.5px] text-ink-secondary">{label}</span>
      {children}
    </div>
  )
}
