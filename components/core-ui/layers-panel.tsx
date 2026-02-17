import { CircleProps } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  EyeIcon,
  EyeOffIcon,
  ImageIcon,
  LockIcon,
  TypeIcon,
  UnlockIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface LayersPanelProps {
  circles: CircleProps[];
  setCircles: (circles: CircleProps[]) => void;
  selectedBlobIndex: number | null;
  onSelectBlob: (index: number | null) => void;
  foregroundVisible: boolean;
  setForegroundVisible: (visible: boolean) => void;
  foregroundLocked: boolean;
  setForegroundLocked: (locked: boolean) => void;
  sizeMode: "text" | "image";
}

export function LayersPanel({
  circles,
  setCircles,
  selectedBlobIndex,
  onSelectBlob,
  foregroundVisible,
  setForegroundVisible,
  foregroundLocked,
  setForegroundLocked,
  sizeMode,
}: LayersPanelProps) {
  const moveBlob = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index + 1 : index - 1;
    if (targetIndex < 0 || targetIndex >= circles.length) return;

    const next = [...circles];
    [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
    setCircles(next);
    if (selectedBlobIndex === index) onSelectBlob(targetIndex);
    if (selectedBlobIndex === targetIndex) onSelectBlob(index);
  };

  const toggleBlobVisible = (index: number) => {
    setCircles(
      circles.map((circle, i) =>
        i === index ? { ...circle, visible: !(circle.visible ?? true) } : circle
      )
    );
  };

  const toggleBlobLock = (index: number) => {
    setCircles(
      circles.map((circle, i) =>
        i === index ? { ...circle, locked: !(circle.locked ?? false) } : circle
      )
    );
  };

  const orderedLayers = [...circles].map((circle, index) => ({ circle, index })).reverse();

  return (
    <div className="flex flex-col gap-2">
      <div className="rounded-xl border border-primary/10 p-2 bg-foreground/5">
        <div className="flex items-center justify-between gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setForegroundVisible(!foregroundVisible)}
          >
            {foregroundVisible ? (
              <EyeIcon className="size-4" />
            ) : (
              <EyeOffIcon className="size-4" />
            )}
          </Button>
          <button
            className="flex-1 text-left text-sm"
            onClick={() => onSelectBlob(null)}
          >
            <span className="inline-flex items-center gap-2">
              {sizeMode === "text" ? (
                <TypeIcon className="size-4" />
              ) : (
                <ImageIcon className="size-4" />
              )}
              {sizeMode === "text" ? "Text Layer" : "Image Layer"}
            </span>
          </button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setForegroundLocked(!foregroundLocked)}
          >
            {foregroundLocked ? (
              <LockIcon className="size-4" />
            ) : (
              <UnlockIcon className="size-4" />
            )}
          </Button>
        </div>
      </div>

      {orderedLayers.map(({ circle, index }) => {
        const visible = circle.visible ?? true;
        const locked = circle.locked ?? false;
        const selected = selectedBlobIndex === index;

        return (
          <div
            key={circle.id ?? `blob-layer-${index}`}
            className={cn(
              "rounded-xl border p-2 bg-foreground/5",
              selected ? "border-primary/40" : "border-primary/10"
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => toggleBlobVisible(index)}
              >
                {visible ? (
                  <EyeIcon className="size-4" />
                ) : (
                  <EyeOffIcon className="size-4" />
                )}
              </Button>
              <button
                className="flex-1 text-left text-sm"
                onClick={() => onSelectBlob(index)}
              >
                <span className="inline-flex items-center gap-2">
                  <span
                    className="size-3 rounded-full border border-primary/20"
                    style={{ backgroundColor: circle.color }}
                  />
                  {circle.name ?? `Blob ${index + 1}`}
                </span>
              </button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => toggleBlobLock(index)}
              >
                {locked ? (
                  <LockIcon className="size-4" />
                ) : (
                  <UnlockIcon className="size-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => moveBlob(index, "up")}
                disabled={index === circles.length - 1}
              >
                <ArrowUpIcon className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => moveBlob(index, "down")}
                disabled={index === 0}
              >
                <ArrowDownIcon className="size-4" />
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
