"use client"

import { Tooltip } from "@base-ui/react/tooltip"
import type { ReactElement, ReactNode } from "react"
import { Kbd } from "./kbd"

export const TipProvider = ({ children }: { children: ReactNode }) => (
  <Tooltip.Provider delay={400} closeDelay={0}>
    {children}
  </Tooltip.Provider>
)

/** A graphite label with an optional shortcut, after the sandbox's. */
export function Tip({
  label,
  keys,
  side = "top",
  children,
}: {
  label: ReactNode
  keys?: string
  side?: "top" | "bottom" | "left" | "right"
  children: ReactElement
}) {
  return (
    <Tooltip.Root>
      <Tooltip.Trigger render={children} />
      <Tooltip.Portal>
        <Tooltip.Positioner side={side} sideOffset={8} className="z-50">
          <Tooltip.Popup className="pop flex items-center gap-2 rounded-[8px] plaque px-2 py-1 text-xs font-medium">
            {label}
            {keys && <Kbd keys={keys} className="text-chrome-muted" />}
          </Tooltip.Popup>
        </Tooltip.Positioner>
      </Tooltip.Portal>
    </Tooltip.Root>
  )
}
