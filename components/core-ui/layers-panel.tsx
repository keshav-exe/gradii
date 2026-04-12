import { Layer, BlobLayer, TextLayer, ImageLayer } from "@/lib/constants";
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
  CircleIcon,
  PlusIcon,
  UploadIcon,
  Trash2Icon,
  MoreHorizontalIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { useRef, useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface LayersPanelProps {
  layers: Layer[];
  selectedLayerId: string | null;
  onSelectLayer: (id: string | null) => void;
  onUpdateLayer: <T extends Layer>(id: string, updates: Partial<T>) => void;
  onMoveLayer: (id: string, direction: "up" | "down") => void;
  onDeleteLayer: (id: string) => void;
  onAddBlobLayer: () => void;
  onAddTextLayer: () => void;
  onAddImageLayer: (imageData: string) => void;
}

export function LayersPanel({
  layers,
  selectedLayerId,
  onSelectLayer,
  onUpdateLayer,
  onMoveLayer,
  onDeleteLayer,
  onAddBlobLayer,
  onAddTextLayer,
  onAddImageLayer,
}: LayersPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [hoveredLayerId, setHoveredLayerId] = useState<string | null>(null);

  // Sort layers by zIndex (highest first for display)
  const sortedLayers = [...layers].sort((a, b) => b.zIndex - a.zIndex);

  const toggleLayerVisible = (id: string, currentVisible: boolean) => {
    onUpdateLayer(id, { visible: !currentVisible });
  };

  const toggleLayerLock = (id: string, currentLocked: boolean) => {
    onUpdateLayer(id, { locked: !currentLocked });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onAddImageLayer(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
    e.target.value = "";
  };

  const getLayerIcon = (layer: Layer) => {
    switch (layer.type) {
      case "blob":
        return (
          <span
            className="size-4 rounded-full border border-primary/20 shrink-0"
            style={{ backgroundColor: (layer as BlobLayer).color }}
          />
        );
      case "text":
        return <TypeIcon className="size-4 text-muted-foreground shrink-0" />;
      case "image":
        return <ImageIcon className="size-4 text-muted-foreground shrink-0" />;
      default:
        return <CircleIcon className="size-4 text-muted-foreground shrink-0" />;
    }
  };

  const getLayerTypeBadge = (type: string) => {
    const styles = {
      blob: "bg-purple-500/20 text-purple-300",
      text: "bg-blue-500/20 text-blue-300",
      image: "bg-green-500/20 text-green-300",
    };
    return styles[type as keyof typeof styles] || "bg-gray-500/20 text-gray-300";
  };

  const blobCount = layers.filter((l) => l.type === "blob").length;
  const canAddMoreBlobs = blobCount < 10;

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex flex-col gap-3">
        {/* Add Layer Buttons - Compact icon-only with tooltips */}
        <div className="flex items-center gap-1.5">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-8 rounded-lg bg-foreground/5 hover:bg-foreground/10"
                onClick={onAddBlobLayer}
                disabled={!canAddMoreBlobs}
              >
                <PlusIcon className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Add Blob {!canAddMoreBlobs && "(Max 10)"}</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-8 rounded-lg bg-foreground/5 hover:bg-foreground/10"
                onClick={onAddTextLayer}
              >
                <TypeIcon className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Add Text Layer</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-8 rounded-lg bg-foreground/5 hover:bg-foreground/10"
                onClick={() => fileInputRef.current?.click()}
              >
                <UploadIcon className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Add Image Layer</p>
            </TooltipContent>
          </Tooltip>

          <Input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />

          {/* Delete button - only show when layer selected */}
          {selectedLayerId && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 rounded-lg bg-destructive/10 hover:bg-destructive/20 text-destructive ml-auto"
                  onClick={() => {
                    onDeleteLayer(selectedLayerId);
                    onSelectLayer(null);
                  }}
                >
                  <Trash2Icon className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Delete Layer</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>

        {/* Layer List */}
        <div className="flex flex-col gap-1 max-h-[300px] overflow-y-auto no-scrollbar">
          {sortedLayers.map((layer) => {
            const isSelected = selectedLayerId === layer.id;
            const isHovered = hoveredLayerId === layer.id;
            const isFirst = sortedLayers.indexOf(layer) === 0;
            const isLast = sortedLayers.indexOf(layer) === sortedLayers.length - 1;

            return (
              <div
                key={layer.id}
                className={cn(
                  "group rounded-xl border p-2 transition-all duration-200 cursor-pointer",
                  isSelected
                    ? "border-primary/40 bg-primary/10"
                    : "border-transparent hover:border-primary/20 hover:bg-foreground/5"
                )}
                onMouseEnter={() => setHoveredLayerId(layer.id)}
                onMouseLeave={() => setHoveredLayerId(null)}
                onClick={() => onSelectLayer(layer.id)}
              >
                <div className="flex items-center gap-2">
                  {/* Layer Icon & Name */}
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {getLayerIcon(layer)}
                    <span className={cn(
                      "text-xs truncate",
                      !layer.visible && "text-muted-foreground/50"
                    )}>
                      {layer.name}
                    </span>
                    <span className={cn(
                      "text-[9px] px-1.5 py-0.5 rounded-full uppercase font-medium shrink-0",
                      getLayerTypeBadge(layer.type)
                    )}>
                      {layer.type}
                    </span>
                  </div>

                  {/* Quick Actions - Always visible for selected, on hover for others */}
                  <div className={cn(
                    "flex items-center gap-0.5 transition-opacity duration-150",
                    isSelected || isHovered ? "opacity-100" : "opacity-0"
                  )}>
                    {/* Visibility Toggle */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-6"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLayerVisible(layer.id, layer.visible);
                      }}
                    >
                      {layer.visible ? (
                        <EyeIcon className="size-3" />
                      ) : (
                        <EyeOffIcon className="size-3 text-muted-foreground/50" />
                      )}
                    </Button>

                    {/* Lock Toggle */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-6"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLayerLock(layer.id, layer.locked);
                      }}
                    >
                      {layer.locked ? (
                        <LockIcon className="size-3 text-amber-400" />
                      ) : (
                        <UnlockIcon className="size-3" />
                      )}
                    </Button>

                    {/* More Actions Popover */}
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-6"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontalIcon className="size-3" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-32 p-1"
                        align="end"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex flex-col gap-0.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="justify-start text-xs h-7"
                            onClick={() => onMoveLayer(layer.id, "up")}
                            disabled={isFirst}
                          >
                            <ArrowUpIcon className="size-3 mr-2" />
                            Move Up
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="justify-start text-xs h-7"
                            onClick={() => onMoveLayer(layer.id, "down")}
                            disabled={isLast}
                          >
                            <ArrowDownIcon className="size-3 mr-2" />
                            Move Down
                          </Button>
                          <div className="h-px bg-primary/10 my-1" />
                          <Button
                            variant="ghost"
                            size="sm"
                            className="justify-start text-xs h-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => {
                              onDeleteLayer(layer.id);
                              if (isSelected) onSelectLayer(null);
                            }}
                          >
                            <Trash2Icon className="size-3 mr-2" />
                            Delete
                          </Button>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </TooltipProvider>
  );
}
