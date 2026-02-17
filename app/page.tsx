"use client";
import DesktopApp from "@/components/core-ui/desktop-app";
import MobileApp from "@/components/core-ui/mobile-app";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { FONTS } from "@/lib/constants";
import { useWallpaperStore } from "@/store/wallpaper";
import { useSafariCheck } from "@/hooks/use-safari-check";

export default function Home() {
  const [isMobile, setIsMobile] = useState(false);
  const { isSafari, shouldShowPWAPrompt, dismissPWAPrompt } = useSafariCheck();
  const store = useWallpaperStore();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // 768px is Tailwind's md breakpoint
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const currentFont = FONTS.find((f) => f.name === store.fontFamily);
    if (!currentFont?.variable) {
      const availableWeights = currentFont?.weights || [];
      const closestWeight = availableWeights.reduce((prev, curr) =>
        Math.abs(curr - store.fontWeight) < Math.abs(prev - store.fontWeight)
          ? curr
          : prev
      );
      store.setFontWeight(closestWeight);
    }
  }, [store.fontFamily]);

  useEffect(() => {
    if (shouldShowPWAPrompt) {
      toast("Install our app for the best experience", {
        description: "Tap the share button and select 'Add to Home Screen'",
        duration: Infinity,
        closeButton: true,
        onDismiss: dismissPWAPrompt,
      });
    }
  }, [shouldShowPWAPrompt]);

  const downloadImage = async () => {
    try {
      const previewCanvas = document.querySelector(
        "#wallpaper canvas"
      ) as HTMLCanvasElement;
      if (!previewCanvas) return;

      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = store.resolution.width;
      tempCanvas.height = store.resolution.height;
      const ctx = tempCanvas.getContext("2d")!;

      // Draw the preview canvas
      ctx.drawImage(
        previewCanvas,
        0,
        0,
        store.resolution.width,
        store.resolution.height
      );

      // Draw the text
      if (store.sizeMode === "text") {
        ctx.save();

        // Set font properties
        const fontString = `${store.isItalic ? "italic" : ""} ${
          store.fontWeight
        } ${store.fontSize * 16}px ${store.fontFamily}`;
        ctx.font = fontString;
        ctx.fillStyle = store.textColor;
        ctx.textAlign = store.textAlign as CanvasTextAlign;
        ctx.textBaseline = "middle";
        ctx.globalAlpha = store.opacity / 100;

        // Set text decorations
        if (store.textShadow.blur > 0) {
          ctx.shadowColor = store.textShadow.color;
          ctx.shadowBlur = store.textShadow.blur;
          ctx.shadowOffsetX = store.textShadow.offsetX;
          ctx.shadowOffsetY = store.textShadow.offsetY;
        }

        // Calculate text position
        let x = store.resolution.width / 2 + store.textPosition.x;
        if (store.textAlign === "left") {
          x = 20 + store.textPosition.x;
        } else if (store.textAlign === "right") {
          x = store.resolution.width - 20 + store.textPosition.x;
        }

        // Handle multiline text
        const lines = store.text.split("\n");
        const lineHeight = store.fontSize * 16 * store.lineHeight;
        const totalHeight = lines.length * lineHeight;
        const startY =
          store.resolution.height / 2 - totalHeight / 2 + store.textPosition.y;

        lines.forEach((line, index) => {
          const y = startY + index * lineHeight + lineHeight / 2;
          ctx.fillText(line, x, y);

          // Draw text decorations
          if (store.isUnderline || store.isStrikethrough) {
            const textMetrics = ctx.measureText(line);
            const textWidth = textMetrics.width;
            let decorationY = y;

            if (store.isUnderline) {
              decorationY = y + textMetrics.actualBoundingBoxDescent + 2;
            }
            if (store.isStrikethrough) {
              decorationY = y;
            }

            let startX = x;
            if (store.textAlign === "center") {
              startX = x - textWidth / 2;
            } else if (store.textAlign === "right") {
              startX = x - textWidth;
            }

            ctx.beginPath();
            ctx.strokeStyle = store.textColor;
            ctx.lineWidth = Math.max(1, store.fontSize * 0.05);
            ctx.moveTo(startX, decorationY);
            ctx.lineTo(startX + textWidth, decorationY);
            ctx.stroke();
          }
        });

        ctx.restore();
      }

      if (store.sizeMode === "image" && store.logoImage) {
        const img = new Image();
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = store.logoImage as string;
        });

        const maxWidth = store.resolution.width * 0.5;
        const maxHeight = store.resolution.height * 0.5;
        const scale = Math.min(maxWidth / img.width, maxHeight / img.height);
        const width = img.width * scale;
        const height = img.height * scale;

        ctx.save();
        ctx.globalAlpha = store.opacity / 100;
        ctx.filter = `drop-shadow(${store.textShadow.offsetX}px ${store.textShadow.offsetY}px ${store.textShadow.blur}px ${store.textShadow.color})`;
        ctx.drawImage(
          img,
          store.resolution.width / 2 - width / 2 + store.textPosition.x,
          store.resolution.height / 2 - height / 2 + store.textPosition.y,
          width,
          height
        );
        ctx.restore();
      }

      // Handle download based on browser
      if (isSafari) {
        const dataUrl = tempCanvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = `gradii-${store.resolution.width}x${store.resolution.height}.png`;
        link.click();
      } else {
        const blob = await new Promise<Blob>((resolve) =>
          tempCanvas.toBlob((blob) => resolve(blob!), "image/png")
        );
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `gradii-${store.resolution.width}x${store.resolution.height}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }

      toast.success("Download will start shortly");
    } catch (err) {
      console.error(err);
      toast.error("Failed to download image");
    }
  };

  const copyImage = async () => {
    try {
      const previewCanvas = document.querySelector(
        "#wallpaper canvas"
      ) as HTMLCanvasElement;
      if (!previewCanvas) return;

      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = store.resolution.width;
      tempCanvas.height = store.resolution.height;
      const ctx = tempCanvas.getContext("2d")!;

      // Draw the preview canvas
      ctx.drawImage(
        previewCanvas,
        0,
        0,
        store.resolution.width,
        store.resolution.height
      );

      // Handle text/logo drawing same as download
      if (store.sizeMode === "text") {
        ctx.save();

        // Set font properties
        const fontString = `${store.isItalic ? "italic" : ""} ${
          store.fontWeight
        } ${store.fontSize * 16}px ${store.fontFamily}`;
        ctx.font = fontString;
        ctx.fillStyle = store.textColor;
        ctx.textAlign = store.textAlign as CanvasTextAlign;
        ctx.textBaseline = "middle";
        ctx.globalAlpha = store.opacity / 100;

        // Set text decorations
        if (store.textShadow.blur > 0) {
          ctx.shadowColor = store.textShadow.color;
          ctx.shadowBlur = store.textShadow.blur;
          ctx.shadowOffsetX = store.textShadow.offsetX;
          ctx.shadowOffsetY = store.textShadow.offsetY;
        }

        // Calculate text position
        let x = store.resolution.width / 2 + store.textPosition.x;
        if (store.textAlign === "left") {
          x = 20 + store.textPosition.x;
        } else if (store.textAlign === "right") {
          x = store.resolution.width - 20 + store.textPosition.x;
        }

        // Handle multiline text
        const lines = store.text.split("\n");
        const lineHeight = store.fontSize * 16 * store.lineHeight;
        const totalHeight = lines.length * lineHeight;
        const startY =
          store.resolution.height / 2 - totalHeight / 2 + store.textPosition.y;

        lines.forEach((line, index) => {
          const y = startY + index * lineHeight + lineHeight / 2;
          ctx.fillText(line, x, y);

          // Draw text decorations
          if (store.isUnderline || store.isStrikethrough) {
            const textMetrics = ctx.measureText(line);
            const textWidth = textMetrics.width;
            let decorationY = y;

            if (store.isUnderline) {
              decorationY = y + textMetrics.actualBoundingBoxDescent + 2;
            }
            if (store.isStrikethrough) {
              decorationY = y;
            }

            let startX = x;
            if (store.textAlign === "center") {
              startX = x - textWidth / 2;
            } else if (store.textAlign === "right") {
              startX = x - textWidth;
            }

            ctx.beginPath();
            ctx.strokeStyle = store.textColor;
            ctx.lineWidth = Math.max(1, store.fontSize * 0.05);
            ctx.moveTo(startX, decorationY);
            ctx.lineTo(startX + textWidth, decorationY);
            ctx.stroke();
          }
        });

        ctx.restore();
      }

      if (store.sizeMode === "image" && store.logoImage) {
        const img = new Image();
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = store.logoImage as string;
        });

        const maxWidth = (store.resolution.width * store.fontSize) / 100; // Convert percentage to pixels
        const maxHeight = (store.resolution.height * store.fontSize) / 100;
        const scale = Math.min(maxWidth / img.width, maxHeight / img.height);
        const width = img.width * scale;
        const height = img.height * scale;

        ctx.save();
        ctx.globalAlpha = store.opacity / 100;
        ctx.filter = `drop-shadow(${store.textShadow.offsetX}px ${store.textShadow.offsetY}px ${store.textShadow.blur}px ${store.textShadow.color})`;
        ctx.drawImage(
          img,
          store.resolution.width / 2 - width / 2 + store.textPosition.x,
          store.resolution.height / 2 - height / 2 + store.textPosition.y,
          width,
          height
        );
        ctx.restore();
      }

      // Convert to blob and copy
      try {
        // Try modern Clipboard API first
        const blob = await new Promise<Blob>((resolve) =>
          tempCanvas.toBlob((blob) => resolve(blob!), "image/png")
        );
        await navigator.clipboard.write([
          new ClipboardItem({
            "image/png": blob,
          }),
        ]);
      } catch (e) {
        console.error(e);
        // Fallback for Safari
        const dataUrl = tempCanvas.toDataURL("image/png");
        const textArea = document.createElement("textarea");
        textArea.value = dataUrl;
        document.body.appendChild(textArea);
        textArea.select();
        try {
          document.execCommand("copy");
          document.body.removeChild(textArea);
        } catch (err) {
          document.body.removeChild(textArea);
          console.error(err);
          throw new Error("Failed to copy to clipboard");
        }
      }

      toast.success("Image copied to clipboard");
    } catch (err) {
      console.error(err);
      toast.error("Failed to copy image");
    }
  };

  const handleColorChange = (color: string) => {
    switch (store.activeColorType) {
      case "text":
        store.setTextColor(color);
        break;
      case "background":
        store.setBackgroundColor(color);
        break;
      case "gradient":
        if (store.activeColor !== null) {
          store.updateColor(color, store.activeColor);
        }
        break;
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (e.g., 10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image must be smaller than 10MB");
      return;
    }

    // Check file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    const reader = new FileReader();

    reader.onerror = () => {
      toast.error("Failed to read image file");
    };

    reader.onloadend = () => {
      const loadPromise = new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          store.backgroundImage = reader.result as string;
          resolve(true);
        };
        img.onerror = reject;
        img.src = reader.result as string;
      });

      toast.promise(loadPromise, {
        loading: "Loading image...",
        success: "Image uploaded successfully",
        error: "Failed to load image",
      });
    };

    reader.readAsDataURL(file);
  };

  const handlePaletteChange = () => {
    const generateHarmonious = () => {
      // Color schemes with more variety
      const schemes = [
        { hueStep: 30, count: Math.floor(Math.random() * 6) + 3 }, // Analogous
        { hueStep: 120, count: Math.floor(Math.random() * 4) + 3 }, // Triadic
        { hueStep: 180, count: Math.floor(Math.random() * 4) + 2 }, // Split complementary
        { hueStep: 60, count: Math.floor(Math.random() * 6) + 3 }, // Hexadic
        { hueStep: 90, count: Math.floor(Math.random() * 4) + 3 }, // Square
        { hueStep: 45, count: Math.floor(Math.random() * 5) + 3 }, // Custom angle
      ];

      const scheme = schemes[Math.floor(Math.random() * schemes.length)];
      const baseHue = Math.random() * 360;

      // Enhanced saturation and lightness ranges
      const satRanges = [
        { min: 70, max: 90 }, // Vibrant
        { min: 40, max: 60 }, // Muted
        { min: 85, max: 100 }, // Super saturated
        { min: 55, max: 75 }, // Balanced
      ];

      const lightRanges = [
        { min: 40, max: 60 }, // Medium
        { min: 60, max: 80 }, // Light
        { min: 20, max: 40 }, // Dark
        { min: 30, max: 70 }, // Wide range
      ];

      // Generate background color with contrasting settings
      const bgHue = (baseHue + 180) % 360;
      const bgSat = 20 + Math.random() * 40;
      const bgLight =
        Math.random() > 0.5
          ? 10 + Math.random() * 20 // Dark background
          : 80 + Math.random() * 15; // Light background

      // Set background color
      const backgroundColor = hslToHex(bgHue, bgSat, bgLight);
      store.setBackgroundColor(backgroundColor);

      // Text color: pure white or black based on background, with slight variation
      const textLight =
        bgLight < 50
          ? 95 + Math.random() * 5 // Almost white for dark backgrounds (95-100%)
          : Math.random() * 5; // Almost black for light backgrounds (0-5%)

      const textColor = hslToHex(0, 0, textLight); // Hue and saturation 0 for pure grayscale
      store.setTextColor(textColor);

      // Glow: slightly less extreme than text for subtle effect
      const glowLight =
        bgLight < 50
          ? textLight - (10 + Math.random() * 15) // Slightly darker than white text
          : textLight + (10 + Math.random() * 15); // Slightly lighter than black text

      store.setTextShadow({
        color: hslToHex(0, 0, glowLight), // Pure grayscale glow
        blur: store.textShadow.blur, // Smaller blur range for subtlety
        offsetX: store.textShadow.offsetX,
        offsetY: store.textShadow.offsetY,
      });

      const satRange = satRanges[Math.floor(Math.random() * satRanges.length)];
      const lightRange =
        lightRanges[Math.floor(Math.random() * lightRanges.length)];

      // Generate base colors from the scheme
      const baseColors = Array.from({ length: scheme.count }, (_, i) => {
        const hue = (baseHue + i * scheme.hueStep) % 360;
        const sat =
          satRange.min + Math.random() * (satRange.max - satRange.min);
        const light =
          lightRange.min + Math.random() * (lightRange.max - lightRange.min);
        return { h: hue, s: sat, l: light };
      });

      // Add variations with more diverse modifications
      const colors = baseColors.flatMap((base) => {
        const variations = [base];

        // Random chance for additional variations
        if (Math.random() > 0.3) {
          variations.push({
            h: (base.h + 15 - Math.random() * 30) % 360, // Slight hue shift
            s: Math.max(20, Math.min(100, base.s + (Math.random() * 30 - 15))),
            l: Math.max(10, Math.min(90, base.l + (Math.random() * 40 - 20))),
          });
        }
        return variations;
      });

      // Convert HSL to Hex
      return colors.map(({ h, s, l }) => hslToHex(h, s, l));
    };

    // Helper function to convert HSL to Hex
    const hslToHex = (h: number, s: number, l: number) => {
      const hue = h / 360;
      const sat = s / 100;
      const light = l / 100;

      const c = (1 - Math.abs(2 * light - 1)) * sat;
      const x = c * (1 - Math.abs(((hue * 6) % 2) - 1));
      const m = light - c / 2;

      let r, g, b;
      if (hue < 1 / 6) [r, g, b] = [c, x, 0];
      else if (hue < 2 / 6) [r, g, b] = [x, c, 0];
      else if (hue < 3 / 6) [r, g, b] = [0, c, x];
      else if (hue < 4 / 6) [r, g, b] = [0, x, c];
      else if (hue < 5 / 6) [r, g, b] = [x, 0, c];
      else [r, g, b] = [c, 0, x];

      const toHex = (n: number) => {
        const hex = Math.round((n + m) * 255).toString(16);
        return hex.length === 1 ? "0" + hex : hex;
      };

      return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    };

    const newColors = generateHarmonious();
    store.setCircles(
      newColors.map((color, i) => ({
        id: store.circles[i]?.id ?? `blob-${i + 1}`,
        name: store.circles[i]?.name ?? `Blob ${i + 1}`,
        color,
        cx: store.circles[i]?.cx ?? Math.random() * 100,
        cy: store.circles[i]?.cy ?? Math.random() * 100,
        r: store.circles[i]?.r ?? 22,
        visible: store.circles[i]?.visible ?? true,
        locked: store.circles[i]?.locked ?? false,
      }))
    );
  };

  const AppComponent = isMobile ? MobileApp : DesktopApp;

  return (
    <AppComponent
      {...store}
      fonts={FONTS}
      isSafari={isSafari}
      downloadImage={downloadImage}
      copyImage={copyImage}
      handleColorChange={handleColorChange}
      handleImageUpload={handleImageUpload}
      handlePaletteChange={handlePaletteChange}
    />
  );
}
