import { create } from "zustand";
import {
  INITIAL_COLORS,
  INITIAL_BACKGROUND_COLORS,
  type CircleProps,
} from "@/lib/constants";
import { Dispatch, SetStateAction } from "react";
import { debounce } from "@/lib/utils";

interface WallpaperState {
  // Colors and Circles
  colors: string[];
  backgroundColors: string[];
  activeColor: number | null;
  circles: CircleProps[];
  previousCircles: CircleProps[];
  numCircles: number;
  backgroundColor: string;

  // Text Properties
  text: string;
  htmlContent: string;
  fontSize: number;
  fontWeight: number;
  letterSpacing: number;
  opacity: number;
  fontFamily: string;
  lineHeight: number;
  textColor: string;
  isItalic: boolean;
  isUnderline: boolean;
  isStrikethrough: boolean;

  // Effects
  blur: number;
  saturation: number;
  contrast: number;
  brightness: number;
  grainIntensity: number;
  textShadow: {
    color: string;
    blur: number;
    offsetX: number;
    offsetY: number;
  };

  // UI State
  activeTab: "design" | "effects" | "canvas";
  activeColorPicker: string;
  activeColorType: "text" | "background" | "gradient";
  resolution: { width: number; height: number };
  isDownloading: boolean;
  isGenerating: boolean;
  isUploading: boolean;
  backgroundImage: string | null;

  // Position
  textPosition: { x: number; y: number };

  // Add these to WallpaperState interface
  sizeMode: "text" | "image";
  logoImage: string | null;
  foregroundVisible: boolean;
  foregroundLocked: boolean;

  // Text Alignment
  textAlign: "left" | "center" | "right";

  // Actions
  setCircles: (circles: CircleProps[]) => void;
  setPreviousCircles: (circles: CircleProps[]) => void;
  setActiveColor: (index: number | null) => void;
  updateColor: (newColor: string, index: number) => void;
  setText: (text: string) => void;
  setHtmlContent: (content: string) => void;
  setFontSize: (size: number) => void;
  setFontWeight: (weight: number) => void;
  setFontFamily: (family: string) => void;
  setBackgroundColor: (color: string) => void;
  setTextColor: (color: string) => void;
  generateNewPalette: () => void;
  resetPalette: () => void;

  // Add missing setters
  setActiveTab: (tab: "design" | "effects" | "canvas") => void;
  setLetterSpacing: (spacing: number) => void;
  setOpacity: (opacity: number) => void;
  setLineHeight: (height: number) => void;
  setBlur: (blur: number) => void;
  setSaturation: (saturation: number) => void;
  setContrast: (contrast: number) => void;
  setBrightness: (brightness: number) => void;
  setGrainIntensity: (intensity: number) => void;
  setTextShadow: Dispatch<
    SetStateAction<{
      color: string;
      blur: number;
      offsetX: number;
      offsetY: number;
    }>
  >;
  setIsItalic: (isItalic: boolean) => void;
  setIsUnderline: (isUnderline: boolean) => void;
  setIsStrikethrough: (isStrikethrough: boolean) => void;
  setResolution: (resolution: { width: number; height: number }) => void;
  setBackgroundImage: (image: string | null) => void;
  setIsUploading: (isUploading: boolean) => void;
  setNumCircles: (num: number) => void;
  setActiveColorPicker: (color: string) => void;
  setActiveColorType: (type: "text" | "background" | "gradient") => void;
  setIsDownloading: (isDownloading: boolean) => void;
  setTextPosition: (textPosition: { x: number; y: number }) => void;

  // Add these actions
  setTextMode: (mode: "text" | "image") => void;
  setLogoImage: (image: string | null) => void;

  // Add missing setters
  setTextAlign: (align: "left" | "center" | "right") => void;
  setForegroundVisible: (visible: boolean) => void;
  setForegroundLocked: (locked: boolean) => void;

  // Add to WallpaperState interface
  isCopying: boolean;
  setIsCopying: (isCopying: boolean) => void;
}

