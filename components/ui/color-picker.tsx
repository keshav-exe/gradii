"use client"

import { HexColorPicker } from "react-colorful"
import { ColorPickerIcon } from "@hugeicons/core-free-icons"
import { useState, type ReactNode } from "react"
import { useClientValue } from "@/hooks/use-media"
import { isHex, normalizeHex } from "@/lib/color"
import { Button } from "./button"
import { Icon } from "./icon"
import { Tip } from "./tooltip"

type EyeDropperCtor = new () => { open: () => Promise<{ sRGBHex: string }> }

export function ColorPicker({
  value,
  onChange,
  footer,
}: {
  value: string
  onChange: (hex: string) => void
  footer?: ReactNode
}) {
  // While typing, the field holds your text; otherwise it shows the value.
  const [draft, setDraft] = useState<string | null>(null)
  const dropper = useClientValue(() => "EyeDropper" in window, false)

  const pickFromScreen = async () => {
    const Ctor = (window as unknown as { EyeDropper: EyeDropperCtor })
      .EyeDropper
    try {
      const r = await new Ctor().open()
      onChange(normalizeHex(r.sRGBHex))
    } catch {}
  }

  return (
    <div className="picker flex w-[236px] flex-col gap-2.5">
      <HexColorPicker color={value} onChange={onChange} />
      <div className="flex items-center gap-1.5">
        <div className="flex h-8 flex-1 items-center rounded-[9px] bg-surface-muted pl-2.5 shadow-[inset_0_0_0_1px_var(--color-hairline)] focus-within:shadow-[inset_0_0_0_1.5px_var(--color-accent)]">
          <span className="label text-ink-tertiary">#</span>
          <input
            value={(draft ?? value).replace("#", "")}
            spellCheck={false}
            maxLength={7}
            aria-label="Hex colour"
            onChange={(e) => {
              const v = e.target.value
              setDraft(v)
              if (isHex(v) && v.replace("#", "").length === 6)
                onChange(normalizeHex(v))
            }}
            onBlur={() => {
              if (draft && isHex(draft)) onChange(normalizeHex(draft))
              setDraft(null)
            }}
            onKeyDown={(e) => e.stopPropagation()}
            className="h-full w-full bg-transparent px-1 label text-[13px] text-ink uppercase outline-none"
          />
        </div>
        {dropper && (
          <Tip label="Pick from screen">
            <Button
              variant="secondary"
              size="icon-sm"
              onClick={pickFromScreen}
              aria-label="Pick from screen"
            >
              <Icon icon={ColorPickerIcon} />
            </Button>
          </Tip>
        )}
      </div>
      {footer}
    </div>
  )
}
