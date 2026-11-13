"use client"

import { Switch as Base } from "@base-ui/react/switch"
import { cn } from "@/lib/utils"

export function Switch({
  checked,
  onChange,
  label,
  className,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
  className?: string
}) {
  return (
    <Base.Root
      checked={checked}
      onCheckedChange={(v) => onChange(v)}
      aria-label={label}
      className={cn(
        "relative inline-flex h-[22px] w-[38px] shrink-0 items-center rounded-full p-[2px] transition-colors duration-150 ease-out",
        "bg-ink/15 data-[checked]:bg-chrome dark:data-[checked]:bg-ink",
        className
      )}
    >
      <Base.Thumb className="size-[18px] rounded-full bg-white shadow-[0_1px_2px_rgb(0_0_0/0.25)] transition-transform duration-200 ease-[var(--ease-out-quint)] data-[checked]:translate-x-4 dark:data-[checked]:bg-background" />
    </Base.Root>
  )
}
