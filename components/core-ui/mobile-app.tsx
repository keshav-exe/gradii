import { Input } from "@/components/ui/input";
import {
  DownloadIcon,
  Trash2Icon,
  UploadIcon,
  PaintbrushIcon,
  SparklesIcon,
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
  CropIcon,
  PlusIcon,
  ExpandIcon,
  Move,
  RefreshCcwIcon,
  ShuffleIcon,
  RotateCcwIcon,
  ChevronUpIcon,
  ChevronDownIcon,
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
import { AppProps, INITIAL_COLORS, RESOLUTION_PRESETS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useState, useMemo, useRef, Suspense } from "react";
import logo from "@/public/logo.svg";
import Image from "next/image";
import { Textarea } from "../ui/textarea";
import { Separator } from "../ui/separator";
import { Button } from "../ui/button";
import { CanvasPreview } from "./canvas-preview";
import {
  DndContext,
  useDraggable,
  useSensor,
  useSensors,
  MouseSensor,
  TouchSensor,
  DragEndEvent,
} from "@dnd-kit/core";
import { useGesture } from "@use-gesture/react";
import { PositionControl } from "../ui/position-control";
import { toast } from "sonner";
import SettingsDrawerContent from "../drawer-content/settings-drawer-content";
import { motion } from "motion/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

function DraggablePreview({
  children,
  id,
}: {
  children: React.ReactNode;
  id: string;
}) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id,
  });

  const style = transform
    ? {
      transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    }
    : undefined;

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      {children}
    </div>
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
  updateColor,
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
  sizeMode,
  logoImage,
  setTextMode,
  setLogoImage,
  textAlign,
  setTextAlign,
  copyImage,
  isCopying,
  handlePaletteChange,
  resetPalette,
}: AppProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(0.2);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPositionControlOpen, setIsPositionControlOpen] = useState(false);
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
      onDrag: ({ delta: [dx, dy] }) => {
        setPosition((prev) => ({
          x: prev.x + dx,
          y: prev.y + dy,
        }));
      },
    },
    {
      target: containerRef,
      eventOptions: { passive: false },
    }
  );

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBackgroundImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

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

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 0,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { delta } = event;
    if (delta) {
      setPosition((prev) => ({
        x: prev.x + delta.x,
        y: prev.y + delta.y,
      }));
    }
  };

  return (
    <main className="relative flex flex-col gap-2 items-center justify-center h-[100dvh] w-full">
      <div aria-hidden="true" className="sr-only">
        {fontPreloadText}
      </div>
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

      {/* preview section */}
      <section className="flex flex-col gap-4 w-full h-full items-center justify-center relative touch-none overflow-hidden px-2 ">
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          <div
            className="rounded-2xl overflow-hidden w-full h-full flex items-center justify-center relative cursor-grab active:cursor-grabbing border border-primary/10"
            ref={containerRef}
          >
            <DraggablePreview id="preview">
              <div
                className="relative overflow-hidden rounded-2xl"
                style={{
                  height: resolution.height * zoom,
                  width: resolution.width * zoom,
                  transform: `translate(${position.x}px, ${position.y}px)`,
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

                  <div className="absolute inset-0 flex items-center justify-center z-40">
                    {sizeMode === "text" ? (
                      <p
                        style={{
                          fontSize: `${fontSize}em`,
                          fontWeight: fontWeight,
                          letterSpacing: `${letterSpacing}em`,
                          fontFamily: fontFamily,
                          opacity: opacity / 100,
                          lineHeight: lineHeight,
                          color: textColor,
                          fontStyle: isItalic ? "italic" : "normal",
                          textDecoration: `${isUnderline ? "underline" : ""} ${isStrikethrough ? "line-through" : ""
                            }`.trim(),
                          textShadow: `${textShadow.offsetX}px ${textShadow.offsetY}px ${textShadow.blur}px ${textShadow.color}`,
                          transform: `translate(${textPosition.x}px, ${textPosition.y}px)`,
                          whiteSpace: "pre-wrap",
                          textAlign: textAlign,
                        }}
                        className="transition-all duration-300 ease-[cubic-bezier(0.45, 0.05, 0.55, 0.95)]"
                      >
                        {text}
                      </p>
                    ) : (
                      logoImage && (
                        <Image
                          className="transition-all duration-300 ease-[cubic-bezier(0.45, 0.05, 0.55, 0.95)]"
                          unoptimized
                          src={logoImage}
                          alt="Logo"
                          style={{
                            maxWidth: `${fontSize}%`,
                            maxHeight: `${fontSize}%`,
                            opacity: opacity / 100,
                            transform: `translate(${textPosition.x}px, ${textPosition.y}px)`,
                            filter: `drop-shadow(${textShadow.offsetX}px ${textShadow.offsetY}px ${textShadow.blur}px ${textShadow.color})`,
                          }}
                        />
                      )
                    )}
                  </div>
                </div>
              </div>
            </DraggablePreview>
          </div>
        </DndContext>

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
            <Button
              className="w-fit"
              onClick={() => setIsPositionControlOpen(true)}
            >
              <Move className="size-4" />
            </Button>
          </div>
          <VaulDrawer
            isOpen={isPositionControlOpen}
            setIsOpen={setIsPositionControlOpen}
            title="Position"
            direction="bottom"
            showHandle={true}
            className="max-h-[50dvh] rounded-t-xl"
          >
            <div className="flex flex-col gap-2 w-full p-4">
              <PositionControl
                value={textPosition}
                onChange={setTextPosition}
                width={resolution.width}
                height={resolution.height}
                className="max-w-[280px] max-h-[280px]"
              />
            </div>
          </VaulDrawer>
        </div>
      </section>

      <aside className="flex flex-col gap-2 w-full">
        {/* controls */}
        <section className="px-2">
          <div className="w-full flex flex-col max-h-[240px] min-h-[180px] rounded-2xl bg-secondary border border-primary/10">
            <div className="flex flex-col overflow-y-auto justify-between no-scrollbar relative h-full gap-2 p-4">
              <Suspense fallback={<div>Loading...</div>}>
                {activeTab === "design" && (
                  <motion.div
                    key={activeTab}
                    className="flex flex-col gap-8"
                    initial={{ y: 10 }}
                    animate={{ y: 0 }}
                    exit={{ y: -10 }}
                    transition={{
                      duration: 0.2,
                      type: "spring",
                      damping: 10,
                      stiffness: 100,
                      ease: "cubic-bezier(0.45, 0.05, 0.55, 0.95)",
                    }}
                  >
                    <div className="flex flex-col gap-4 w-full">
                      <div className="flex flex-col gap-2 w-full">
                        <Textarea
                          className={cn(
                            "resize-none whitespace-pre-wrap",
                            sizeMode === "image" &&
                            "opacity-50 cursor-not-allowed"
                          )}
                          value={text}
                          onChange={(e) => setText(e.target.value)}
                          placeholder="Enter text"
                          disabled={sizeMode === "image"}
                        />
                      </div>

                      <div className="relative">
                        <div className="absolute inset-x-0 -top-3 flex items-center justify-center">
                          <span className="text-xs text-muted-foreground">
                            or
                          </span>
                        </div>
                        <div className="relative flex flex-col gap-2 pt-2">
                          <label
                            className={`px-4 py-2 bg-foreground/5 rounded-xl hover:text-foreground/80 text-primary transition-all duration-300 flex items-center gap-2 cursor-pointer justify-center border border-primary/10  ${isUploading ? "opacity-50 cursor-not-allowed" : ""
                              }`}
                          >
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={async (e) => {
                                if (isUploading) return;
                                setIsUploading(true);
                                try {
                                  await handleImageUpload(e);
                                } finally {
                                  setIsUploading(false);
                                  e.target.value = "";
                                }
                              }}
                              className="hidden"
                              disabled={isUploading}
                            />
                            {isUploading ? (
                              <span className="animate-pulse">
                                Uploading...
                              </span>
                            ) : (
                              <>
                                <UploadIcon className="size-4" />
                                <span className="text-xs tracking-tight">
                                  {logoImage ? "Change Image" : "Upload Image"}
                                </span>
                              </>
                            )}
                          </label>

                          {logoImage && (
                            <Button
                              onClick={() => {
                                setLogoImage(null);
                                setTextMode("text");
                                setFontSize(10);
                              }}
                              variant="destructive"
                            >
                              <Trash2Icon className="size-4" />
                              <span className="text-xs tracking-tight ml-2">
                                Remove Image
                              </span>
                            </Button>
                          )}
                        </div>
                      </div>

                      <Separator className="my-2" />

                      {sizeMode === "text" && (
                        <>
                          <div className="flex flex-col gap-2 w-full">
                            <label className="text-sm text-muted-foreground">
                              Color
                            </label>
                            <div className="flex items-center gap-2 w-full relative">
                              <Popover>
                                <PopoverTrigger asChild>
                                  <span
                                    className="w-6 h-6 rounded-full cursor-pointer aspect-square border border-primary/10 absolute left-2 top-1/2 -translate-y-1/2"
                                    style={{ backgroundColor: textColor }}
                                  />
                                </PopoverTrigger>
                                <PopoverContent
                                  className="w-auto p-3"
                                  align="start"
                                >
                                  <HexColorPicker
                                    color={activeColorPicker}
                                    onChange={(color) => {
                                      setActiveColorType("text");
                                      setActiveColorPicker(color);
                                      handleColorChange(color);
                                    }}
                                  />
                                </PopoverContent>
                              </Popover>
                              <Input
                                className="pl-10"
                                type="text"
                                value={
                                  textColor.startsWith("#")
                                    ? textColor
                                    : `#${textColor}`
                                }
                                placeholder="Color"
                                onChange={(e) => {
                                  const color = e.target.value.startsWith("#")
                                    ? e.target.value
                                    : `#${e.target.value}`;
                                  setTextColor(color);
                                }}
                              />
                            </div>
                          </div>

                          <div className="flex flex-col gap-2">
                            <label className="text-sm text-muted-foreground">
                              Font
                            </label>
                            <div className="flex flex-row gap-1">
                              <Select
                                value={fontFamily}
                                onValueChange={setFontFamily}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select font" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectGroup>
                                    {fonts.map((font) => (
                                      <SelectItem
                                        key={font.name}
                                        value={font.name}>
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
                                onClick={() => {
                                  const i = fonts.findIndex((f) => f.name === fontFamily);
                                  const prev = (i - 1 + fonts.length) % fonts.length;
                                  setFontFamily(fonts[prev].name);
                                }}>
                                <ChevronUpIcon className="size-4" />
                              </Button>

                              <Button
                                type="button"
                                size="icon"
                                onClick={() => {
                                  const i = fonts.findIndex((f) => f.name === fontFamily);
                                  const next = (i + 1) % fonts.length;
                                  setFontFamily(fonts[next].name);
                                }}>
                                <ChevronDownIcon className="size-4" />
                              </Button>
                            </div>

                          </div>
                        </>
                      )}

                      <Slider
                        label={sizeMode === "text" ? "Size" : "Size"}
                        min={sizeMode === "text" ? 0 : 10}
                        max={sizeMode === "text" ? 20 : 100}
                        step={sizeMode === "text" ? 0.1 : 1}
                        value={[fontSize]}
                        onValueChange={([value]) => setFontSize(value)}
                        valueSubtext={sizeMode === "text" ? "em" : "%"}
                      />
                      {sizeMode === "text" && (
                        <>
                          <div className="flex flex-col gap-2 w-full">
                            <Slider
                              label="Weight"
                              min={100}
                              max={900}
                              step={100}
                              value={[fontWeight]}
                              onValueChange={([value]) => setFontWeight(value)}
                              disabled={
                                !fonts.find((f) => f.name === fontFamily)
                                  ?.variable
                              }
                              className={cn(
                                !fonts.find((f) => f.name === fontFamily)
                                  ?.variable && "cursor-not-allowed"
                              )}
                            />
                          </div>

                          <div className="flex flex-col gap-2 w-full">
                            <Slider
                              label="Tracking"
                              min={-0.1}
                              max={0.1}
                              step={0.01}
                              value={[letterSpacing]}
                              onValueChange={([value]) =>
                                setLetterSpacing(value)
                              }
                              valueSubtext="em"
                            />
                          </div>

                          <div className="flex flex-col gap-2 w-full">
                            <Slider
                              label="Leading"
                              min={0.5}
                              max={2}
                              step={0.1}
                              value={[lineHeight]}
                              onValueChange={([value]) => setLineHeight(value)}
                              valueSubtext="em"
                            />
                          </div>
                        </>
                      )}

                      <Slider
                        label="Opacity"
                        min={0}
                        max={100}
                        step={1}
                        value={[opacity]}
                        onValueChange={([value]) => setOpacity(value)}
                      />

                      {sizeMode === "text" && (
                        <div className="flex flex-col gap-2 w-full">
                          <label className="text-sm text-muted-foreground">
                            Decoration
                          </label>
                          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar rounded-xl">
                            <Button
                              onClick={() => setTextAlign("left")}
                              className={cn(
                                textAlign === "left"
                                  ? "bg-primary/20"
                                  : "bg-background/5"
                              )}
                            >
                              <AlignLeftIcon className="size-4" />
                            </Button>
                            <Button
                              onClick={() => setTextAlign("center")}
                              className={cn(
                                textAlign === "center"
                                  ? "bg-primary/20"
                                  : "bg-background/5"
                              )}
                            >
                              <AlignCenterIcon className="size-4" />
                            </Button>
                            <Button
                              onClick={() => setTextAlign("right")}
                              className={cn(
                                textAlign === "right"
                                  ? "bg-primary/20"
                                  : "bg-background/5"
                              )}
                            >
                              <AlignRightIcon className="size-4" />
                            </Button>
                          </div>
                          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar rounded-xl">
                            <Button
                              onClick={() => setIsItalic(!isItalic)}
                              className={cn(
                                isItalic ? "bg-primary/20 " : "bg-background/5"
                              )}
                            >
                              <ItalicIcon className="size-4" />
                            </Button>
                            <Button
                              onClick={() => setIsUnderline(!isUnderline)}
                              className={cn(
                                isUnderline
                                  ? "bg-primary/20 "
                                  : "bg-background/5"
                              )}
                            >
                              <UnderlineIcon className="size-4 mx-auto" />
                            </Button>
                            <Button
                              onClick={() =>
                                setIsStrikethrough(!isStrikethrough)
                              }
                              className={cn(
                                isStrikethrough
                                  ? "bg-primary/20"
                                  : "bg-background/5"
                              )}
                            >
                              <StrikethroughIcon className="size-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {activeTab === "effects" && (
                  <motion.div
                    key={activeTab}
                    className="flex flex-col gap-8"
                    initial={{ y: 10 }}
                    animate={{ y: 0 }}
                    exit={{ y: -10 }}
                    transition={{
                      duration: 0.2,
                      type: "spring",
                      damping: 10,
                      stiffness: 100,
                      ease: "cubic-bezier(0.45, 0.05, 0.55, 0.95)",
                    }}
                  >
                    <div className="flex flex-col gap-4">
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
                        <>
                          <div className="flex flex-col gap-4">
                            <Slider
                              label="Grain"
                              min={0}
                              max={100}
                              step={1}
                              value={[grainIntensity]}
                              onValueChange={([value]) => {
                                setGrainIntensity(value);
                              }}
                            />
                          </div>
                        </>
                      )}

                      <Separator className="my-2" />

                      <Slider
                        label="Saturation"
                        min={0}
                        max={200}
                        step={1}
                        value={[saturation]}
                        onValueChange={([value]) => setSaturation(value)}
                      />
                      <Slider
                        label="Contrast"
                        min={5}
                        max={200}
                        step={1}
                        value={[contrast]}
                        onValueChange={([value]) => setContrast(value)}
                      />
                      <Slider
                        label="Brightness"
                        min={10}
                        max={200}
                        step={1}
                        value={[brightness]}
                        onValueChange={([value]) => setBrightness(value)}
                      />

                      <Separator className="my-2" />

                      <label className="text-sm text-muted-foreground">
                        Glow
                      </label>
                      <div className="flex items-center gap-2 w-full relative">
                        <Popover>
                          <PopoverTrigger asChild>
                            <span
                              className="w-6 h-6 rounded-full cursor-pointer aspect-square border border-primary/10 absolute left-2 top-1/2 -translate-y-1/2"
                              style={{ backgroundColor: textShadow.color }}
                            />
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-3" align="start">
                            <HexColorPicker
                              color={textShadow.color}
                              onChange={(color) =>
                                setTextShadow((prev) => ({ ...prev, color }))
                              }
                            />
                          </PopoverContent>
                        </Popover>
                        <Input
                          className="pl-10"
                          type="text"
                          value={
                            textShadow.color.startsWith("#")
                              ? textShadow.color
                              : `#${textShadow.color}`
                          }
                          placeholder="Glow Color"
                          onChange={(e) => {
                            const color = e.target.value.startsWith("#")
                              ? e.target.value
                              : `#${e.target.value}`;
                            setTextShadow((prev) => ({
                              ...prev,
                              color: color,
                            }));
                          }}
                        />
                      </div>

                      <div className="flex flex-col gap-2">
                        <Slider
                          label="Intensity"
                          min={0}
                          max={100}
                          step={1}
                          value={[textShadow.blur]}
                          onValueChange={([value]) =>
                            setTextShadow((prev) => ({
                              ...prev,
                              blur: value, // Store as percentage
                            }))
                          }
                          valueSubtext="%"
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Slider
                          label="Offset X"
                          min={-20}
                          max={20}
                          step={1}
                          value={[textShadow.offsetX]}
                          onValueChange={([value]) =>
                            setTextShadow((prev) => ({
                              ...prev,
                              offsetX: value,
                            }))
                          }
                        />
                      </div>

                      <div className="flex flex-col gap-2">
                        <Slider
                          label="Offset Y"
                          min={-20}
                          max={20}
                          step={1}
                          value={[textShadow.offsetY]}
                          onValueChange={([value]) =>
                            setTextShadow((prev) => ({
                              ...prev,
                              offsetY: value,
                            }))
                          }
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === "canvas" && (
                  <motion.div
                    key={activeTab}
                    className="flex flex-col gap-8"
                    initial={{ y: 10 }}
                    animate={{ y: 0 }}
                    exit={{ y: -10 }}
                    transition={{
                      duration: 0.2,
                      type: "spring",
                      damping: 10,
                      stiffness: 100,
                      ease: "cubic-bezier(0.45, 0.05, 0.55, 0.95)",
                    }}
                  >
                    <div className="flex flex-col gap-2">
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

                          <ExpandIcon
                            className={`size-4 transition-all duration-300`}
                          />
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
                                id="width-input"
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
                                id="height-input"
                              />
                            </div>
                            <Button
                              className="w-fit"
                              variant="accent"
                              onClick={() => {
                                const width = parseInt(
                                  (
                                    document.getElementById(
                                      "width-input"
                                    ) as HTMLInputElement
                                  ).value
                                );
                                const height = parseInt(
                                  (
                                    document.getElementById(
                                      "height-input"
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
                                  RESOLUTION_PRESETS.map(
                                    (preset) => preset.category
                                  )
                                )
                              ).map((category) => (
                                <div
                                  key={category}
                                  className="flex flex-col gap-2"
                                >
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
                    <Separator className="my-2" />
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-col gap-2 w-full">
                        <div className="flex flex-col gap-2">
                          <label className="text-sm text-muted-foreground">
                            Background
                          </label>
                          <div className="flex items-center gap-2 relative">
                            <Popover>
                              <PopoverTrigger asChild>
                                <span
                                  className="w-6 h-6 rounded-full cursor-pointer aspect-square border border-primary/10 absolute left-2 top-1/2 -translate-y-1/2"
                                  style={{ backgroundColor: backgroundColor }}
                                />
                              </PopoverTrigger>
                              <PopoverContent
                                className="w-auto p-3"
                                align="start"
                              >
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
                                "resize-none pl-10",
                                backgroundImage &&
                                "opacity-50 cursor-not-allowed"
                              )}
                              disabled={!!backgroundImage}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-center">
                        <span className="bg-secondary px-2 text-xs text-muted-foreground">
                          or
                        </span>
                      </div>
                      <div className="relative">
                        <label
                          className={`px-4 py-2 bg-foreground/5 rounded-xl hover:text-foreground/80 text-primary transition-all duration-300 flex items-center gap-2 cursor-pointer justify-center border border-primary/10 ${isUploading ? "opacity-50 cursor-not-allowed" : ""
                            }`}
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
                            <span className="animate-pulse">Uploading...</span>
                          ) : (
                            <>
                              <UploadIcon className="size-4" />
                              <span className="text-xs tracking-tight">
                                {backgroundImage
                                  ? "Change Image"
                                  : "Upload Image"}
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
                            className="rounded-xl mt-2 w-full"
                            variant="destructive"
                          >
                            <Trash2Icon className="size-4" />
                            <span className="text-xs tracking-tight">
                              Remove Image
                            </span>
                          </Button>
                        )}
                      </div>
                    </div>

                    {!backgroundImage && (
                      <>
                        <Separator className="my-2" />
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2 justify-between">
                            <label className="text-sm text-muted-foreground">
                              Palette
                            </label>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                className="p-0"
                                onClick={() => {
                                  generateNewPalette();
                                }}
                                disabled={numCircles >= 10}
                              >
                                <RefreshCcwIcon className="size-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                className="p-0"
                                onClick={() => {
                                  const newCircle = {
                                    color:
                                      colors[circles.length % colors.length],
                                    cx: Math.random() * 100,
                                    cy: Math.random() * 100,
                                  };
                                  setCircles([...circles, newCircle]);
                                  setNumCircles(circles.length + 1);
                                }}
                                disabled={numCircles >= 10}
                              >
                                <PlusIcon className="size-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                className="p-0"
                                onClick={resetPalette}
                                disabled={colors === INITIAL_COLORS}
                              >
                                <RotateCcwIcon className="size-4" />
                              </Button>
                            </div>
                          </div>
                          {circles.map((circle, i) => (
                            <div
                              key={i}
                              className="flex items-start gap-2 relative w-full"
                            >
                              <div
                                className="flex items-center gap-2 w-full"
                                onClick={() => {
                                  setActiveColorType("gradient");
                                  setActiveColor(i);
                                  setActiveColorPicker(circle.color);
                                }}
                              >
                                <div className="flex items-center gap-2 relative w-full">
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <span
                                        className="w-6 h-6 rounded-full cursor-pointer aspect-square border border-primary/10 absolute left-2 top-1/2 -translate-y-1/2"
                                        style={{
                                          backgroundColor: circle.color,
                                        }}
                                      />
                                    </PopoverTrigger>
                                    <PopoverContent
                                      className="w-auto p-3"
                                      align="start"
                                    >
                                      <HexColorPicker
                                        color={activeColorPicker}
                                        onChange={(color) => {
                                          setActiveColorPicker(color);
                                          handleColorChange(color);
                                        }}
                                      />
                                    </PopoverContent>
                                  </Popover>

                                  <Input
                                    type="text"
                                    value={
                                      circle.color.startsWith("#")
                                        ? circle.color
                                        : `#${circle.color}`
                                    }
                                    className="w-full pl-10 pr-4"
                                    placeholder="Color"
                                    onChange={(e) => {
                                      const color = e.target.value.startsWith(
                                        "#"
                                      )
                                        ? e.target.value
                                        : `#${e.target.value}`;
                                      updateColor(color, i);
                                    }}
                                  />
                                  <button
                                    className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer"
                                    onClick={() => {
                                      setCircles(
                                        circles.filter(
                                          (_, index) => index !== i
                                        )
                                      );
                                      setNumCircles(circles.length - 1);
                                    }}
                                  >
                                    <Trash2Icon className="size-4 text-muted-foreground hover:text-destructive transition-all duration-300" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </motion.div>
                )}
              </Suspense>
            </div>
          </div>
        </section>

        <Tabs
          value={activeTab}
          onValueChange={(value) =>
            setActiveTab(value as "design" | "canvas" | "effects")
          }
          className="flex items-center w-full border-t border-primary/10 bg-secondary"
        >
          <TabsList className="w-full flex items-center gap-1">
            <div className="flex items-center gap-2 min-w-full p-2 pb-8">
              {[
                { id: "design", icon: PaintbrushIcon },
                { id: "effects", icon: SparklesIcon },
                { id: "canvas", icon: CropIcon },
              ].map(({ id, icon: Icon }) => (
                <TabsTrigger
                  key={id}
                  value={id}
                  className={cn(
                    "flex-1 relative w-full px-4 py-4 cursor-pointer transition-all duration-300 rounded-2xl flex flex-col items-center justify-center",
                    activeTab === id && "bg-primary/10 border border-primary/50"
                  )}
                >
                  <Icon className="size-4" />
                </TabsTrigger>
              ))}
            </div>
          </TabsList>
        </Tabs>
      </aside>
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
