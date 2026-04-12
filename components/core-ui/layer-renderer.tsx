import { useRef, useEffect, useCallback } from "react";
import { TextLayer, ImageLayer } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface LayerRendererProps {
  layer: TextLayer | ImageLayer;
  isSelected: boolean;
  isEditing: boolean;
  onSelect: () => void;
  onStartEdit: () => void;
  onEndEdit: () => void;
  onDrag: (position: { x: number; y: number }) => void;
  onTextChange?: (text: string) => void;
  zoom: number;
}

export function LayerRenderer({
  layer,
  isSelected,
  isEditing,
  onSelect,
  onStartEdit,
  onEndEdit,
  onDrag,
  onTextChange,
  zoom,
}: LayerRendererProps) {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const elementRef = useRef<HTMLDivElement>(null);

  // Auto-focus when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  // Handle drag
  const handleDragStart = useCallback(
    (event: React.PointerEvent) => {
      if (layer.locked || isEditing) return;
      event.preventDefault();
      event.stopPropagation();

      const startPointer = { x: event.clientX, y: event.clientY };
      const startPosition = { ...layer.position };

      const onMove = (moveEvent: PointerEvent) => {
        moveEvent.preventDefault();
        onDrag({
          x: startPosition.x + (moveEvent.clientX - startPointer.x) / zoom,
          y: startPosition.y + (moveEvent.clientY - startPointer.y) / zoom,
        });
      };

      const onUp = () => {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
      };

      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
    },
    [layer.locked, layer.position, isEditing, onDrag, zoom]
  );

  // Handle click to select
  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!isSelected) {
        onSelect();
      }
    },
    [isSelected, onSelect]
  );

  // Handle double-click to edit (text only)
  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (layer.type === "text" && !layer.locked) {
        onStartEdit();
      }
    },
    [layer.type, layer.locked, onStartEdit]
  );

  // Handle keyboard in edit mode
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        onEndEdit();
      }
      // Enter creates new line (default textarea behavior)
      // No need to handle separately
    },
    [onEndEdit]
  );

  // Handle blur to end edit mode
  const handleBlur = useCallback(() => {
    onEndEdit();
  }, [onEndEdit]);

  if (layer.type === "text") {
    const textLayer = layer as TextLayer;
    const textStyles: React.CSSProperties = {
      fontSize: `${textLayer.fontSize}em`,
      fontWeight: textLayer.fontWeight,
      letterSpacing: `${textLayer.letterSpacing}em`,
      fontFamily: textLayer.fontFamily,
      opacity: textLayer.opacity / 100,
      lineHeight: textLayer.lineHeight,
      color: textLayer.textColor,
      fontStyle: textLayer.isItalic ? "italic" : "normal",
      textDecoration: `${textLayer.isUnderline ? "underline" : ""} ${
        textLayer.isStrikethrough ? "line-through" : ""
      }`.trim() || "none",
      textShadow: `${textLayer.shadow.offsetX}px ${textLayer.shadow.offsetY}px ${textLayer.shadow.blur}px ${textLayer.shadow.color}`,
      transform: `translate(${textLayer.position.x}px, ${textLayer.position.y}px)`,
      whiteSpace: "pre-wrap",
      textAlign: textLayer.textAlign,
      cursor: textLayer.locked ? "not-allowed" : isEditing ? "text" : "grab",
      userSelect: isEditing ? "text" : "none",
    };

    return (
      <div
        ref={elementRef}
        className={cn(
          "absolute transition-all duration-200",
          isSelected && !isEditing && "ring-2 ring-white/40 ring-offset-2 ring-offset-transparent rounded-lg"
        )}
        style={{
          left: "50%",
          top: "50%",
          transform: `translate(-50%, -50%) translate(${textLayer.position.x}px, ${textLayer.position.y}px)`,
          pointerEvents: layer.visible ? "auto" : "none",
          visibility: layer.visible ? "visible" : "hidden",
        }}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        onPointerDown={!isEditing ? handleDragStart : undefined}
      >
        {isEditing ? (
          <textarea
            ref={inputRef}
            value={textLayer.content}
            onChange={(e) => onTextChange?.(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            style={{
              ...textStyles,
              background: "transparent",
              border: "2px solid rgba(255,255,255,0.5)",
              borderRadius: "4px",
              outline: "none",
              resize: "none",
              minWidth: "100px",
              minHeight: "1.2em",
              padding: "4px 8px",
              transform: "none",
            }}
            className="transition-none"
            autoFocus
          />
        ) : (
          <p
            style={{
              ...textStyles,
              transform: "none",
              padding: isSelected ? "4px 8px" : "0",
              margin: 0,
            }}
            className="transition-all duration-300 ease-[cubic-bezier(0.45,0.05,0.55,0.95)]"
          >
            {textLayer.content || "Double-click to edit"}
          </p>
        )}
      </div>
    );
  }

  if (layer.type === "image") {
    const imageLayer = layer as ImageLayer;
    // Calculate actual pixel dimensions based on scale percentage
    // Scale represents percentage of a reasonable base size (e.g., 50% = half of 800px base = 400px)
    const baseSize = 800;
    const scaledWidth = baseSize * (imageLayer.scale / 100);

    return (
      <div
        ref={elementRef}
        className={cn(
          "absolute transition-all duration-200",
          isSelected && "ring-2 ring-white/40 ring-offset-2 ring-offset-transparent rounded-lg"
        )}
        style={{
          left: "50%",
          top: "50%",
          transform: `translate(-50%, -50%) translate(${imageLayer.position.x}px, ${imageLayer.position.y}px)`,
          pointerEvents: layer.visible ? "auto" : "none",
          visibility: layer.visible ? "visible" : "hidden",
        }}
        onClick={handleClick}
        onPointerDown={handleDragStart}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageLayer.imageData}
          alt={imageLayer.name}
          style={{
            width: `${scaledWidth}px`,
            height: "auto",
            opacity: imageLayer.opacity / 100,
            filter: `drop-shadow(${imageLayer.shadow.offsetX}px ${imageLayer.shadow.offsetY}px ${imageLayer.shadow.blur}px ${imageLayer.shadow.color})`,
            cursor: imageLayer.locked ? "not-allowed" : "grab",
            userSelect: "none",
          }}
          className="transition-all duration-300 ease-[cubic-bezier(0.45,0.05,0.55,0.95)]"
          draggable={false}
        />
      </div>
    );
  }

  return null;
}
