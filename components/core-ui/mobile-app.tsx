import { Input } from "@/components/ui/input";
import {
  DownloadIcon,
  Trash2Icon,
  UploadIcon,
  TypeIcon,
  PaletteIcon,
  LayersIcon,
  ItalicIcon,
  UnderlineIcon,
  StrikethroughIcon,
  Undo,
  WandSparklesIcon,
  ChevronRightIcon,
  ZoomInIcon,
  ZoomOutIcon,
  AlignLeftIcon,
  AlignCenterIcon,
  AlignRightIcon,
  CopyIcon,
  ExpandIcon,
  ShuffleIcon,
  RotateCcwIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  ImageIcon,
} from "lucide-react";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { HexColorPicker } from "react-colorful";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import VaulDrawer from "@/components/ui/drawer";
import { AppProps, RESOLUTION_PRESETS, TextLayer, ImageLayer, BlobLayer } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useState, useMemo, useRef, Suspense } from "react";
import logo from "@/public/logo.svg";
import Image from "next/image";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { CanvasPreview } from "./canvas-preview";
import { useGesture } from "@use-gesture/react";
import { toast } from "sonner";
import SettingsDrawerContent from "../drawer-content/settings-drawer-content";
import { motion } from "motion/react";
import { BlobCanvasControls } from "./blob-canvas-controls";
import { LayersPanel } from "./layers-panel";
import { LayerRenderer } from "./layer-renderer";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Section header component for consistent styling
function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-[11px] font-medium text-muted-foreground/70 uppercase tracking-wider">
      {children}
    </h3>
  );
}

