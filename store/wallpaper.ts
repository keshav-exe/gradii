import { create } from "zustand";
import {
  INITIAL_COLORS,
  INITIAL_BACKGROUND_COLORS,
  type CircleProps,
  type Layer,
  type BlobLayer,
  type TextLayer,
  type ImageLayer,
} from "@/lib/constants";
import { Dispatch, SetStateAction } from "react";
import { debounce } from "@/lib/utils";

// Helper to create default blob layers from INITIAL_COLORS
const createDefaultBlobLayers = (): BlobLayer[] =>
  INITIAL_COLORS.map((color, index) => ({
    id: `blob-${index + 1}`,
    name: `Blob ${index + 1}`,
    type: "blob" as const,
    color,
    cx: Math.random() * 100,
    cy: Math.random() * 100,
    r: 22,
    visible: true,
    locked: false,
    zIndex: index,
  }));

// Helper to create default text layer
const createDefaultTextLayer = (): TextLayer => ({
  id: "text-1",
  name: "Text Layer 1",
  type: "text" as const,
  visible: true,
  locked: false,
  zIndex: INITIAL_COLORS.length, // Above all blobs
  position: { x: 0, y: 0 },
  content: "Gradii.",
  fontSize: 10,
  fontFamily: "Onest",
  fontWeight: 600,
  letterSpacing: -0.02,
  lineHeight: 1,
  textColor: "#f1f1f1",
  textAlign: "center",
  isItalic: false,
  isUnderline: false,
  isStrikethrough: false,
  opacity: 100,
  shadow: {
    color: "#f5f5f5",
    blur: 24,
    offsetX: 0,
    offsetY: 0,
  },
});

interface WallpaperState {
  // Colors and Background
  colors: string[];
  backgroundColors: string[];
  activeColor: number | null;
  backgroundColor: string;

  // Unified Layer System
  layers: Layer[];
  selectedLayerId: string | null;
  editingLayerId: string | null;

  // Legacy circles support (derived from layers for backward compatibility)
  circles: CircleProps[];
  previousCircles: CircleProps[];
  numCircles: number;

  // Legacy Text Properties (for backward compatibility - will read from selected text layer)
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
  activeTab: "text" | "style" | "layers";
  activeColorPicker: string;
  activeColorType: "text" | "background" | "gradient";
  resolution: { width: number; height: number };
  isDownloading: boolean;
  isGenerating: boolean;
  isUploading: boolean;
  backgroundImage: string | null;

  // Position
  textPosition: { x: number; y: number };

  // Mode
  sizeMode: "text" | "image";
  logoImage: string | null;
  foregroundVisible: boolean;
  foregroundLocked: boolean;

  // Text Alignment
  textAlign: "left" | "center" | "right";

  // Copying
  isCopying: boolean;

  // Layer Actions
  addBlobLayer: () => void;
  addTextLayer: () => void;
  addImageLayer: (imageData: string) => void;
  updateLayer: <T extends Layer>(id: string, updates: Partial<T>) => void;
  deleteLayer: (id: string) => void;
  moveLayer: (id: string, direction: "up" | "down") => void;
  selectLayer: (id: string | null) => void;
  setEditingLayer: (id: string | null) => void;

  // Layer Getters
  getBlobLayers: () => BlobLayer[];
  getTextLayers: () => TextLayer[];
  getImageLayers: () => ImageLayer[];
  getSelectedLayer: () => Layer | null;

  // Legacy Actions (kept for backward compatibility)
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

  setActiveTab: (tab: "text" | "style" | "layers") => void;
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
  setTextMode: (mode: "text" | "image") => void;
  setLogoImage: (image: string | null) => void;
  setTextAlign: (align: "left" | "center" | "right") => void;
  setForegroundVisible: (visible: boolean) => void;
  setForegroundLocked: (locked: boolean) => void;
  setIsCopying: (isCopying: boolean) => void;
  setLayers: (layers: Layer[]) => void;
}

// Helper to convert layers to circles (for backward compatibility)
const layersToCircles = (layers: Layer[]): CircleProps[] => {
  return layers
    .filter((l): l is BlobLayer => l.type === "blob")
    .map((blob) => ({
      id: blob.id,
      name: blob.name,
      color: blob.color,
      cx: blob.cx,
      cy: blob.cy,
      r: blob.r,
      visible: blob.visible,
      locked: blob.locked,
    }));
};

