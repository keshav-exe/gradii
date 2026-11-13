"use client"

import { create } from "zustand"
import { hydrate, makeDoc } from "@/lib/doc"
import { STYLE } from "@/lib/engine/styles"
import type {
  ColorStop,
  Doc,
  Effects,
  ImageLayer,
  StyleId,
  TextLayer,
} from "@/lib/engine/types"
import { mixHex } from "@/lib/color"
import { PRESETS } from "@/lib/presets"
import {
  groundFor,
  randomLayout,
  randomPalette,
  type Harmony,
  type Mood,
} from "@/lib/random"
import { clamp, uid } from "@/lib/utils"

export type Panel = "presets" | "gradient" | "effects" | "layers"
export type Dialog = "export" | "shortcuts" | null

export interface Saved {
  id: string
  doc: Doc
  thumb: string
  at: number
}

interface State {
  doc: Doc
  past: Doc[]
  future: Doc[]
  /** The last state that made it into history. */
  committed: Doc
  presetId: string | null

  playing: boolean
  selected: string | null
  handles: boolean
  zen: boolean
  panel: Panel
  dialog: Dialog
  saved: Saved[]
  harmony: Harmony | "auto"
  mood: Mood | "auto"
}

interface Actions {
  set: (patch: Partial<Doc>) => void
  undo: () => void
  redo: () => void
  replace: (doc: Doc, presetId?: string | null) => void
  applyPreset: (id: string) => void
  stepPreset: (dir: 1 | -1) => void

  setStyle: (style: StyleId) => void
  setParam: (key: string, value: number) => void
  setEffect: <K extends keyof Effects>(key: K, value: Effects[K]) => void
  resetEffects: (keys: (keyof Effects)[]) => void
  setText: (patch: Partial<TextLayer>) => void
  setImage: (patch: Partial<ImageLayer>) => void
  setSize: (w: number, h: number) => void

  setColor: (id: string, patch: Partial<ColorStop>) => void
  addColor: (at?: { x: number; y: number }) => void
  removeColor: (id: string) => void
  setPalette: (hexes: string[]) => void
  reverseColors: () => void

  shuffleColors: () => void
  shuffleLayout: () => void
  surprise: () => void

  setUI: (patch: Partial<State>) => void
  togglePlay: () => void
  save: (thumb: string) => void
  unsave: (id: string) => void
}

const first = PRESETS[0]
const initial = makeDoc(first)

