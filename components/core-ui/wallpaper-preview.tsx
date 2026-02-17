import { motion } from "framer-motion";
import { CircleProps } from "@/lib/constants";

interface WallpaperPreviewProps {
  width: number;
  height: number;
  backgroundColor: string;
  circles: CircleProps[];
  text: string;
  textStyle: {
    fontSize: number;
    fontWeight: number;
    letterSpacing: number;
    fontFamily: string;
    opacity: number;
    lineHeight: number;
    color: string;
    isItalic: boolean;
    isUnderline: boolean;
    isStrikethrough: boolean;
    textShadow: {
      color: string;
      blur: number;
      offsetX: number;
      offsetY: number;
    };
  };
  filters: {
    blur: number;
    brightness: number;
    contrast: number;
    saturation: number;
  };
  effects: {
    grain: number;
    vignette: number;
  };
  backgroundImage: string | null;
}

export function WallpaperPreview({
  width,
  height,
  backgroundColor,
  circles,
  text,
  textStyle,
  filters,
  effects,
  backgroundImage,
}: WallpaperPreviewProps) {
  return (
    <div
      style={{
        width,
        height,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Base Layer */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor,
          filter: `
            blur(${filters.blur / 4}px)
            brightness(${filters.brightness}%)
            contrast(${filters.contrast}%)
            saturate(${filters.saturation}%)
          `,
        }}
      />

      {/* Background Image */}
      {backgroundImage && (
        <motion.img
          src={backgroundImage}
          alt=""
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      )}

      {/* Shapes Layer */}
      <div style={{ position: "absolute", inset: 0 }}>
        {circles.map((circle, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{
              position: "absolute",
              left: `${circle.cx}%`,
              top: `${circle.cy}%`,
              width: `${(circle.r ?? 22) * 2}%`,
              height: `${(circle.r ?? 22) * 2}%`,
              transform: "translate(-50%, -50%)",
              backgroundColor: circle.color,
              borderRadius: "50%",
              filter: "blur(20px)",
              mixBlendMode: "overlay",
            }}
          />
        ))}
      </div>

      {/* Text Layer */}
      <motion.div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: textStyle.color,
          fontSize: textStyle.fontSize,
          fontWeight: textStyle.fontWeight,
          letterSpacing: textStyle.letterSpacing,
          fontFamily: textStyle.fontFamily,
          opacity: textStyle.opacity / 100,
          lineHeight: textStyle.lineHeight,
          fontStyle: textStyle.isItalic ? "italic" : "normal",
          textDecoration: `${textStyle.isUnderline ? "underline" : ""} ${
            textStyle.isStrikethrough ? "line-through" : ""
          }`,
          textShadow: `${textStyle.textShadow.offsetX}px ${textStyle.textShadow.offsetY}px ${textStyle.textShadow.blur}px ${textStyle.textShadow.color}`,
        }}
      >
        {text}
      </motion.div>

      {/* Effects Layer */}
      {effects.grain > 0 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: "url(/noise.png)",
            opacity: effects.grain / 100,
            mixBlendMode: "overlay",
          }}
        />
      )}

      {/* Vignette Effect */}
      {effects.vignette > 0 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `radial-gradient(
              circle at center,
              transparent 0%,
              rgba(0,0,0,${effects.vignette / 100}) 100%
            )`,
          }}
        />
      )}
    </div>
  );
}