// Helper to update blob layers from circles
const circlesToBlobLayers = (
  circles: CircleProps[],
  existingLayers: Layer[]
): Layer[] => {
  const nonBlobLayers = existingLayers.filter((l) => l.type !== "blob");
  const blobLayers: BlobLayer[] = circles.map((circle, index) => ({
    id: circle.id ?? `blob-${index + 1}`,
    name: circle.name ?? `Blob ${index + 1}`,
    type: "blob" as const,
    color: circle.color,
    cx: circle.cx,
    cy: circle.cy,
    r: circle.r ?? 22,
    visible: circle.visible ?? true,
    locked: circle.locked ?? false,
    zIndex: index,
  }));

  // Adjust zIndex of non-blob layers to be above blobs
  const adjustedNonBlobLayers = nonBlobLayers.map((layer) => ({
    ...layer,
    zIndex: Math.max(layer.zIndex, blobLayers.length),
  }));

  return [...blobLayers, ...adjustedNonBlobLayers];
};

const initialLayers: Layer[] = [
  ...createDefaultBlobLayers(),
  createDefaultTextLayer(),
];

export const useWallpaperStore = create<WallpaperState>((set, get) => ({
  // Initial state
  colors: INITIAL_COLORS,
  backgroundColors: INITIAL_BACKGROUND_COLORS,
  activeColor: null,
  backgroundColor: "#001220",

  // Unified Layer System
  layers: initialLayers,
  selectedLayerId: "text-1", // Auto-select default text layer for better UX
  editingLayerId: null,

  // Legacy circles (derived from layers)
  circles: layersToCircles(initialLayers),
  previousCircles: [],
  numCircles: INITIAL_COLORS.length,

  // Legacy Text Properties (default values, will be synced with selected text layer)
  text: "Gradii.",
  htmlContent: "<p>Gradii.</p>",
  fontSize: 10,
  blur: 600,
  fontWeight: 600,
  letterSpacing: -0.02,
  opacity: 100,
  fontFamily: "Onest",
  activeTab: "text",
  grainIntensity: 25,
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
  sizeMode: "text",
  logoImage: null,
  foregroundVisible: true,
  foregroundLocked: false,
  textAlign: "center",
  isCopying: false,

  // Layer Actions
  addBlobLayer: () => {
    const { layers, colors } = get();
    const blobCount = layers.filter((l) => l.type === "blob").length;
    const maxZIndex = Math.max(...layers.map((l) => l.zIndex), -1);

    const newBlob: BlobLayer = {
      id: `blob-${Date.now()}`,
      name: `Blob ${blobCount + 1}`,
      type: "blob",
      color: colors[blobCount % colors.length],
      cx: Math.random() * 100,
      cy: Math.random() * 100,
      r: 22,
      visible: true,
      locked: false,
      zIndex: maxZIndex + 1,
    };

    const newLayers = [...layers, newBlob];
    set({
      layers: newLayers,
      circles: layersToCircles(newLayers),
      numCircles: newLayers.filter((l) => l.type === "blob").length,
      selectedLayerId: newBlob.id,
    });
  },

  addTextLayer: () => {
    const { layers } = get();
    const textCount = layers.filter((l) => l.type === "text").length;
    const maxZIndex = Math.max(...layers.map((l) => l.zIndex), -1);

    const newText: TextLayer = {
      id: `text-${Date.now()}`,
      name: `Text Layer ${textCount + 1}`,
      type: "text",
      visible: true,
      locked: false,
      zIndex: maxZIndex + 1,
      position: { x: 0, y: 0 },
      content: "New Text",
      fontSize: 10,
      fontFamily: "Onest",
      fontWeight: 600,
      letterSpacing: -0.02,
      lineHeight: 1,
      textColor: "#f1f1f1",
      textAlign: "center",
      isItalic: false,
      isUnderline: false,
      isStrikethrough: false,
      opacity: 100,
      shadow: {
        color: "#f5f5f5",
        blur: 24,
        offsetX: 0,
        offsetY: 0,
      },
    };

    set({
      layers: [...layers, newText],
      selectedLayerId: newText.id,
      editingLayerId: newText.id, // Start in edit mode
    });
  },

  addImageLayer: (imageData: string) => {
    const { layers } = get();
    const imageCount = layers.filter((l) => l.type === "image").length;
    const maxZIndex = Math.max(...layers.map((l) => l.zIndex), -1);

    const newImage: ImageLayer = {
      id: `image-${Date.now()}`,
      name: `Image Layer ${imageCount + 1}`,
      type: "image",
      visible: true,
      locked: false,
      zIndex: maxZIndex + 1,
      position: { x: 0, y: 0 },
      imageData,
      scale: 50,
      opacity: 100,
      shadow: {
        color: "#f5f5f5",
        blur: 24,
        offsetX: 0,
        offsetY: 0,
      },
    };

    set({
      layers: [...layers, newImage],
      selectedLayerId: newImage.id,
    });
  },

  updateLayer: <T extends Layer>(id: string, updates: Partial<T>) => {
    const { layers } = get();
    const newLayers = layers.map((layer) =>
      layer.id === id ? { ...layer, ...updates } : layer
    ) as Layer[];

    set({
      layers: newLayers,
      circles: layersToCircles(newLayers),
    });
  },

  deleteLayer: (id: string) => {
    const { layers, selectedLayerId } = get();
    const newLayers = layers.filter((l) => l.id !== id);

    set({
      layers: newLayers,
      circles: layersToCircles(newLayers),
      numCircles: newLayers.filter((l) => l.type === "blob").length,
      selectedLayerId: selectedLayerId === id ? null : selectedLayerId,
      editingLayerId: null,
    });
  },

  moveLayer: (id: string, direction: "up" | "down") => {
    const { layers } = get();
    const sortedLayers = [...layers].sort((a, b) => a.zIndex - b.zIndex);
    const currentIndex = sortedLayers.findIndex((l) => l.id === id);

    if (currentIndex === -1) return;

    const targetIndex =
      direction === "up" ? currentIndex + 1 : currentIndex - 1;
    if (targetIndex < 0 || targetIndex >= sortedLayers.length) return;

    // Swap zIndex values
    const currentLayer = sortedLayers[currentIndex];
    const targetLayer = sortedLayers[targetIndex];

    const newLayers = layers.map((layer) => {
      if (layer.id === currentLayer.id) {
        return { ...layer, zIndex: targetLayer.zIndex };
      }
      if (layer.id === targetLayer.id) {
        return { ...layer, zIndex: currentLayer.zIndex };
      }
      return layer;
    });

    set({
      layers: newLayers,
      circles: layersToCircles(newLayers),
    });
  },

  selectLayer: (id: string | null) => {
    const { layers, editingLayerId } = get();

    // If clicking on a different layer, exit edit mode
    if (editingLayerId && editingLayerId !== id) {
      set({ editingLayerId: null });
    }

    set({ selectedLayerId: id });

    // If selecting a text layer, sync its properties to legacy state
    if (id) {
      const layer = layers.find((l) => l.id === id);
      if (layer?.type === "text") {
        const textLayer = layer as TextLayer;
        set({
          text: textLayer.content,
          fontSize: textLayer.fontSize,
          fontFamily: textLayer.fontFamily,
          fontWeight: textLayer.fontWeight,
          letterSpacing: textLayer.letterSpacing,
          lineHeight: textLayer.lineHeight,
          textColor: textLayer.textColor,
          textAlign: textLayer.textAlign,
          isItalic: textLayer.isItalic,
          isUnderline: textLayer.isUnderline,
          isStrikethrough: textLayer.isStrikethrough,
          opacity: textLayer.opacity,
          textShadow: textLayer.shadow,
          textPosition: textLayer.position,
          activeColorPicker: textLayer.textColor,
        });
      } else if (layer?.type === "image") {
        const imageLayer = layer as ImageLayer;
        set({
          fontSize: imageLayer.scale,
          opacity: imageLayer.opacity,
          textShadow: imageLayer.shadow,
          textPosition: imageLayer.position,
        });
      }
    }
  },

  setEditingLayer: (id: string | null) => {
    set({ editingLayerId: id });
  },

  // Layer Getters
  getBlobLayers: () => {
    return get().layers.filter((l): l is BlobLayer => l.type === "blob");
  },

  getTextLayers: () => {
    return get().layers.filter((l): l is TextLayer => l.type === "text");
  },

  getImageLayers: () => {
    return get().layers.filter((l): l is ImageLayer => l.type === "image");
  },

  getSelectedLayer: () => {
    const { layers, selectedLayerId } = get();
    return layers.find((l) => l.id === selectedLayerId) ?? null;
  },

  // Legacy Actions (updated to work with layer system)
  setCircles: (circles) => {
    const { layers } = get();
    const newLayers = circlesToBlobLayers(circles, layers);
    set({
      layers: newLayers,
      circles,
      numCircles: circles.length,
    });
  },

  setPreviousCircles: (circles) => set({ previousCircles: circles }),
  setActiveColor: (index) => set({ activeColor: index }),

  updateColor: (newColor, index) => {
    const { layers } = get();
    const blobLayers = layers.filter((l) => l.type === "blob") as BlobLayer[];
    if (index >= 0 && index < blobLayers.length) {
      const blobId = blobLayers[index].id;
      const newLayers = layers.map((layer) =>
        layer.id === blobId ? { ...layer, color: newColor } : layer
      );
      set({
        layers: newLayers,
        circles: layersToCircles(newLayers),
      });
    }
  },

  setText: (text) => {
    const { selectedLayerId, layers } = get();
    // Update selected text layer if one is selected
    const selectedLayer = layers.find((l) => l.id === selectedLayerId);
    if (selectedLayer?.type === "text") {
      const newLayers = layers.map((layer) =>
        layer.id === selectedLayerId
          ? { ...layer, content: text }
          : layer
      );
      set({ layers: newLayers, text });
    } else {
      // Update first text layer if none selected
      const firstTextLayer = layers.find((l) => l.type === "text");
      if (firstTextLayer) {
        const newLayers = layers.map((layer) =>
          layer.id === firstTextLayer.id
            ? { ...layer, content: text }
            : layer
        );
        set({ layers: newLayers, text });
      } else {
        set({ text });
      }
    }
  },

  setHtmlContent: (content) => set({ htmlContent: content }),

  setFontSize: debounce((size: number) => {
    const { selectedLayerId, layers } = get();
    const selectedLayer = layers.find((l) => l.id === selectedLayerId);

    if (selectedLayer?.type === "text") {
      const newLayers = layers.map((layer) =>
        layer.id === selectedLayerId ? { ...layer, fontSize: size } : layer
      );
      set({ layers: newLayers, fontSize: size });
    } else if (selectedLayer?.type === "image") {
      const newLayers = layers.map((layer) =>
        layer.id === selectedLayerId ? { ...layer, scale: size } : layer
      );
      set({ layers: newLayers, fontSize: size });
    } else {
      set({ fontSize: size });
    }
  }, 100),

  setFontWeight: (weight) => {
    const { selectedLayerId, layers } = get();
    const selectedLayer = layers.find((l) => l.id === selectedLayerId);

    if (selectedLayer?.type === "text") {
      const newLayers = layers.map((layer) =>
        layer.id === selectedLayerId ? { ...layer, fontWeight: weight } : layer
      );
      set({ layers: newLayers, fontWeight: weight });
    } else {
      set({ fontWeight: weight });
    }
  },

  setFontFamily: (family) => {
    const { selectedLayerId, layers } = get();
    const selectedLayer = layers.find((l) => l.id === selectedLayerId);

    if (selectedLayer?.type === "text") {
      const newLayers = layers.map((layer) =>
        layer.id === selectedLayerId ? { ...layer, fontFamily: family } : layer
      );
      set({ layers: newLayers, fontFamily: family });
    } else {
      set({ fontFamily: family });
    }
  },

  setBackgroundColor: (color) => set({ backgroundColor: color }),

  setTextColor: (color) => {
    const { selectedLayerId, layers } = get();
    const selectedLayer = layers.find((l) => l.id === selectedLayerId);

    if (selectedLayer?.type === "text") {
      const newLayers = layers.map((layer) =>
        layer.id === selectedLayerId ? { ...layer, textColor: color } : layer
      );
      set({ layers: newLayers, textColor: color });
    } else {
      set({ textColor: color });
    }
  },

  generateNewPalette: () => {
    const { layers } = get();
    const circles = layersToCircles(layers);
    set({
      previousCircles: circles,
    });

    const newLayers = layers.map((layer) => {
      if (layer.type === "blob") {
        return {
          ...layer,
          cx: Math.random() * 100,
          cy: Math.random() * 100,
        };
      }
      return layer;
    });

    set({
      layers: newLayers,
      circles: layersToCircles(newLayers),
    });
  },

  setActiveTab: (tab) => set({ activeTab: tab }),

  setLetterSpacing: debounce((spacing: number) => {
    const { selectedLayerId, layers } = get();
    const selectedLayer = layers.find((l) => l.id === selectedLayerId);

    if (selectedLayer?.type === "text") {
      const newLayers = layers.map((layer) =>
        layer.id === selectedLayerId
          ? { ...layer, letterSpacing: spacing }
          : layer
      );
      set({ layers: newLayers, letterSpacing: spacing });
    } else {
      set({ letterSpacing: spacing });
    }
  }, 100),

  setOpacity: (opacity) => {
    const { selectedLayerId, layers } = get();
    const selectedLayer = layers.find((l) => l.id === selectedLayerId);

    if (selectedLayer?.type === "text" || selectedLayer?.type === "image") {
      const newLayers = layers.map((layer) =>
        layer.id === selectedLayerId ? { ...layer, opacity } : layer
      );
      set({ layers: newLayers, opacity });
    } else {
      set({ opacity });
    }
  },

  setLineHeight: debounce((height: number) => {
    const { selectedLayerId, layers } = get();
    const selectedLayer = layers.find((l) => l.id === selectedLayerId);

    if (selectedLayer?.type === "text") {
      const newLayers = layers.map((layer) =>
        layer.id === selectedLayerId ? { ...layer, lineHeight: height } : layer
      );
      set({ layers: newLayers, lineHeight: height });
    } else {
      set({ lineHeight: height });
    }
  }, 100),

  setBlur: debounce((blur: number) => set({ blur }), 100),
  setSaturation: debounce((saturation: number) => set({ saturation }), 100),
  setContrast: debounce((contrast: number) => set({ contrast }), 100),
  setBrightness: debounce((brightness: number) => set({ brightness }), 100),
  setGrainIntensity: debounce(
    (grainIntensity: number) => set({ grainIntensity }),
    100
  ),

  setTextShadow: (value) => {
    const newShadow =
      typeof value === "function" ? value(get().textShadow) : value;
    const { selectedLayerId, layers } = get();
    const selectedLayer = layers.find((l) => l.id === selectedLayerId);

    if (selectedLayer?.type === "text" || selectedLayer?.type === "image") {
      const newLayers = layers.map((layer) =>
        layer.id === selectedLayerId ? { ...layer, shadow: newShadow } : layer
      );
      set({ layers: newLayers, textShadow: newShadow });
    } else {
      set({ textShadow: newShadow });
    }
  },

  setIsItalic: (isItalic) => {
    const { selectedLayerId, layers } = get();
    const selectedLayer = layers.find((l) => l.id === selectedLayerId);

    if (selectedLayer?.type === "text") {
      const newLayers = layers.map((layer) =>
        layer.id === selectedLayerId ? { ...layer, isItalic } : layer
      );
      set({ layers: newLayers, isItalic });
    } else {
      set({ isItalic });
    }
  },

  setIsUnderline: (isUnderline) => {
    const { selectedLayerId, layers } = get();
    const selectedLayer = layers.find((l) => l.id === selectedLayerId);

    if (selectedLayer?.type === "text") {
      const newLayers = layers.map((layer) =>
        layer.id === selectedLayerId ? { ...layer, isUnderline } : layer
      );
      set({ layers: newLayers, isUnderline });
    } else {
      set({ isUnderline });
    }
  },

  setIsStrikethrough: (isStrikethrough) => {
    const { selectedLayerId, layers } = get();
    const selectedLayer = layers.find((l) => l.id === selectedLayerId);

    if (selectedLayer?.type === "text") {
      const newLayers = layers.map((layer) =>
        layer.id === selectedLayerId ? { ...layer, isStrikethrough } : layer
      );
      set({ layers: newLayers, isStrikethrough });
    } else {
      set({ isStrikethrough });
    }
  },

  setResolution: (resolution) => set({ resolution }),
  setBackgroundImage: (image) => set({ backgroundImage: image }),
  setIsUploading: (isUploading) => set({ isUploading }),
  setNumCircles: (num) => set({ numCircles: num }),
  setActiveColorPicker: (color) => set({ activeColorPicker: color }),
  setActiveColorType: (type) => set({ activeColorType: type }),
  setIsDownloading: (isDownloading) => set({ isDownloading }),

  setTextPosition: (textPosition) => {
    const { selectedLayerId, layers } = get();
    const selectedLayer = layers.find((l) => l.id === selectedLayerId);

    if (selectedLayer?.type === "text" || selectedLayer?.type === "image") {
      const newLayers = layers.map((layer) =>
        layer.id === selectedLayerId
          ? { ...layer, position: textPosition }
          : layer
      );
      set({ layers: newLayers, textPosition });
    } else {
      set({ textPosition });
    }
  },

  setTextMode: (mode) => set({ sizeMode: mode }),
  setLogoImage: (image) => set({ logoImage: image }),

  setTextAlign: (align) => {
    const { selectedLayerId, layers } = get();
    const selectedLayer = layers.find((l) => l.id === selectedLayerId);

    if (selectedLayer?.type === "text") {
      const newLayers = layers.map((layer) =>
        layer.id === selectedLayerId ? { ...layer, textAlign: align } : layer
      );
      set({ layers: newLayers, textAlign: align });
    } else {
      set({ textAlign: align });
    }
  },

  setForegroundVisible: (visible) => set({ foregroundVisible: visible }),
  setForegroundLocked: (locked) => set({ foregroundLocked: locked }),
  setIsCopying: (isCopying) => set({ isCopying }),
  setLayers: (layers) =>
    set({ layers, circles: layersToCircles(layers) }),

  resetPalette: () => {
    const { layers } = get();
    const nonBlobLayers = layers.filter((l) => l.type !== "blob");

    // Create new blob layers from initial colors
    const newBlobLayers = INITIAL_COLORS.map((color, index) => {
      const existingBlob = layers.find(
        (l) => l.type === "blob" && l.id === `blob-${index + 1}`
      ) as BlobLayer | undefined;

      return {
        id: existingBlob?.id ?? `blob-${index + 1}`,
        name: existingBlob?.name ?? `Blob ${index + 1}`,
        type: "blob" as const,
        color,
        cx: existingBlob?.cx ?? Math.random() * 100,
        cy: existingBlob?.cy ?? Math.random() * 100,
        r: existingBlob?.r ?? 22,
        visible: existingBlob?.visible ?? true,
        locked: existingBlob?.locked ?? false,
        zIndex: index,
      };
    });

    // Check for overlapping circles and reposition if needed
    const repositionedBlobLayers = newBlobLayers.map((blob, index) => {
      const overlapping = newBlobLayers.some((other, otherIndex) => {
        if (index === otherIndex) return false;
        const distance = Math.sqrt(
          Math.pow(blob.cx - other.cx, 2) + Math.pow(blob.cy - other.cy, 2)
        );
        return distance < 20;
      });

      if (overlapping) {
        let attempts = 0;
        let newCx = blob.cx;
        let newCy = blob.cy;

        while (attempts < 10) {
          newCx = Math.random() * 100;
          newCy = Math.random() * 100;

          const hasOverlap = newBlobLayers.some((other, otherIndex) => {
            if (index === otherIndex) return false;
            const distance = Math.sqrt(
              Math.pow(newCx - other.cx, 2) + Math.pow(newCy - other.cy, 2)
            );
            return distance < 20;
          });

          if (!hasOverlap) break;
          attempts++;
        }

        return { ...blob, cx: newCx, cy: newCy };
      }

      return blob;
    });

    // Adjust zIndex for non-blob layers
    const adjustedNonBlobLayers = nonBlobLayers.map((layer, i) => ({
      ...layer,
      zIndex: INITIAL_COLORS.length + i,
    }));

    // Also reset text color in text layers
    const resetTextLayers = adjustedNonBlobLayers.map((layer) => {
      if (layer.type === "text") {
        return { ...layer, textColor: "#f1f1f1" };
      }
      return layer;
    });

    const newLayers = [...repositionedBlobLayers, ...resetTextLayers];

    set({
      textColor: "#f1f1f1",
      backgroundColor: "#001220",
      layers: newLayers,
      circles: layersToCircles(newLayers),
      numCircles: INITIAL_COLORS.length,
    });
  },
}));
