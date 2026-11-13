import { ImageResponse } from "next/og"
import { MarkArt } from "./brand-art"

export const size = { width: 180, height: 180 }
export const contentType = "image/png"

export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        background: "#03203a",
      }}
    >
      <MarkArt size={180} />
    </div>,
    size
  )
}