export default function MobileApp({
  blur,
  setBlur,
  backgroundColor,
  fontSize,
  fontWeight,
  letterSpacing,
  fontFamily,
  opacity,
  lineHeight,
  text,
  circles,
  textColor,
  generateNewPalette,
  downloadImage,
  isDownloading,
  previousCircles,
  setCircles,
  setPreviousCircles,
  setActiveTab,
  activeTab,
  setText,
  setFontFamily,
  setFontSize,
  setFontWeight,
  setLetterSpacing,
  setOpacity,
  setLineHeight,
  setBackgroundColor,
  setActiveColorPicker,
  handleColorChange,
  setActiveColorType,
  setActiveColor,
  fonts,
  activeColorPicker,
  setTextColor,
  resolution,
  setResolution,
  saturation,
  setSaturation,
  contrast,
  setContrast,
  brightness,
  setBrightness,
  backgroundImage,
  setBackgroundImage,
  isItalic,
  isUnderline,
  isStrikethrough,
  setIsItalic,
  setIsUnderline,
  setIsStrikethrough,
  numCircles,
  setNumCircles,
  colors,
  isSafari,
  textShadow,
  setTextShadow,
  grainIntensity,
  setGrainIntensity,
  isUploading,
  setIsUploading,
  textPosition,
  setTextPosition,
  textAlign,
  setTextAlign,
  copyImage,
  isCopying,
  handlePaletteChange,
  resetPalette,
  // New layer system props
  layers,
  selectedLayerId,
  editingLayerId,
  addBlobLayer,
  addTextLayer,
  addImageLayer,
  updateLayer,
  deleteLayer,
  moveLayer,
  selectLayer,
  setEditingLayer,
  getSelectedLayer,
}: AppProps) {
  const [zoom, setZoom] = useState(0.2);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isResolutionOpen, setIsResolutionOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showGenerateConfirm, setShowGenerateConfirm] = useState(false);

  const handleBackgroundImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBackgroundImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  useGesture(
    {
      onPinch: ({ offset: [d], event }) => {
        event.preventDefault();
        const newZoom = Math.min(Math.max(0.1, d / 50), 2);
        setZoom(newZoom);
      },
    },
    {
      target: containerRef,
      eventOptions: { passive: false },
    }
  );

  const fontPreloadText = useMemo(() => {
    return fonts.map((font) => (
      <div
        key={font.name}
        style={{
          fontFamily: font.name,
          position: "absolute",
          visibility: "hidden",
          pointerEvents: "none",
          fontSize: "0px",
        }}
        aria-hidden="true"
      >
        {text}
      </div>
    ));
  }, [fonts, text]);

  const handleBlobSelect = (index: number | null) => {
    if (index !== null) {
      const blobLayers = layers.filter((l) => l.type === "blob") as BlobLayer[];
      if (blobLayers[index]) {
        selectLayer(blobLayers[index].id);
        setActiveColorType("gradient");
        setActiveColor(index);
        setActiveColorPicker(blobLayers[index].color);
      }
    } else {
      selectLayer(null);
    }
  };

  // Get selected layer and its type
  const selectedLayer = getSelectedLayer();
  const selectedLayerType = selectedLayer?.type ?? null;

  // Get non-blob layers for rendering
  const nonBlobLayers = layers.filter(
    (l) => l.type !== "blob" && l.visible
  ) as (TextLayer | ImageLayer)[];

  // Get blob index for BlobCanvasControls
  const blobLayers = layers.filter((l) => l.type === "blob") as BlobLayer[];
  const selectedBlobIndex = selectedLayer?.type === "blob"
    ? blobLayers.findIndex((b) => b.id === selectedLayer.id)
    : null;

  return (
    <main className="relative flex flex-col gap-2 items-center justify-center h-[100dvh] w-full">
      <div aria-hidden="true" className="sr-only">
        {fontPreloadText}
      </div>

      {/* Header */}
      <nav className="flex items-center gap-2 px-4 py-4 w-full justify-between">
        <div className="flex items-center gap-2 justify-between">
          <div className="flex items-center justify-between group">
            <button
              className="flex items-center gap-1"
              onClick={() => setIsSettingsOpen(true)}
            >
              <Image
                src={logo}
                alt="logo"
                className="size-10"
                priority
                loading="eager"
              />
              <ChevronRightIcon className="size-6" />
            </button>
            <VaulDrawer
              title="Settings"
              isOpen={isSettingsOpen}
              setIsOpen={setIsSettingsOpen}
              className="w-full max-w-[80vw] h-full p-2 bg-transparent"
            >
              <SettingsDrawerContent setIsSettingsOpen={setIsSettingsOpen} />
            </VaulDrawer>
          </div>
        </div>

        <div className="flex gap-2 items-center">
          <Button
            onClick={downloadImage}
            disabled={isDownloading}
            variant="accent"
          >
            <DownloadIcon className="size-4" />
            <span className="text-xs tracking-tight">Download</span>
          </Button>
          <Button onClick={copyImage} disabled={isCopying} className="w-fit">
            <CopyIcon className="size-4" />
          </Button>
        </div>
      </nav>

      {/* Canvas Preview */}
      <section className="flex flex-col gap-4 w-full h-full items-center justify-center relative touch-none overflow-hidden px-2">
        <div
          className="rounded-2xl overflow-hidden w-full h-full flex items-center justify-center relative border border-primary/10"
          ref={containerRef}
          onClick={() => selectLayer(null)}
        >
          <div
            className="relative overflow-hidden rounded-2xl"
            style={{
              height: resolution.height * zoom,
              width: resolution.width * zoom,
            }}
          >
            <div
              id="wallpaper"
              style={{
                width: `${resolution.width}px`,
                height: `${resolution.height}px`,
                transform: `scale(${zoom})`,
                transformOrigin: "top left",
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
              }}
            >
              {isGenerating && (
                <div className="absolute inset-0 bg-secondary z-50 flex items-center justify-center">
                  <WandSparklesIcon className="size-8 text-primary animate-ping" />
                </div>
              )}

              <CanvasPreview />
              <BlobCanvasControls
                circles={circles}
                setCircles={setCircles}
                selectedBlobIndex={selectedBlobIndex}
                onSelectBlob={handleBlobSelect}
              />

              {/* Text/Image layers overlay */}
              <div className="absolute inset-0 z-40">
                {nonBlobLayers
                  .sort((a, b) => a.zIndex - b.zIndex)
                  .map((layer) => (
                    <LayerRenderer
                      key={layer.id}
                      layer={layer}
                      isSelected={selectedLayerId === layer.id}
                      isEditing={editingLayerId === layer.id}
                      onSelect={() => selectLayer(layer.id)}
                      onStartEdit={() => setEditingLayer(layer.id)}
                      onEndEdit={() => setEditingLayer(null)}
                      onDrag={(pos) => updateLayer(layer.id, { position: pos })}
                      onTextChange={(text) => {
                        updateLayer(layer.id, { content: text });
                        setText(text);
                      }}
                      zoom={zoom}
                    />
                  ))}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="absolute bottom-0 right-0 left-0 flex items-end gap-2 z-10 justify-between px-4 py-2">
          <div className="flex items-center gap-2">
            <Button
              variant="accent"
              className="w-fit"
              onClick={() => {
                const hasSeenWarning = localStorage.getItem(
                  "generate-warning-seen"
                );
                if (!hasSeenWarning) {
                  setShowGenerateConfirm(true);
                  return;
                }
                handlePaletteChange();
                setBackgroundImage(null);
                if (blur === 0) {
                  setBlur(600);
                }
                setIsGenerating(true);
                setTimeout(() => {
                  setIsGenerating(false);
                }, 1000);
              }}
              disabled={isGenerating}
            >
              <WandSparklesIcon className="size-4" />
              <span className="text-xs tracking-tight">Generate</span>
            </Button>
            <Button
              className="w-fit"
              onClick={() => {
                generateNewPalette();
                setIsGenerating(true);
                setTimeout(() => {
                  setIsGenerating(false);
                }, 2000);
              }}
              disabled={numCircles >= 10}
            >
              <ShuffleIcon className="size-4" />
              <span className="text-xs tracking-tight">Shuffle</span>
            </Button>
            <Button
              disabled={previousCircles.length === 0}
              className="w-fit"
              onClick={() => {
                setBackgroundImage(null);
                if (previousCircles.length > 0) {
                  setCircles(previousCircles);
                  setPreviousCircles([]);
                }
              }}
            >
              {backgroundImage ? (
                <Trash2Icon className="size-4" />
              ) : (
                <Undo className="size-4" />
              )}
            </Button>
          </div>

          <div className="flex flex-col items-center gap-2">
            <Button
              onClick={() => setZoom((z) => Math.min(z + 0.05, 2))}
              className="w-fit"
            >
              <ZoomInIcon className="size-4" />
            </Button>
            <Button
              onClick={() => setZoom((z) => Math.max(z - 0.05, 0.1))}
              className="w-fit"
            >
              <ZoomOutIcon className="size-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Bottom Controls */}
      <aside className="flex flex-col gap-2 w-full">
        <section className="px-2">
          <div className="w-full flex flex-col max-h-[240px] min-h-[180px] rounded-2xl bg-secondary border border-primary/10">
            <div className="flex flex-col overflow-y-auto justify-between no-scrollbar relative h-full gap-2 p-4">
              <Suspense fallback={<div>Loading...</div>}>
                {/* TEXT TAB - Context-aware based on selected layer */}
                {activeTab === "text" && (
                  <motion.div
                    key={activeTab}
                    className="flex flex-col gap-6"
                    initial={{ y: 10 }}
                    animate={{ y: 0 }}
                    exit={{ y: -10 }}
                    transition={{
                      duration: 0.2,
                      type: "spring",
                      damping: 10,
                      stiffness: 100,
                    }}
                  >
                    {/* Selected Layer Info - Enhanced visual card */}
                    {selectedLayer && (
                      <div className="p-3 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 relative overflow-hidden">
                        <div className="flex items-center gap-3">
                          {/* Layer thumbnail/icon */}
                          <div className={cn(
                            "size-9 rounded-lg flex items-center justify-center shrink-0",
                            selectedLayerType === "blob" && "bg-transparent",
                            selectedLayerType === "text" && "bg-blue-500/20",
                            selectedLayerType === "image" && "bg-green-500/20"
                          )}>
                            {selectedLayerType === "blob" && (
                              <span
                                className="size-7 rounded-lg"
                                style={{ backgroundColor: (selectedLayer as BlobLayer).color }}
                              />
                            )}
                            {selectedLayerType === "text" && (
                              <TypeIcon className="size-4 text-blue-400" />
                            )}
                            {selectedLayerType === "image" && (
                              <ImageIcon className="size-4 text-green-400" />
                            )}
                          </div>

                          {/* Layer info */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">
                              {selectedLayer.name}
                            </p>
                            <p className="text-[10px] text-muted-foreground">
                              {selectedLayerType === "text" && "Double-click to edit"}
                              {selectedLayerType === "blob" && "Drag to reposition"}
                              {selectedLayerType === "image" && "Drag to reposition"}
                            </p>
                          </div>

                          {/* Layer type badge */}
                          <span className={cn(
                            "text-[9px] px-1.5 py-0.5 rounded-full uppercase font-semibold shrink-0",
                            selectedLayerType === "blob" && "bg-purple-500/20 text-purple-300",
                            selectedLayerType === "text" && "bg-blue-500/20 text-blue-300",
                            selectedLayerType === "image" && "bg-green-500/20 text-green-300"
                          )}>
                            {selectedLayerType}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* No Layer Selected - Friendly empty state */}
                    {!selectedLayer && (
                      <div className="p-4 rounded-xl bg-foreground/5 border border-dashed border-primary/20 text-center">
                        <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                          <TypeIcon className="size-5 text-primary/60" />
                        </div>
                        <p className="text-sm font-medium text-foreground mb-1">
                          No layer selected
                        </p>
                        <p className="text-[11px] text-muted-foreground mb-3">
                          Select a layer to edit its properties
                        </p>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            className="flex-1 text-xs"
                            onClick={addTextLayer}
                          >
                            <TypeIcon className="size-3 mr-1" />
                            Text
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            className="flex-1 text-xs"
                            onClick={() => {
                              const input = document.createElement("input");
                              input.type = "file";
                              input.accept = "image/*";
                              input.onchange = (e) => {
                                const file = (e.target as HTMLInputElement).files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onloadend = () => {
                                    addImageLayer(reader.result as string);
                                  };
                                  reader.readAsDataURL(file);
                                }
                              };
                              input.click();
                            }}
                          >
                            <ImageIcon className="size-3 mr-1" />
                            Image
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Blob Layer Selected */}
                    {selectedLayerType === "blob" && selectedLayer && (
                      <div className="flex flex-col gap-3">
                        <SectionHeader>Blob Color</SectionHeader>
                        <div className="flex items-center gap-2 w-full relative">
                          <Popover>
                            <PopoverTrigger asChild>
                              <span
                                className="w-6 h-6 rounded-full cursor-pointer aspect-square border border-primary/10 absolute left-2 top-1/2 -translate-y-1/2"
                                style={{ backgroundColor: (selectedLayer as BlobLayer).color }}
                              />
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-3" align="start">
                              <HexColorPicker
                                color={(selectedLayer as BlobLayer).color}
                                onChange={(color) => {
                                  updateLayer(selectedLayer.id, { color });
                                }}
                              />
                            </PopoverContent>
                          </Popover>
                          <Input
                            className="pl-10"
                            type="text"
                            value={(selectedLayer as BlobLayer).color}
                            placeholder="Color"
                            onChange={(e) => {
                              const color = e.target.value.startsWith("#")
                                ? e.target.value
                                : `#${e.target.value}`;
                              updateLayer(selectedLayer.id, { color });
                            }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Text Layer Selected */}
                    {selectedLayerType === "text" && selectedLayer && (
                      <>
                        {/* Content Section */}
                        <div className="flex flex-col gap-3">
                          <SectionHeader>Content</SectionHeader>
                          <Textarea
                            className="resize-none whitespace-pre-wrap min-h-[60px]"
                            value={(selectedLayer as TextLayer).content}
                            onChange={(e) => {
                              updateLayer(selectedLayer.id, { content: e.target.value });
                              setText(e.target.value);
                            }}
                            placeholder="Enter text"
                          />
                        </div>

                        {/* Typography Section */}
                        <div className="flex flex-col gap-3">
                          <SectionHeader>Typography</SectionHeader>

                          {/* Font Selector */}
                          <div className="flex items-center gap-1">
                            <Select
                              value={(selectedLayer as TextLayer).fontFamily}
                              onValueChange={(value) => {
                                updateLayer(selectedLayer.id, { fontFamily: value });
                                setFontFamily(value);
                              }}
                            >
                              <SelectTrigger className="flex-1">
                                <SelectValue placeholder="Select font" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectGroup>
                                  {fonts.map((font) => (
                                    <SelectItem key={font.name} value={font.name}>
                                      <div style={{ fontFamily: `"${font.name}", sans-serif` }}>
                                        {font.name}
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectGroup>
                              </SelectContent>
                            </Select>
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              onClick={() => {
                                const currentFont = (selectedLayer as TextLayer).fontFamily;
                                const i = fonts.findIndex((f) => f.name === currentFont);
                                const prev = (i - 1 + fonts.length) % fonts.length;
                                updateLayer(selectedLayer.id, { fontFamily: fonts[prev].name });
                                setFontFamily(fonts[prev].name);
                              }}
                            >
                              <ChevronUpIcon className="size-4" />
                            </Button>
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              onClick={() => {
                                const currentFont = (selectedLayer as TextLayer).fontFamily;
                                const i = fonts.findIndex((f) => f.name === currentFont);
                                const next = (i + 1) % fonts.length;
                                updateLayer(selectedLayer.id, { fontFamily: fonts[next].name });
                                setFontFamily(fonts[next].name);
                              }}
                            >
                              <ChevronDownIcon className="size-4" />
                            </Button>
                          </div>

                          {/* Color Picker */}
                          <div className="flex items-center gap-2 w-full relative">
                            <Popover>
                              <PopoverTrigger asChild>
                                <span
                                  className="w-6 h-6 rounded-full cursor-pointer aspect-square border border-primary/10 absolute left-2 top-1/2 -translate-y-1/2"
                                  style={{ backgroundColor: (selectedLayer as TextLayer).textColor }}
                                />
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-3" align="start">
                                <HexColorPicker
                                  color={(selectedLayer as TextLayer).textColor}
                                  onChange={(color) => {
                                    updateLayer(selectedLayer.id, { textColor: color });
                                    setTextColor(color);
                                  }}
                                />
                              </PopoverContent>
                            </Popover>
                            <Input
                              className="pl-10"
                              type="text"
                              value={(selectedLayer as TextLayer).textColor}
                              placeholder="Color"
                              onChange={(e) => {
                                const color = e.target.value.startsWith("#")
                                  ? e.target.value
                                  : `#${e.target.value}`;
                                updateLayer(selectedLayer.id, { textColor: color });
                                setTextColor(color);
                              }}
                            />
                          </div>

                          <Slider
                            label="Size"
                            min={0}
                            max={20}
                            step={0.1}
                            value={[(selectedLayer as TextLayer).fontSize]}
                            onValueChange={([value]) => {
                              updateLayer(selectedLayer.id, { fontSize: value });
                              setFontSize(value);
                            }}
                            valueSubtext="em"
                          />

                          <Slider
                            label="Weight"
                            min={100}
                            max={900}
                            step={100}
                            value={[(selectedLayer as TextLayer).fontWeight]}
                            onValueChange={([value]) => {
                              updateLayer(selectedLayer.id, { fontWeight: value });
                              setFontWeight(value);
                            }}
                            disabled={!fonts.find((f) => f.name === (selectedLayer as TextLayer).fontFamily)?.variable}
                            className={cn(
                              !fonts.find((f) => f.name === (selectedLayer as TextLayer).fontFamily)?.variable &&
                                "cursor-not-allowed opacity-50"
                            )}
                          />

                          <Slider
                            label="Tracking"
                            min={-0.1}
                            max={0.1}
                            step={0.01}
                            value={[(selectedLayer as TextLayer).letterSpacing]}
                            onValueChange={([value]) => {
                              updateLayer(selectedLayer.id, { letterSpacing: value });
                              setLetterSpacing(value);
                            }}
                            valueSubtext="em"
                          />

                          <Slider
                            label="Leading"
                            min={0.5}
                            max={2}
                            step={0.1}
                            value={[(selectedLayer as TextLayer).lineHeight]}
                            onValueChange={([value]) => {
                              updateLayer(selectedLayer.id, { lineHeight: value });
                              setLineHeight(value);
                            }}
                            valueSubtext="em"
                          />
                        </div>

                        {/* Alignment & Style Section */}
                        <div className="flex flex-col gap-3">
                          <SectionHeader>Alignment & Style</SectionHeader>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              onClick={() => {
                                updateLayer(selectedLayer.id, { textAlign: "left" });
                                setTextAlign("left");
                              }}
                              className={cn(
                                "flex-1",
                                (selectedLayer as TextLayer).textAlign === "left" ? "bg-primary/20" : "bg-foreground/5"
                              )}
                            >
                              <AlignLeftIcon className="size-4" />
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => {
                                updateLayer(selectedLayer.id, { textAlign: "center" });
                                setTextAlign("center");
                              }}
                              className={cn(
                                "flex-1",
                                (selectedLayer as TextLayer).textAlign === "center" ? "bg-primary/20" : "bg-foreground/5"
                              )}
                            >
                              <AlignCenterIcon className="size-4" />
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => {
                                updateLayer(selectedLayer.id, { textAlign: "right" });
                                setTextAlign("right");
                              }}
                              className={cn(
                                "flex-1",
                                (selectedLayer as TextLayer).textAlign === "right" ? "bg-primary/20" : "bg-foreground/5"
                              )}
                            >
                              <AlignRightIcon className="size-4" />
                            </Button>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              onClick={() => {
                                const newValue = !(selectedLayer as TextLayer).isItalic;
                                updateLayer(selectedLayer.id, { isItalic: newValue });
                                setIsItalic(newValue);
                              }}
                              className={cn(
                                "flex-1",
                                (selectedLayer as TextLayer).isItalic ? "bg-primary/20" : "bg-foreground/5"
                              )}
                            >
                              <ItalicIcon className="size-4" />
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => {
                                const newValue = !(selectedLayer as TextLayer).isUnderline;
                                updateLayer(selectedLayer.id, { isUnderline: newValue });
                                setIsUnderline(newValue);
                              }}
                              className={cn(
                                "flex-1",
                                (selectedLayer as TextLayer).isUnderline ? "bg-primary/20" : "bg-foreground/5"
                              )}
                            >
                              <UnderlineIcon className="size-4" />
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => {
                                const newValue = !(selectedLayer as TextLayer).isStrikethrough;
                                updateLayer(selectedLayer.id, { isStrikethrough: newValue });
                                setIsStrikethrough(newValue);
                              }}
                              className={cn(
                                "flex-1",
                                (selectedLayer as TextLayer).isStrikethrough ? "bg-primary/20" : "bg-foreground/5"
                              )}
                            >
                              <StrikethroughIcon className="size-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Opacity */}
                        <div className="flex flex-col gap-3">
                          <SectionHeader>Appearance</SectionHeader>
                          <Slider
                            label="Opacity"
                            min={0}
                            max={100}
                            step={1}
                            value={[(selectedLayer as TextLayer).opacity]}
                            onValueChange={([value]) => {
                              updateLayer(selectedLayer.id, { opacity: value });
                              setOpacity(value);
                            }}
                            valueSubtext="%"
                          />
                        </div>

                        {/* Glow Section */}
                        <div className="flex flex-col gap-3">
                          <SectionHeader>Glow</SectionHeader>
                          <div className="flex items-center gap-2 w-full relative">
                            <Popover>
                              <PopoverTrigger asChild>
                                <span
                                  className="w-6 h-6 rounded-full cursor-pointer aspect-square border border-primary/10 absolute left-2 top-1/2 -translate-y-1/2"
                                  style={{ backgroundColor: (selectedLayer as TextLayer).shadow.color }}
                                />
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-3" align="start">
                                <HexColorPicker
                                  color={(selectedLayer as TextLayer).shadow.color}
                                  onChange={(color) => {
                                    updateLayer(selectedLayer.id, {
                                      shadow: { ...(selectedLayer as TextLayer).shadow, color },
                                    });
                                    setTextShadow((prev) => ({ ...prev, color }));
                                  }}
                                />
                              </PopoverContent>
                            </Popover>
                            <Input
                              className="pl-10"
                              type="text"
                              value={(selectedLayer as TextLayer).shadow.color}
                              placeholder="Glow Color"
                              onChange={(e) => {
                                const color = e.target.value.startsWith("#")
                                  ? e.target.value
                                  : `#${e.target.value}`;
                                updateLayer(selectedLayer.id, {
                                  shadow: { ...(selectedLayer as TextLayer).shadow, color },
                                });
                                setTextShadow((prev) => ({ ...prev, color }));
                              }}
                            />
                          </div>

                          <Slider
                            label="Intensity"
                            min={0}
                            max={100}
                            step={1}
                            value={[(selectedLayer as TextLayer).shadow.blur]}
                            onValueChange={([value]) => {
                              updateLayer(selectedLayer.id, {
                                shadow: { ...(selectedLayer as TextLayer).shadow, blur: value },
                              });
                              setTextShadow((prev) => ({ ...prev, blur: value }));
                            }}
                            valueSubtext="%"
                          />

                          <Slider
                            label="Offset X"
                            min={-20}
                            max={20}
                            step={1}
                            value={[(selectedLayer as TextLayer).shadow.offsetX]}
                            onValueChange={([value]) => {
                              updateLayer(selectedLayer.id, {
                                shadow: { ...(selectedLayer as TextLayer).shadow, offsetX: value },
                              });
                              setTextShadow((prev) => ({ ...prev, offsetX: value }));
                            }}
                          />

                          <Slider
                            label="Offset Y"
                            min={-20}
                            max={20}
                            step={1}
                            value={[(selectedLayer as TextLayer).shadow.offsetY]}
                            onValueChange={([value]) => {
                              updateLayer(selectedLayer.id, {
                                shadow: { ...(selectedLayer as TextLayer).shadow, offsetY: value },
                              });
                              setTextShadow((prev) => ({ ...prev, offsetY: value }));
                            }}
                          />
                        </div>
                      </>
                    )}

                    {/* Image Layer Selected */}
                    {selectedLayerType === "image" && selectedLayer && (
                      <>
                        {/* Image Actions */}
                        <div className="flex flex-col gap-3">
                          <SectionHeader>Image</SectionHeader>
                          <div className="flex gap-2">
                            <label className="flex-1">
                              <Input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const reader = new FileReader();
                                    reader.onloadend = () => {
                                      updateLayer(selectedLayer.id, { imageData: reader.result as string });
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                  e.target.value = "";
                                }}
                                className="hidden"
                              />
                              <Button size="sm" className="w-full" asChild>
                                <span>
                                  <UploadIcon className="size-4 mr-1" />
                                  Change Image
                                </span>
                              </Button>
                            </label>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => deleteLayer(selectedLayer.id)}
                            >
                              <Trash2Icon className="size-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Size Section */}
                        <div className="flex flex-col gap-3">
                          <SectionHeader>Size</SectionHeader>
                          <Slider
                            label="Scale"
                            min={10}
                            max={100}
                            step={1}
                            value={[(selectedLayer as ImageLayer).scale]}
                            onValueChange={([value]) => {
                              updateLayer(selectedLayer.id, { scale: value });
                            }}
                            valueSubtext="%"
                          />
                        </div>

                        {/* Opacity */}
                        <div className="flex flex-col gap-3">
                          <SectionHeader>Appearance</SectionHeader>
                          <Slider
                            label="Opacity"
                            min={0}
                            max={100}
                            step={1}
                            value={[(selectedLayer as ImageLayer).opacity]}
                            onValueChange={([value]) => {
                              updateLayer(selectedLayer.id, { opacity: value });
                            }}
                            valueSubtext="%"
                          />
                        </div>

                        {/* Glow Section */}
                        <div className="flex flex-col gap-3">
                          <SectionHeader>Glow</SectionHeader>
                          <div className="flex items-center gap-2 w-full relative">
                            <Popover>
                              <PopoverTrigger asChild>
                                <span
                                  className="w-6 h-6 rounded-full cursor-pointer aspect-square border border-primary/10 absolute left-2 top-1/2 -translate-y-1/2"
                                  style={{ backgroundColor: (selectedLayer as ImageLayer).shadow.color }}
                                />
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-3" align="start">
                                <HexColorPicker
                                  color={(selectedLayer as ImageLayer).shadow.color}
                                  onChange={(color) => {
                                    updateLayer(selectedLayer.id, {
                                      shadow: { ...(selectedLayer as ImageLayer).shadow, color },
                                    });
                                  }}
                                />
                              </PopoverContent>
                            </Popover>
                            <Input
                              className="pl-10"
                              type="text"
                              value={(selectedLayer as ImageLayer).shadow.color}
                              placeholder="Glow Color"
                              onChange={(e) => {
                                const color = e.target.value.startsWith("#")
                                  ? e.target.value
                                  : `#${e.target.value}`;
                                updateLayer(selectedLayer.id, {
                                  shadow: { ...(selectedLayer as ImageLayer).shadow, color },
                                });
                              }}
                            />
                          </div>

                          <Slider
                            label="Intensity"
                            min={0}
                            max={100}
                            step={1}
                            value={[(selectedLayer as ImageLayer).shadow.blur]}
                            onValueChange={([value]) => {
                              updateLayer(selectedLayer.id, {
                                shadow: { ...(selectedLayer as ImageLayer).shadow, blur: value },
                              });
                            }}
                            valueSubtext="%"
                          />

                          <Slider
                            label="Offset X"
                            min={-20}
                            max={20}
                            step={1}
                            value={[(selectedLayer as ImageLayer).shadow.offsetX]}
                            onValueChange={([value]) => {
                              updateLayer(selectedLayer.id, {
                                shadow: { ...(selectedLayer as ImageLayer).shadow, offsetX: value },
                              });
                            }}
                          />

                          <Slider
                            label="Offset Y"
                            min={-20}
                            max={20}
                            step={1}
                            value={[(selectedLayer as ImageLayer).shadow.offsetY]}
                            onValueChange={([value]) => {
                              updateLayer(selectedLayer.id, {
                                shadow: { ...(selectedLayer as ImageLayer).shadow, offsetY: value },
                              });
                            }}
                          />
                        </div>
                      </>
                    )}
                  </motion.div>
                )}

                {/* STYLE TAB */}
                {activeTab === "style" && (
                  <motion.div
                    key={activeTab}
                    className="flex flex-col gap-6"
                    initial={{ y: 10 }}
                    animate={{ y: 0 }}
                    exit={{ y: -10 }}
                    transition={{
                      duration: 0.2,
                      type: "spring",
                      damping: 10,
                      stiffness: 100,
                    }}
                  >
                    {/* Background Section */}
                    <div className="flex flex-col gap-3">
                      <SectionHeader>Background</SectionHeader>
                      <div className="flex items-center gap-2 relative">
                        <Popover>
                          <PopoverTrigger asChild>
                            <span
                              className="w-6 h-6 rounded-full cursor-pointer aspect-square border border-primary/10 absolute left-2 top-1/2 -translate-y-1/2"
                              style={{ backgroundColor: backgroundColor }}
                            />
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-3" align="start">
                            <HexColorPicker
                              color={activeColorPicker}
                              onChange={(color) => {
                                setActiveColorType("background");
                                setActiveColorPicker(color);
                                setBackgroundColor(color);
                              }}
                            />
                          </PopoverContent>
                        </Popover>
                        <Input
                          type="text"
                          value={
                            backgroundColor.startsWith("#")
                              ? backgroundColor
                              : `#${backgroundColor}`
                          }
                          placeholder="Background Color"
                          onChange={(e) => {
                            const color = e.target.value.startsWith("#")
                              ? e.target.value
                              : `#${e.target.value}`;
                            setBackgroundColor(color);
                          }}
                          className={cn(
                            "pl-10",
                            backgroundImage && "opacity-50 cursor-not-allowed"
                          )}
                          disabled={!!backgroundImage}
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-px bg-primary/10" />
                        <span className="text-[10px] text-muted-foreground">or</span>
                        <div className="flex-1 h-px bg-primary/10" />
                      </div>

                      <label
                        className={cn(
                          "px-4 py-2 bg-foreground/5 rounded-xl hover:bg-foreground/10 text-primary transition-all duration-300 flex items-center gap-2 cursor-pointer justify-center border border-primary/10",
                          isUploading && "opacity-50 cursor-not-allowed"
                        )}
                      >
                        <Input
                          type="file"
                          accept="image/*"
                          key={backgroundImage ? "has-image" : "no-image"}
                          onChange={async (e) => {
                            if (isUploading) return;
                            setIsUploading(true);
                            try {
                              await handleBackgroundImageUpload(e);
                            } finally {
                              setIsUploading(false);
                              e.target.value = "";
                            }
                          }}
                          className="hidden"
                          disabled={isUploading}
                        />
                        {isUploading ? (
                          <span className="animate-pulse text-xs">Uploading...</span>
                        ) : (
                          <>
                            <UploadIcon className="size-4" />
                            <span className="text-xs tracking-tight">
                              {backgroundImage ? "Change Image" : "Upload Image"}
                            </span>
                          </>
                        )}
                      </label>

                      {backgroundImage && (
                        <Button
                          onClick={() => {
                            setBackgroundImage(null);
                            if (blur === 0) {
                              setBlur(600);
                            }
                          }}
                          variant="destructive"
                          size="sm"
                        >
                          <Trash2Icon className="size-4" />
                          <span className="text-xs ml-1">Remove Image</span>
                        </Button>
                      )}
                    </div>

                    {/* Gradient Section */}
                    <div className="flex flex-col gap-3">
                      <SectionHeader>Gradient</SectionHeader>
                      <Slider
                        label="Blur"
                        min={backgroundImage ? 0 : 400}
                        max={isSafari ? 800 : 1200}
                        step={20}
                        value={[blur]}
                        valueSubtext="px"
                        onValueChange={([value]) => setBlur(value)}
                      />

                      {!isSafari && (
                        <Slider
                          label="Grain"
                          min={0}
                          max={100}
                          step={1}
                          value={[grainIntensity]}
                          onValueChange={([value]) => setGrainIntensity(value)}
                          valueSubtext="%"
                        />
                      )}
                    </div>

                    {/* Adjustments Section */}
                    <div className="flex flex-col gap-3">
                      <SectionHeader>Adjustments</SectionHeader>
                      <Slider
                        label="Saturation"
                        min={0}
                        max={200}
                        step={1}
                        value={[saturation]}
                        onValueChange={([value]) => setSaturation(value)}
                        valueSubtext="%"
                      />
                      <Slider
                        label="Contrast"
                        min={5}
                        max={200}
                        step={1}
                        value={[contrast]}
                        onValueChange={([value]) => setContrast(value)}
                        valueSubtext="%"
                      />
                      <Slider
                        label="Brightness"
                        min={10}
                        max={200}
                        step={1}
                        value={[brightness]}
                        onValueChange={([value]) => setBrightness(value)}
                        valueSubtext="%"
                      />
                    </div>
                  </motion.div>
                )}

                {/* LAYERS TAB */}
                {activeTab === "layers" && (
                  <motion.div
                    key={activeTab}
                    className="flex flex-col gap-6"
                    initial={{ y: 10 }}
                    animate={{ y: 0 }}
                    exit={{ y: -10 }}
                    transition={{
                      duration: 0.2,
                      type: "spring",
                      damping: 10,
                      stiffness: 100,
                    }}
                  >
                    {/* Resolution Section */}
                    <div className="flex flex-col gap-3">
                      <SectionHeader>Resolution</SectionHeader>
                      <Button
                        className="w-full flex"
                        onClick={() => setIsResolutionOpen(true)}
                      >
                        <div className="flex items-center gap-2 justify-between w-full">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-full min-w-4 min-h-4 border border-primary rounded"
                              style={{
                                aspectRatio: `${resolution.width}/${resolution.height}`,
                              }}
                            />
                            <div className="flex flex-col gap-1">
                              <p className="text-sm tracking-tight text-left">
                                {RESOLUTION_PRESETS.find(
                                  (preset) =>
                                    preset.width === resolution.width &&
                                    preset.height === resolution.height
                                )?.name || "Custom"}
                              </p>
                              <p className="text-xs text-muted-foreground text-left">
                                {resolution.width}x{resolution.height}
                              </p>
                            </div>
                          </div>
                          <ExpandIcon className="size-4 transition-all duration-300" />
                        </div>
                      </Button>
                      <VaulDrawer
                        isOpen={isResolutionOpen}
                        setIsOpen={setIsResolutionOpen}
                        title="Resolution"
                        direction="bottom"
                        showHandle={true}
                        className="rounded-t-xl"
                      >
                        <div className="flex flex-col h-full max-h-[85vh]">
                          <div className="flex items-center gap-2 p-4 border-b border-primary/10">
                            <div className="flex flex-col w-full gap-1 relative">
                              <label className="text-xs text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2">
                                W:
                              </label>
                              <Input
                                className="pl-8"
                                type="number"
                                min={0}
                                max={2560}
                                defaultValue={resolution.width}
                                onChange={(e) => {
                                  const value = parseInt(e.target.value);
                                  if (value > 2560) {
                                    toast.error("Maximum width is 2560px");
                                    return;
                                  }
                                  e.target.value = value.toString();
                                }}
                                id="width-input-mobile"
                              />
                            </div>
                            <div className="flex flex-col gap-1 w-full relative">
                              <label className="text-xs text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2">
                                H:
                              </label>
                              <Input
                                className="pl-8"
                                type="number"
                                min={0}
                                max={2560}
                                defaultValue={resolution.height}
                                onChange={(e) => {
                                  const value = parseInt(e.target.value);
                                  if (value > 2560) {
                                    toast.error("Maximum height is 2560px");
                                    return;
                                  }
                                  e.target.value = value.toString();
                                }}
                                id="height-input-mobile"
                              />
                            </div>
                            <Button
                              className="w-fit"
                              variant="accent"
                              onClick={() => {
                                const width = parseInt(
                                  (
                                    document.getElementById(
                                      "width-input-mobile"
                                    ) as HTMLInputElement
                                  ).value
                                );
                                const height = parseInt(
                                  (
                                    document.getElementById(
                                      "height-input-mobile"
                                    ) as HTMLInputElement
                                  ).value
                                );
                                if (width > 2560 || height > 2560) {
                                  toast.error("Maximum dimensions are 2560px");
                                  return;
                                }
                                setResolution({ width, height });
                                setIsResolutionOpen(false);
                              }}
                            >
                              Apply
                            </Button>
                          </div>

                          <div className="flex-1 overflow-y-auto no-scrollbar">
                            <div className="flex flex-col gap-6 p-4 pb-32">
                              {Array.from(
                                new Set(
                                  RESOLUTION_PRESETS.map((preset) => preset.category)
                                )
                              ).map((category) => (
                                <div key={category} className="flex flex-col gap-2">
                                  <p className="text-xs text-muted-foreground">
                                    {category}
                                  </p>
                                  <div className="grid grid-cols-3 gap-2">
                                    {RESOLUTION_PRESETS.filter(
                                      (preset) => preset.category === category
                                    ).map((preset) => (
                                      <div
                                        key={preset.name}
                                        onClick={() => {
                                          setResolution({
                                            width: preset.width,
                                            height: preset.height,
                                          });
                                          setIsResolutionOpen(false);
                                        }}
                                        className="flex flex-col items-center gap-4 cursor-pointer bg-foreground/5 rounded-xl p-2 border border-primary/10 hover:bg-foreground/10 transition-all duration-300 min-h-24 justify-center"
                                      >
                                        <div className="flex flex-col gap-2 items-center">
                                          <p className="tracking-tight text-center font-medium text-sm">
                                            {preset.name}
                                          </p>
                                          <p className="text-xs text-muted-foreground">
                                            ({preset.width}x{preset.height})
                                          </p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </VaulDrawer>
                    </div>

                    {/* Layers Section */}
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-2 justify-between">
                        <SectionHeader>Layers</SectionHeader>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7"
                          onClick={resetPalette}
                        >
                          <RotateCcwIcon className="size-4" />
                        </Button>
                      </div>

                      <LayersPanel
                        layers={layers}
                        selectedLayerId={selectedLayerId}
                        onSelectLayer={selectLayer}
                        onUpdateLayer={updateLayer}
                        onMoveLayer={moveLayer}
                        onDeleteLayer={deleteLayer}
                        onAddBlobLayer={addBlobLayer}
                        onAddTextLayer={addTextLayer}
                        onAddImageLayer={addImageLayer}
                      />
                    </div>
                  </motion.div>
                )}
              </Suspense>
            </div>
          </div>
        </section>

        {/* Bottom Tab Navigation */}
        <Tabs
          value={activeTab}
          onValueChange={(value) =>
            setActiveTab(value as "text" | "style" | "layers")
          }
          className="flex items-center w-full border-t border-primary/10 bg-secondary"
        >
          <TabsList className="w-full flex items-center gap-1">
            <div className="flex items-center gap-2 min-w-full p-2 pb-8">
              {[
                { id: "text", icon: TypeIcon, label: "Text" },
                { id: "style", icon: PaletteIcon, label: "Style" },
                { id: "layers", icon: LayersIcon, label: "Layers" },
              ].map(({ id, icon: Icon, label }) => (
                <TabsTrigger
                  key={id}
                  value={id}
                  className={cn(
                    "flex-1 relative w-full px-4 py-3 cursor-pointer transition-all duration-300 rounded-2xl flex flex-col items-center justify-center gap-1",
                    activeTab === id && "bg-primary/10 border border-primary/50"
                  )}
                >
                  <Icon className="size-4" />
                  <span className="text-[10px]">{label}</span>
                </TabsTrigger>
              ))}
            </div>
          </TabsList>
        </Tabs>
      </aside>

      {/* Generate Confirmation Dialog */}
      <Dialog open={showGenerateConfirm} onOpenChange={setShowGenerateConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate New Colors</DialogTitle>
            <DialogDescription>
              Clicking generate will reset all the colors and create a fresh set
              of colors.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col gap-2">
            <Button
              variant="secondary"
              onClick={() => setShowGenerateConfirm(false)}
            >
              Cancel
            </Button>
            <Button
              variant="accent"
              onClick={() => {
                localStorage.setItem("generate-warning-seen", "true");
                setShowGenerateConfirm(false);
                handlePaletteChange();
                setBackgroundImage(null);
                if (blur === 0) {
                  setBlur(600);
                }
                setIsGenerating(true);
                setTimeout(() => {
                  setIsGenerating(false);
                }, 2000);
              }}
            >
              Generate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