export const useStudio = create<State & Actions>()((set, get) => {
  /** Edits land in the doc at once; history catches up when they settle. */
  const edit = (fn: (d: Doc) => Doc) => {
    set((s) => ({ doc: fn(s.doc), presetId: null }))
    scheduleCommit()
  }

  let timer: ReturnType<typeof setTimeout> | undefined
  const commit = () => {
    clearTimeout(timer)
    const { doc, committed, past } = get()
    if (doc === committed) return
    set({ past: [...past.slice(-79), committed], committed: doc, future: [] })
  }
  const scheduleCommit = () => {
    clearTimeout(timer)
    timer = setTimeout(commit, 350)
  }

  const randomColors = (d: Doc, count = d.colors.length) => {
    const { harmony, mood } = get()
    const keep = d.colors.map((c) => (c.locked ? c.hex : null))
    while (keep.length < count) keep.push(null)
    return randomPalette({
      count,
      keep: keep.slice(0, count),
      harmony: harmony === "auto" ? undefined : harmony,
      mood: mood === "auto" ? undefined : mood,
    })
  }

  return {
    doc: initial,
    past: [],
    future: [],
    committed: initial,
    presetId: first.id,
    playing: true,
    selected: null,
    handles: true,
    zen: false,
    panel: "gradient",
    dialog: null,
    saved: [],
    harmony: "auto",
    mood: "auto",

    set: (patch) => edit((d) => ({ ...d, ...patch })),

    undo: () => {
      commit()
      const { past, committed, future } = get()
      const prev = past.at(-1)
      if (!prev) return
      set({
        doc: prev,
        committed: prev,
        past: past.slice(0, -1),
        future: [committed, ...future],
        presetId: null,
      })
    },

    redo: () => {
      commit()
      const { past, committed, future } = get()
      const next = future[0]
      if (!next) return
      set({
        doc: next,
        committed: next,
        past: [...past, committed],
        future: future.slice(1),
        presetId: null,
      })
    },

    replace: (doc, presetId = null) => {
      commit()
      set({ doc, presetId, selected: null })
      commit()
    },

    applyPreset: (id) => {
      const p = PRESETS.find((x) => x.id === id)
      if (!p) return
      const { doc } = get()
      get().replace(makeDoc(p, doc), id)
    },

    stepPreset: (dir) => {
      const { presetId } = get()
      const i = PRESETS.findIndex((p) => p.id === presetId)
      const next = (i + dir + PRESETS.length) % PRESETS.length
      get().applyPreset(PRESETS[i < 0 ? 0 : next].id)
    },

    setStyle: (style) =>
      edit((d) => {
        // Orbs need a ground; borrow one that suits the palette.
        const background =
          STYLE[style].background &&
          d.style !== style &&
          d.background === "#0a0b0c"
            ? groundFor(
                d.colors.map((c) => c.hex),
                d.seed
              )
            : d.background
        return { ...d, style, background }
      }),

    setParam: (key, value) =>
      edit((d) => ({
        ...d,
        params: {
          ...d.params,
          [d.style]: { ...d.params[d.style], [key]: value },
        },
      })),

    setEffect: (key, value) =>
      edit((d) => ({ ...d, effects: { ...d.effects, [key]: value } })),

    resetEffects: (keys) =>
      edit((d) => {
        const base = makeDoc(PRESETS[0]).effects
        const effects = { ...d.effects }
        for (const k of keys) effects[k] = k === "grain" ? 0 : base[k]
        return { ...d, effects }
      }),

    setText: (patch) => edit((d) => ({ ...d, text: { ...d.text, ...patch } })),
    setImage: (patch) =>
      edit((d) => ({ ...d, image: { ...d.image, ...patch } })),
    setSize: (w, h) =>
      edit((d) => ({
        ...d,
        size: {
          w: Math.round(clamp(w, 64, 8192)),
          h: Math.round(clamp(h, 64, 8192)),
        },
      })),

    setColor: (id, patch) =>
      edit((d) => ({
        ...d,
        colors: d.colors.map((c) => (c.id === id ? { ...c, ...patch } : c)),
      })),

    addColor: (at) => {
      const { doc } = get()
      if (doc.colors.length >= 8) return
      const [x, y] = at ? [at.x, at.y] : randomLayout(1, Math.random())[0]
      // A new point takes the colour between its two nearest neighbours.
      const near = [...doc.colors].sort(
        (a, b) => Math.hypot(a.x - x, a.y - y) - Math.hypot(b.x - x, b.y - y)
      )
      const hex =
        near.length > 1
          ? mixHex(near[0].hex, near[1].hex, 0.5)
          : (near[0]?.hex ?? "#ffffff")
      const id = uid()
      edit((d) => ({ ...d, colors: [...d.colors, { id, hex, x, y }] }))
      set({ selected: id })
    },

    removeColor: (id) => {
      const { doc, selected } = get()
      if (doc.colors.length <= 2) return
      edit((d) => ({ ...d, colors: d.colors.filter((c) => c.id !== id) }))
      if (selected === id) set({ selected: null })
    },

    setPalette: (hexes) =>
      edit((d) => {
        const layout = randomLayout(hexes.length, d.seed)
        return {
          ...d,
          colors: hexes.slice(0, 8).map((hex, i) => ({
            id: d.colors[i]?.id ?? uid(),
            hex,
            x: d.colors[i]?.x ?? layout[i][0],
            y: d.colors[i]?.y ?? layout[i][1],
          })),
        }
      }),

    reverseColors: () =>
      edit((d) => {
        const hexes = d.colors.map((c) => c.hex).reverse()
        return {
          ...d,
          colors: d.colors.map((c, i) => ({ ...c, hex: hexes[i] })),
        }
      }),

    shuffleColors: () =>
      edit((d) => {
        const hexes = randomColors(d)
        const colors = d.colors.map((c, i) => ({ ...c, hex: hexes[i] }))
        const background = STYLE[d.style].background
          ? groundFor(hexes)
          : d.background
        return { ...d, colors, background }
      }),

    shuffleLayout: () =>
      edit((d) => {
        const seed = Math.random()
        const layout = randomLayout(d.colors.length, seed)
        return {
          ...d,
          seed,
          colors: d.colors.map((c, i) => ({
            ...c,
            x: layout[i][0],
            y: layout[i][1],
          })),
          center: {
            x: 0.3 + Math.random() * 0.4,
            y: 0.3 + Math.random() * 0.4,
          },
        }
      }),

    surprise: () =>
      edit((d) => {
        const styles = Object.keys(STYLE) as StyleId[]
        const weights: Record<StyleId, number> = {
          mesh: 4,
          fluid: 3,
          waves: 3,
          orbs: 2,
          linear: 1,
          radial: 1,
          conic: 1,
        }
        const bag = styles.flatMap(
          (s) => Array(weights[s]).fill(s) as StyleId[]
        )
        const style = bag[Math.floor(Math.random() * bag.length)]
        const count = 3 + Math.floor(Math.random() * 3)
        const hexes = randomColors(
          { ...d, colors: d.colors.slice(0, count) },
          count
        )
        const seed = Math.random()
        const layout = randomLayout(count, seed)
        const params = { ...d.params }
        params[style] = Object.fromEntries(
          STYLE[style].params.map((p) => {
            // Stay near the defaults: wild extremes rarely look good.
            const span = (p.max - p.min) * 0.35
            const v = clamp(
              p.default + (Math.random() - 0.5) * span,
              p.min,
              p.max
            )
            return [p.key, Math.round(v / p.step) * p.step]
          })
        )
        const roll = Math.random()
        return {
          ...d,
          style,
          seed,
          params,
          colors: hexes.map((hex, i) => ({
            id: d.colors[i]?.id ?? uid(),
            hex,
            x: layout[i][0],
            y: layout[i][1],
            locked: d.colors[i]?.locked,
          })),
          background: groundFor(hexes, seed),
          center: {
            x: 0.3 + Math.random() * 0.4,
            y: 0.3 + Math.random() * 0.4,
          },
          effects: {
            ...d.effects,
            grain: Math.round((0.04 + Math.random() * 0.18) * 100) / 100,
            glass: roll < 0.15 ? 0.5 : 0,
            dither: 0,
            pixelate: 0,
            vignette: roll > 0.8 ? 0.3 : 0,
          },
        }
      }),

    setUI: (patch) => set(patch),
    togglePlay: () => set((s) => ({ playing: !s.playing })),

    save: (thumb) => {
      const { doc, saved } = get()
      const item: Saved = { id: uid(), doc, thumb, at: Date.now() }
      set({ saved: [item, ...saved].slice(0, 60) })
    },
    unsave: (id) => set((s) => ({ saved: s.saved.filter((x) => x.id !== id) })),
  }
})

