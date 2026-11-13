import {
  Bricolage_Grotesque,
  DM_Serif_Display,
  Fraunces,
  Funnel_Display,
  Instrument_Serif,
  Inter,
  Lora,
  Manrope,
  Montserrat,
  Ms_Madi,
  Onest,
  Playfair_Display,
  Poppins,
  Space_Grotesk,
  Space_Mono,
  Syne,
  Unbounded,
} from "next/font/google"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"

/*
 * Typefaces for the text layer. None are preloaded: a font downloads the
 * first time someone picks it.
 */
const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  display: "swap",
  preload: false,
})
const dmSerif = DM_Serif_Display({
  subsets: ["latin"],
  display: "swap",
  preload: false,
  weight: "400",
  style: ["normal", "italic"],
})
const fraunces = Fraunces({
  subsets: ["latin"],
  display: "swap",
  preload: false,
  style: ["normal", "italic"],
})
const funnel = Funnel_Display({
  subsets: ["latin"],
  display: "swap",
  preload: false,
})
const instrument = Instrument_Serif({
  subsets: ["latin"],
  display: "swap",
  preload: false,
  weight: "400",
  style: ["normal", "italic"],
})
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  preload: false,
  style: ["normal", "italic"],
})
const lora = Lora({
  subsets: ["latin"],
  display: "swap",
  preload: false,
  style: ["normal", "italic"],
})
const manrope = Manrope({ subsets: ["latin"], display: "swap", preload: false })
const montserrat = Montserrat({
  subsets: ["latin"],
  display: "swap",
  preload: false,
  style: ["normal", "italic"],
})
const madi = Ms_Madi({
  subsets: ["latin"],
  display: "swap",
  preload: false,
  weight: "400",
})
const onest = Onest({ subsets: ["latin"], display: "swap", preload: false })
const playfair = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  preload: false,
  style: ["normal", "italic"],
})
const poppins = Poppins({
  subsets: ["latin"],
  display: "swap",
  preload: false,
  weight: ["300", "400", "500", "600", "700", "800"],
  style: ["normal", "italic"],
})
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  preload: false,
})
const spaceMono = Space_Mono({
  subsets: ["latin"],
  display: "swap",
  preload: false,
  weight: ["400", "700"],
  style: ["normal", "italic"],
})
const syne = Syne({ subsets: ["latin"], display: "swap", preload: false })
const unbounded = Unbounded({
  subsets: ["latin"],
  display: "swap",
  preload: false,
})

export interface FontDef {
  id: string
  label: string
  family: string
  category: "Sans" | "Serif" | "Display" | "Mono" | "Script"
  weights: number[]
  italic: boolean
}

const range = (a: number, b: number) =>
  Array.from({ length: (b - a) / 100 + 1 }, (_, i) => a + i * 100)

export const FONTS: FontDef[] = [
  {
    id: "geist",
    label: "Geist",
    family: GeistSans.style.fontFamily,
    category: "Sans",
    weights: range(100, 900),
    italic: false,
  },
  {
    id: "inter",
    label: "Inter",
    family: inter.style.fontFamily,
    category: "Sans",
    weights: range(100, 900),
    italic: true,
  },
  {
    id: "onest",
    label: "Onest",
    family: onest.style.fontFamily,
    category: "Sans",
    weights: range(100, 900),
    italic: false,
  },
  {
    id: "manrope",
    label: "Manrope",
    family: manrope.style.fontFamily,
    category: "Sans",
    weights: range(200, 800),
    italic: false,
  },
  {
    id: "space-grotesk",
    label: "Space Grotesk",
    family: spaceGrotesk.style.fontFamily,
    category: "Sans",
    weights: range(300, 700),
    italic: false,
  },
  {
    id: "montserrat",
    label: "Montserrat",
    family: montserrat.style.fontFamily,
    category: "Sans",
    weights: range(100, 900),
    italic: true,
  },
  {
    id: "poppins",
    label: "Poppins",
    family: poppins.style.fontFamily,
    category: "Sans",
    weights: range(300, 800),
    italic: true,
  },
  {
    id: "bricolage",
    label: "Bricolage Grotesque",
    family: bricolage.style.fontFamily,
    category: "Display",
    weights: range(200, 800),
    italic: false,
  },
  {
    id: "funnel",
    label: "Funnel Display",
    family: funnel.style.fontFamily,
    category: "Display",
    weights: range(300, 800),
    italic: false,
  },
  {
    id: "syne",
    label: "Syne",
    family: syne.style.fontFamily,
    category: "Display",
    weights: range(400, 800),
    italic: false,
  },
  {
    id: "unbounded",
    label: "Unbounded",
    family: unbounded.style.fontFamily,
    category: "Display",
    weights: range(200, 900),
    italic: false,
  },
  {
    id: "instrument",
    label: "Instrument Serif",
    family: instrument.style.fontFamily,
    category: "Serif",
    weights: [400],
    italic: true,
  },
  {
    id: "fraunces",
    label: "Fraunces",
    family: fraunces.style.fontFamily,
    category: "Serif",
    weights: range(100, 900),
    italic: true,
  },
  {
    id: "playfair",
    label: "Playfair Display",
    family: playfair.style.fontFamily,
    category: "Serif",
    weights: range(400, 900),
    italic: true,
  },
  {
    id: "dm-serif",
    label: "DM Serif Display",
    family: dmSerif.style.fontFamily,
    category: "Serif",
    weights: [400],
    italic: true,
  },
  {
    id: "lora",
    label: "Lora",
    family: lora.style.fontFamily,
    category: "Serif",
    weights: range(400, 700),
    italic: true,
  },
  {
    id: "geist-mono",
    label: "Geist Mono",
    family: GeistMono.style.fontFamily,
    category: "Mono",
    weights: range(100, 900),
    italic: false,
  },
  {
    id: "space-mono",
    label: "Space Mono",
    family: spaceMono.style.fontFamily,
    category: "Mono",
    weights: [400, 700],
    italic: true,
  },
  {
    id: "ms-madi",
    label: "Ms Madi",
    family: madi.style.fontFamily,
    category: "Script",
    weights: [400],
    italic: false,
  },
]

export const FONT = Object.fromEntries(FONTS.map((f) => [f.id, f])) as Record<
  string,
  FontDef
>

export const fontFor = (id: string) => FONT[id] ?? FONTS[0]

/** The nearest weight a family actually has. */
export function nearestWeight(id: string, weight: number) {
  return fontFor(id).weights.reduce((a, b) =>
    Math.abs(b - weight) < Math.abs(a - weight) ? b : a
  )
}

/** The class names that register every family's @font-face rules. */
export const FONT_CLASSES = [
  bricolage,
  dmSerif,
  fraunces,
  funnel,
  instrument,
  inter,
  lora,
  manrope,
  montserrat,
  madi,
  onest,
  playfair,
  poppins,
  spaceGrotesk,
  spaceMono,
  syne,
  unbounded,
].map((f) => f.className)
