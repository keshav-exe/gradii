import { CircleProps } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { PointerEvent as ReactPointerEvent } from "react";
import { useEffect, useRef } from "react";

interface BlobCanvasControlsProps {
  circles: CircleProps[];
  setCircles: (circles: CircleProps[]) => void;
  selectedBlobIndex: number | null;
  onSelectBlob: (index: number | null) => void;
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

export function BlobCanvasControls({
  circles,
  setCircles,
  selectedBlobIndex,
  onSelectBlob,
}: BlobCanvasControlsProps) {
  const circlesRef = useRef(circles);

  useEffect(() => {
    circlesRef.current = circles;
  }, [circles]);

  const updateBlobPosition = (index: number, clientX: number, clientY: number) => {
    const currentCircles = circlesRef.current;
    if (currentCircles[index]?.locked) return;
    const canvas = document.getElementById("wallpaper");
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const cx = clamp(((clientX - rect.left) / rect.width) * 100, 0, 100);
    const cy = clamp(((clientY - rect.top) / rect.height) * 100, 0, 100);

    setCircles(
      currentCircles.map((circle, i) =>
        i === index ? { ...circle, cx, cy } : circle
      )
    );
  };

  const startDrag = (
    index: number,
    event: ReactPointerEvent<HTMLDivElement>
  ) => {
    event.preventDefault();
    event.stopPropagation();
    onSelectBlob(index);

    let rafId: number | null = null;
    let lastPoint: { x: number; y: number } | null = null;

    const onMove = (moveEvent: PointerEvent) => {
      moveEvent.preventDefault();
      lastPoint = { x: moveEvent.clientX, y: moveEvent.clientY };

      if (rafId !== null) return;
      rafId = window.requestAnimationFrame(() => {
        if (lastPoint) {
          updateBlobPosition(index, lastPoint.x, lastPoint.y);
        }
        rafId = null;
      });
    };

    const onUp = () => {
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
        rafId = null;
      }
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  return (
    <div className="absolute inset-0 z-50 pointer-events-none">
      {circles.map((circle, index) => {
        if (circle.visible === false) return null;

        const isSelected = selectedBlobIndex === index;
        const isLocked = circle.locked ?? false;

        return (
          <div
            key={circle.id ?? `${index}-${circle.color}`}
            className="absolute"
            style={{
              left: `${circle.cx}%`,
              top: `${circle.cy}%`,
            }}
          >
            <div
              role="button"
              tabIndex={0}
              aria-label={`Move blob ${index + 1}`}
              className={cn(
                "pointer-events-auto relative -translate-x-1/2 -translate-y-1/2 rounded-full cursor-grab active:cursor-grabbing",
                isSelected
                  ? "bg-primary shadow-[0_0_0_3px_hsl(var(--background)),0_0_0_5px_hsl(var(--primary)/0.45)]"
                  : "bg-primary/85",
                isLocked && "opacity-50"
              )}
              style={{
                width: 14,
                height: 14,
              }}
              onPointerDown={(event) => {
                if (isLocked) return;
                startDrag(index, event);
              }}
              onClick={(event) => {
                event.stopPropagation();
                onSelectBlob(index);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onSelectBlob(index);
                }
              }}
            />
          </div>
        );
      })}
    </div>
  );
}