/* Autosave: the open document and the library live in localStorage. */
const DOC_KEY = "gradii:doc"
const LIB_KEY = "gradii:saved"
const UI_KEY = "gradii:ui"

export function restore() {
  try {
    const raw = localStorage.getItem(DOC_KEY)
    const doc = raw ? hydrate(JSON.parse(raw)) : null
    const saved = JSON.parse(localStorage.getItem(LIB_KEY) ?? "[]") as Saved[]
    const ui = JSON.parse(localStorage.getItem(UI_KEY) ?? "{}")
    const lib = saved
      .map((s) => ({ ...s, doc: hydrate(s.doc) }))
      .filter((s): s is Saved => !!s.doc)
    useStudio.setState({
      saved: lib,
      ...(typeof ui.handles === "boolean" ? { handles: ui.handles } : {}),
    })
    if (doc) {
      useStudio.setState({ doc, committed: doc, presetId: null })
    }
  } catch {}
}

export function persist() {
  let t: ReturnType<typeof setTimeout> | undefined
  let libDirty = false
  return useStudio.subscribe((s, prev) => {
    if (s.saved !== prev.saved) libDirty = true
    if (
      s.doc === prev.doc &&
      s.saved === prev.saved &&
      s.handles === prev.handles
    )
      return
    clearTimeout(t)
    t = setTimeout(() => {
      const write = (k: string, v: unknown) => {
        try {
          localStorage.setItem(k, JSON.stringify(v))
        } catch {
          // Full, most likely from a big logo; keep the doc without it.
          if (k === DOC_KEY)
            try {
              const d = v as Doc
              localStorage.setItem(
                k,
                JSON.stringify({ ...d, image: { ...d.image, src: null } })
              )
            } catch {}
        }
      }
      write(DOC_KEY, s.doc)
      if (libDirty) write(LIB_KEY, s.saved)
      libDirty = false
      write(UI_KEY, { handles: s.handles })
    }, 400)
  })
}
