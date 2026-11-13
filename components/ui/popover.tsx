"use client"

import { Popover } from "@base-ui/react/popover"
import type { ReactElement, ReactNode } from "react"
import { cn } from "@/lib/utils"

/** A floating white panel, anchored to its trigger. */
export function Pop({
  trigger,
  children,
  side = "bottom",
  align = "start",
  open,
  onOpenChange,
  className,
}: {
  trigger: ReactElement
  children: ReactNode
  side?: "top" | "bottom" | "left" | "right"
  align?: "start" | "center" | "end"
  open?: boolean
  onOpenChange?: (open: boolean) => void
  className?: string
}) {
  return (
    <Popover.Root open={open} onOpenChange={onOpenChange}>
      <Popover.Trigger render={trigger} />
      <Popover.Portal>
        <Popover.Positioner
          side={side}
          align={align}
          sideOffset={8}
          collisionPadding={12}
          className="z-50"
        >
          <Popover.Popup
            className={cn(
              "pop rounded-[16px] bg-surface p-3 text-ink shadow-float outline-none",
              className
            )}
          >
            {children}
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  )
}
