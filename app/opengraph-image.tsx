import { readFile } from "node:fs/promises"
import { join } from "node:path"
import { ImageResponse } from "next/og"
import { MarkArt, MESH } from "./brand-art"

export const alt = "Gradii: a gradient and shader studio in the browser"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default async function OpenGraphImage() {
  const medium = await readFile(
    join(
      process.cwd(),
      "node_modules/geist/dist/fonts/geist-sans/Geist-Medium.ttf"
    )
  )
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 72,
        backgroundColor: "#121214",
        backgroundImage: MESH,
        fontFamily: "Geist",
        color: "white",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <MarkArt size={64} />
        <div style={{ fontSize: 44, letterSpacing: "-0.04em" }}>gradii</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <div
          style={{
            fontSize: 76,
            lineHeight: 1.02,
            letterSpacing: "-0.045em",
            maxWidth: 900,
          }}
        >
          Gradients, shaders and wallpapers.
        </div>
        <div style={{ fontSize: 30, opacity: 0.78, letterSpacing: "-0.02em" }}>
          Animate them, add type, export in 8K or as a seamless loop.
        </div>
      </div>
    </div>,
    {
      ...size,
      fonts: [{ name: "Geist", data: medium, weight: 500, style: "normal" }],
    }
  )
}