export const useWallpaperStore = create<WallpaperState>((set, get) => ({
  // Initial state
  colors: INITIAL_COLORS,
  backgroundColors: INITIAL_BACKGROUND_COLORS,
  activeColor: null,
  circles: INITIAL_COLORS.map((color, index) => ({
    id: `blob-${index + 1}`,
    name: `Blob ${index + 1}`,
    color,
    cx: Math.random() * 100,
    cy: Math.random() * 100,
    r: 22,
    visible: true,
    locked: false,
  })),
  previousCircles: [],
  numCircles: INITIAL_COLORS.length,
  text: "Gradii.",
  htmlContent: "<p>Gradii.</p>",
  fontSize: 10,
  blur: 600,
  fontWeight: 600,
  letterSpacing: -0.02,
  opacity: 100,
  fontFamily: "Onest",
  activeTab: "design",
  grainIntensity: 25,
  backgroundColor: "#001220",
  lineHeight: 1,
  textColor: "#f1f1f1",
  activeColorPicker: "#f1f1f1",
  activeColorType: "text",
  resolution: { width: 1920, height: 1080 },
  saturation: 100,
  contrast: 100,
  brightness: 100,
  backgroundImage: null,
  isItalic: false,
  isUnderline: false,
  isStrikethrough: false,
  isDownloading: false,
  isGenerating: false,
  isUploading: false,
  textShadow: {
    color: "#f5f5f5",
    blur: 24,
    offsetX: 0,
    offsetY: 0,
  },
  textPosition: { x: 0, y: 0 },

  // Add to initial state
  sizeMode: "text",
  logoImage: null,
  foregroundVisible: true,
  foregroundLocked: false,

  // Text Alignment
  textAlign: "center",

  // Actions
  setCircles: (circles) => {
    set({ circles, numCircles: circles.length });
  },
  setPreviousCircles: (circles) => set({ previousCircles: circles }),
  setActiveColor: (index) => set({ activeColor: index }),
  updateColor: (newColor, index) => {
    const { circles } = get();
    const newCircles = [...circles];
    newCircles[index] = {
      ...newCircles[index],
      color: newColor,
    };
    set({ circles: newCircles });
  },
  setText: (text) => set({ text }),
  setHtmlContent: (content) => set({ htmlContent: content }),
  setFontSize: debounce((size: number) => set({ fontSize: size }), 100),
  setFontWeight: (weight) => set({ fontWeight: weight }),
  setFontFamily: (family) => set({ fontFamily: family }),
  setBackgroundColor: (color) => set({ backgroundColor: color }),
  setTextColor: (color) => set({ textColor: color }),

  generateNewPalette: () => {
    const { circles } = get();
    set({
      previousCircles: circles,
      circles: circles.map((circle) => ({
        ...circle,
        cx: Math.random() * 100,
        cy: Math.random() * 100,
      })),
    });
  },

  setActiveTab: (tab) => set({ activeTab: tab }),
  setLetterSpacing: debounce(
    (spacing: number) => set({ letterSpacing: spacing }),
    100
  ),
  setOpacity: (opacity) => set({ opacity }),
  setLineHeight: debounce((height: number) => set({ lineHeight: height }), 100),
  setBlur: debounce((blur: number) => set({ blur }), 100),
  setSaturation: debounce((saturation: number) => set({ saturation }), 100),
  setContrast: debounce((contrast: number) => set({ contrast }), 100),
  setBrightness: debounce((brightness: number) => set({ brightness }), 100),
  setGrainIntensity: debounce(
    (grainIntensity: number) => set({ grainIntensity }),
    100
  ),
  setTextShadow: (value) =>
    set({
      textShadow: typeof value === "function" ? value(get().textShadow) : value,
    }),
  setIsItalic: (isItalic) => set({ isItalic }),
  setIsUnderline: (isUnderline) => set({ isUnderline }),
  setIsStrikethrough: (isStrikethrough) => set({ isStrikethrough }),
  setResolution: (resolution) => set({ resolution }),
  setBackgroundImage: (image) => set({ backgroundImage: image }),
  setIsUploading: (isUploading) => set({ isUploading }),
  setNumCircles: (num) => set({ numCircles: num }),
  setActiveColorPicker: (color) => set({ activeColorPicker: color }),
  setActiveColorType: (type) => set({ activeColorType: type }),
  setIsDownloading: (isDownloading) => set({ isDownloading }),
  setTextPosition: (textPosition) => set({ textPosition }),
  setTextMode: (mode) => set({ sizeMode: mode }),
  setLogoImage: (image) => set({ logoImage: image }),
  setTextAlign: (align) => set({ textAlign: align }),
  setForegroundVisible: (visible) => set({ foregroundVisible: visible }),
  setForegroundLocked: (locked) => set({ foregroundLocked: locked }),
  isCopying: false,
  setIsCopying: (isCopying) => set({ isCopying }),
  resetPalette: () => {
    const { circles } = get();
    const newCircles = INITIAL_COLORS.map((color, index) => ({
      id: circles[index]?.id ?? `blob-${index + 1}`,
      name: circles[index]?.name ?? `Blob ${index + 1}`,
      color,
      cx: circles[index]?.cx ?? Math.random() * 100,
      cy: circles[index]?.cy ?? Math.random() * 100,
      r: circles[index]?.r ?? 22,
      visible: circles[index]?.visible ?? true,
      locked: circles[index]?.locked ?? false,
    }));

    // Check for overlapping circles and reposition if needed
    const repositionedCircles = newCircles.map((circle, index) => {
      const overlapping = newCircles.some((other, otherIndex) => {
        if (index === otherIndex) return false;
        const distance = Math.sqrt(
          Math.pow(circle.cx - other.cx, 2) + Math.pow(circle.cy - other.cy, 2)
        );
        return distance < 20;
      });

      if (overlapping) {
        let attempts = 0;
        let newCx = circle.cx;
        let newCy = circle.cy;

        while (attempts < 10) {
          newCx = Math.random() * 100;
          newCy = Math.random() * 100;

          const hasOverlap = newCircles.some((other, otherIndex) => {
            if (index === otherIndex) return false;
            const distance = Math.sqrt(
              Math.pow(newCx - other.cx, 2) + Math.pow(newCy - other.cy, 2)
            );
            return distance < 20;
          });

          if (!hasOverlap) break;
          attempts++;
        }

        return { ...circle, cx: newCx, cy: newCy };
      }

      return circle;
    });

    set({
      textColor: "#f1f1f1",
      backgroundColor: "#001220",
      circles: repositionedCircles,
      numCircles: INITIAL_COLORS.length,
    });
  },
}));
