import { useEffect, useRef, useCallback, useMemo } from "react";

import { generateRandomShape } from "@/lib/utils/shapes";
import "context-filter-polyfill";
import { debounce } from "@/lib/utils";
import { applyGrainEffect } from "@/lib/utils/effects";
import { drawShape } from "@/lib/utils/shapes";
import { useWallpaperStore } from "@/store/wallpaper";

export function CanvasPreview() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const backgroundLayerRef = useRef<HTMLCanvasElement | null>(null);
  const store = useWallpaperStore();

  const debouncedCompositeCanvas = useMemo(
    () => debounce((fn: () => void) => fn(), 16), // ~60fps
    []
  );

  const savedValues = useMemo(
    () => ({
      // Filters
      blur: store.blur,
      brightness: store.brightness,
      contrast: store.contrast,
      saturation: store.saturation,

      // Colors and Background
      backgroundColor: store.backgroundColor,
      backgroundImage: store.backgroundImage,
      circles: store.circles,

      // Text Properties
      text: store.text,
      fontSize: store.fontSize,
      fontWeight: store.fontWeight,
      letterSpacing: store.letterSpacing,
      opacity: store.opacity,
      fontFamily: store.fontFamily,
      lineHeight: store.lineHeight,
      textColor: store.textColor,
      isItalic: store.isItalic,
      isUnderline: store.isUnderline,
      isStrikethrough: store.isStrikethrough,

      // Effects
      grainIntensity: store.grainIntensity,
      textShadow: store.textShadow,

      // Position and Mode
      textPosition: store.textPosition,
      sizeMode: store.sizeMode,
      logoImage: store.logoImage,

      // Resolution
      resolution: store.resolution,

      // Text Alignment
      textAlign: store.textAlign,
    }),
    [
      store.blur,
      store.brightness,
      store.contrast,
      store.saturation,
      store.backgroundColor,
      store.backgroundImage,
      store.circles,
      store.text,
      store.fontSize,
      store.fontWeight,
      store.letterSpacing,
      store.opacity,
      store.fontFamily,
      store.lineHeight,
      store.textColor,
      store.isItalic,
      store.isUnderline,
      store.isStrikethrough,
      store.grainIntensity,
      store.textShadow,
      store.textPosition,
      store.sizeMode,
      store.logoImage,
      store.resolution,
      store.textAlign,
    ]
  );

  const effectiveValues = savedValues;

  // Initialize canvases once
  useEffect(() => {
    if (!offscreenCanvasRef.current) {
      offscreenCanvasRef.current = document.createElement("canvas");
      backgroundLayerRef.current = document.createElement("canvas");
    }

    [offscreenCanvasRef, backgroundLayerRef].forEach((ref) => {
      if (ref.current) {
        ref.current.width = effectiveValues.resolution.width;
        ref.current.height = effectiveValues.resolution.height;
      }
    });
  }, [effectiveValues.resolution.width, effectiveValues.resolution.height]);

  // Handle background and shapes
  useEffect(() => {
    if (!backgroundLayerRef.current) return;
    const ctx = backgroundLayerRef.current.getContext("2d")!;

    ctx.clearRect(
      0,
      0,
      effectiveValues.resolution.width,
      effectiveValues.resolution.height
    );
    ctx.fillStyle = effectiveValues.backgroundColor;
    ctx.fillRect(
      0,
      0,
      effectiveValues.resolution.width,
      effectiveValues.resolution.height
    );

    if (effectiveValues.backgroundImage) {
      const img = new Image();
      img.src = effectiveValues.backgroundImage;
      img.onload = () => {
        // Draw the image at its actual size to fill the canvas completely
        // Since we're now setting canvas resolution to match image dimensions,
        // we can simply draw the image to fill the entire canvas
        ctx.drawImage(
          img, 
          0, 
          0, 
          effectiveValues.resolution.width, 
          effectiveValues.resolution.height
        );
        debouncedCompositeCanvas(compositeCanvas);
      };
    } else {
      effectiveValues.circles.forEach((circle) => {
        const shape = generateRandomShape(circle.color);
        drawShape(ctx, shape, circle);
      });
      debouncedCompositeCanvas(compositeCanvas);
    }
  }, [
    effectiveValues.backgroundColor,
    effectiveValues.circles,
    effectiveValues.backgroundImage,
    effectiveValues.resolution.width,
    effectiveValues.resolution.height,
  ]);

  // Handle filters
  useEffect(() => {
    debouncedCompositeCanvas(compositeCanvas);
  }, [
    effectiveValues.blur,
    effectiveValues.brightness,
    effectiveValues.contrast,
    effectiveValues.saturation,
  ]);

  const compositeCanvas = useCallback(() => {
    if (!canvasRef.current || !backgroundLayerRef.current) return;

    const ctx = canvasRef.current.getContext("2d", {
      alpha: true,
      willReadFrequently: false,
    })!;

    // Clear main canvas
    ctx.clearRect(
      0,
      0,
      effectiveValues.resolution.width,
      effectiveValues.resolution.height
    );

    // 1. Draw solid background color first (no filters)
    ctx.fillStyle = effectiveValues.backgroundColor;
    ctx.fillRect(
      0,
      0,
      effectiveValues.resolution.width,
      effectiveValues.resolution.height
    );

    // 2. Draw shapes/gradients with filters
    const cssFilters = [
      effectiveValues.blur > 0 ? `blur(${effectiveValues.blur / 4}px)` : "",
      `brightness(${effectiveValues.brightness}%)`,
      `contrast(${effectiveValues.contrast}%)`,
      `saturate(${effectiveValues.saturation}%)`,
    ]
      .filter(Boolean)
      .join(" ");

    ctx.filter = cssFilters;
    ctx.drawImage(backgroundLayerRef.current, 0, 0);

    // 3. Apply film grain
    if (effectiveValues.grainIntensity > 0) {
      applyGrainEffect(ctx, effectiveValues.grainIntensity / 100);
    }
  }, [
    effectiveValues.blur,
    effectiveValues.brightness,
    effectiveValues.contrast,
    effectiveValues.saturation,
    effectiveValues.resolution.width,
    effectiveValues.resolution.height,
    effectiveValues.backgroundColor,
    effectiveValues.grainIntensity,
  ]);

  return (
    <canvas
      id="wallpaper"
      className="transition-all duration-300 ease-[cubic-bezier(0.45, 0.05, 0.55, 0.95)]"
      ref={canvasRef}
      width={effectiveValues.resolution.width}
      height={effectiveValues.resolution.height}
      style={{
        width: "100%",
        height: "100%",
        objectFit: "contain",
        transform: "translate3d(0,0,0)",
        backfaceVisibility: "hidden",
        WebkitBackfaceVisibility: "hidden",
        imageRendering: "-webkit-optimize-contrast",
        willChange: "transform",
      }}
    />
  );
}
