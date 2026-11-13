/* Development only: lets the exporters be exercised from the console. */
import { useStudio } from "@/store/studio"
import { renderFull, toBlob } from "./image"
import { exportVideo } from "./video"
import { exportPack } from "./pack"
import { toCSS, toEmbed } from "./code"
import { encodeDoc, decodeDoc } from "@/lib/share"

export function expose() {
  Object.assign(window, {
    __gradii: {
      useStudio,
      renderFull,
      toBlob,
      exportVideo,
      exportPack,
      toCSS,
      toEmbed,
      encodeDoc,
      decodeDoc,
    },
  })
}
