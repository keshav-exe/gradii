"use client"

import { Dialog } from "@base-ui/react/dialog"
import { Cancel01Icon } from "@hugeicons/core-free-icons"
import type { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { buttonClass } from "./button"
import { Icon } from "./icon"

export function Modal({
  open,
  onOpenChange,
  title,
  description,
  children,
  className,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: ReactNode
  description?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="backdrop fixed inset-0 z-50 bg-black/30 dark:bg-black/55" />
        <Dialog.Viewport className="fixed inset-0 z-50 grid place-items-end p-0 sm:place-items-center sm:p-6">
          <Dialog.Popup
            className={cn(
              "dialog flex max-h-[min(88dvh,760px)] w-full flex-col overflow-hidden rounded-t-[22px] bg-surface text-ink shadow-window outline-none sm:max-w-[520px] sm:rounded-[22px]",
              className
            )}
          >
            <header className="flex items-start justify-between gap-4 px-5 pt-5 pb-1">
              <div>
                <Dialog.Title className="text-[19px] leading-tight display">
                  {title}
                </Dialog.Title>
                {description && (
                  <Dialog.Description className="mt-1 text-[13px] text-ink-secondary">
                    {description}
                  </Dialog.Description>
                )}
              </div>
              <Dialog.Close
                aria-label="Close"
                className={buttonClass("ghost", "icon-sm", "-mt-1 -mr-2")}
              >
                <Icon icon={Cancel01Icon} />
              </Dialog.Close>
            </header>
            <div className="min-h-0 flex-1 scroll-quiet overflow-y-auto px-5 pt-3 pb-5">
              {children}
            </div>
          </Dialog.Popup>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
