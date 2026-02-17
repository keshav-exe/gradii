export interface CircleProps {
  id?: string;
  name?: string;
  color: string;
  cx: number;
  cy: number;
  r?: number;
  visible?: boolean;
  locked?: boolean;
}

export interface FontOption {
  name: string;
  variable: boolean;
  weights: number[];
}

export interface Position {
  name: string;
  class: string;
}

export const INITIAL_COLORS = [
  "#001220", // Dark Blue
  "#FF6600", // Dark Orange
  "#002B50", // Navy Blue
  "#FFB366", // Light Orange
  "#004080", // Medium Blue
  "#FF8000", // Orange
  "#0066CC", // Bright Blue
  "#000000", // Black
  "#66A3FF", // Light Blue
];

export const INITIAL_BACKGROUND_COLORS = [
  "#0D1319", // Dark Blue
  "#0D151A", // Dark Navy Blue
  "#0D161C", // Dark Medium Blue
  "#0D171D", // Dark Bright Blue
  "#0D191F", // Dark Light Blue
  "#1A160D", // Dark Light Orange
  "#1A130D", // Dark Orange
  "#1A110D", // Dark Dark Orange
  "#0D0D0D", // Dark Black
];

export const FONTS: FontOption[] = [
  // Sans-serif fonts
  {
    name: "Bricolage Grotesque",
    variable: true,
    weights: [200, 300, 400, 500, 600, 700, 800],
  },
  {
    name: "Funnel Sans",
    variable: true,
    weights: [200, 300, 400, 500, 600, 700, 800],
  },
  {
    name: "Funnel Display",
    variable: true,
    weights: [200, 300, 400, 500, 600, 700, 800],
  },
  {
    name: "Geist",
    variable: true,
    weights: [100, 200, 300, 400, 500, 600, 700, 800, 900],
  },
  {
    name: "Inter",
    variable: true,
    weights: [100, 200, 300, 400, 500, 600, 700, 800, 900],
  },
  {
    name: "Manrope",
    variable: true,
    weights: [200, 300, 400, 500, 600, 700, 800],
  },
  {
    name: "Montserrat",
    variable: true,
    weights: [100, 200, 300, 400, 500, 600, 700, 800, 900],
  },
  {
    name: "Onest",
    variable: true,
    weights: [100, 200, 300, 400, 500, 600, 700, 800, 900],
  },
  {
    name: "Poppins",
    variable: false,
    weights: [100, 200, 300, 400, 500, 600, 700, 800, 900],
  },
  {
    name: "Space Grotesk",
    variable: true,
    weights: [300, 400, 500, 600, 700],
  },

  // Serif fonts
  {
    name: "DM Serif Display",
    variable: false,
    weights: [400],
  },
  {
    name: "Instrument Serif",
    variable: false,
    weights: [400],
  },
  {
    name: "Lora",
    variable: true,
    weights: [400, 500, 600, 700],
  },
  {
    name: "Ms Madi",
    variable: false,
    weights: [400],
  },

  // Monospace fonts
  {
    name: "Geist Mono",
    variable: true,
    weights: [100, 200, 300, 400, 500, 600, 700, 800, 900],
  },
  {
    name: "Space Mono",
    variable: false,
    weights: [400, 700],
  },
];

export interface ResolutionPreset {
  name: string;
  width: number;
  height: number;
  category: string;
}

export const RESOLUTION_PRESETS: ResolutionPreset[] = [
  {
    name: "16:9",
    width: 1920,
    height: 1080,
    category: "",
  },
  {
    name: "3:2",
    width: 1920,
    height: 1280,
    category: "",
  },
  {
    name: "4:3",
    width: 1920,
    height: 1440,
    category: "",
  },
  {
    name: "5:4",
    width: 1920,
    height: 1536,
    category: "",
  },
  {
    name: "1:1",
    width: 1920,
    height: 1920,
    category: "",
  },
  {
    name: "4:5",
    width: 1080,
    height: 1350,
    category: "",
  },
  {
    name: "3:4",
    width: 1080,
    height: 1440,
    category: "",
  },
  {
    name: "2:3",
    width: 1080,
    height: 1620,
    category: "",
  },
  {
    name: "9:16",
    width: 1080,
    height: 1920,
    category: "",
  },

  // Mobile Devices
  {
    name: "iPhone 15",
    width: 1179,
    height: 2556,
    category: "Mobile Devices",
  },
  {
    name: "iPhone 15 Pro",
    width: 1179,
    height: 2556,
    category: "Mobile Devices",
  },
  {
    name: "iPhone 15 Pro Max",
    width: 1290,
    height: 2796,
    category: "Mobile Devices",
  },
  {
    name: "Android (S)",
    width: 720,
    height: 1520,
    category: "Mobile Devices",
  },
  {
    name: "Android (M)",
    width: 1080,
    height: 2400,
    category: "Mobile Devices",
  },
  {
    name: "Android (L)",
    width: 1440,
    height: 3200,
    category: "Mobile Devices",
  },

  // Tablets
  { name: 'iPad Pro 12.9"', width: 2048, height: 2732, category: "Tablets" },
  { name: "iPad Air", width: 1668, height: 2388, category: "Tablets" },
  { name: "Samsung Tab S7", width: 2560, height: 1600, category: "Tablets" },

  // Desktop & Monitors
  {
    name: "2K (QHD)",
    width: 2560,
    height: 1440,
    category: "Desktop & Monitors",
  },
  {
    name: "Full HD",
    width: 1920,
    height: 1080,
    category: "Desktop & Monitors",
  },
  { name: "4K UHD", width: 3840, height: 2160, category: "Desktop & Monitors" },

  // Use:
  { name: "Open Graph", width: 1200, height: 630, category: "Metadata" },

  // Facebook
  { name: "Story/Reels", width: 1080, height: 1920, category: "Facebook" },
  { name: "Event Cover", width: 1920, height: 1005, category: "Facebook" },

  // Instagram
  { name: "Square Post", width: 1080, height: 1080, category: "Instagram" },
  { name: "Portrait Post", width: 1080, height: 1350, category: "Instagram" },
  { name: "Story/Reels", width: 1080, height: 1920, category: "Instagram" },

  // Twitter
  { name: "Post Image", width: 1600, height: 900, category: "Twitter" },
  { name: "Header", width: 1500, height: 500, category: "Twitter" },

  // LinkedIn
  { name: "Post", width: 1200, height: 627, category: "LinkedIn" },
  { name: "Banner", width: 1584, height: 396, category: "LinkedIn" },
];

export const BLUR_OPTIONS = [
  { name: "None", value: 0 },
  { name: "Low", value: 600 },
  { name: "Medium", value: 900 },
  { name: "High", value: 1200 },
] as const;

export const SAFARI_BLUR_OPTIONS = [
  { name: "None", value: 0 },
  { name: "Low", value: 400 },
  { name: "Medium", value: 600 },
  { name: "High", value: 800 },
] as const;

export interface AppProps {
  backgroundColor: string;
  fontSize: number;
  fontWeight: number;
  letterSpacing: number;
  fontFamily: string;
  opacity: number;
  lineHeight: number;
  text: string;
  circles: CircleProps[];
  textColor: string;
  generateNewPalette: () => void;
  downloadImage: () => void;
  isDownloading: boolean;
  previousCircles: CircleProps[];
  setCircles: (circles: CircleProps[]) => void;
  setPreviousCircles: (circles: CircleProps[]) => void;
  setActiveTab: (tab: "design" | "canvas" | "effects") => void;
  activeTab: "design" | "canvas" | "effects";
  setText: (text: string) => void;
  setFontFamily: (fontFamily: string) => void;
  setFontSize: (fontSize: number) => void;
  setFontWeight: (fontWeight: number) => void;
  setLetterSpacing: (letterSpacing: number) => void;
  setOpacity: (opacity: number) => void;
  setLineHeight: (lineHeight: number) => void;
  setBackgroundColor: (backgroundColor: string) => void;
  setActiveColorPicker: (color: string) => void;
  handleColorChange: (color: string) => void;
  setActiveColorType: (colorType: "gradient" | "background" | "text") => void;
  setActiveColor: (color: number) => void;
  updateColor: (color: string, index: number) => void;
  fonts: FontOption[];
  activeColorPicker: string;
  setTextColor: (textColor: string) => void;
  resolution: { width: number; height: number };
  setResolution: (res: { width: number; height: number }) => void;
  saturation: number;
  setSaturation: (value: number) => void;
  contrast: number;
  setContrast: (value: number) => void;
  brightness: number;
  setBrightness: (value: number) => void;
  blur: number;
  setBlur: (value: number) => void;
  backgroundImage: string | null;
  setBackgroundImage: (backgroundImage: string | null) => void;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isItalic: boolean;
  isUnderline: boolean;
  isStrikethrough: boolean;
  setIsItalic: (value: boolean) => void;
  setIsUnderline: (value: boolean) => void;
  setIsStrikethrough: (value: boolean) => void;
  numCircles: number;
  setNumCircles: (num: number) => void;
  colors: string[];
  isSafari: boolean;
  textShadow: {
    color: string;
    blur: number;
    offsetX: number;
    offsetY: number;
  };
  grainIntensity: number;
  setGrainIntensity: (value: number) => void;
  setTextShadow: React.Dispatch<
    React.SetStateAction<{
      color: string;
      blur: number;
      offsetX: number;
      offsetY: number;
    }>
  >;
  isUploading: boolean;
  setIsUploading: (isUploading: boolean) => void;
  textPosition: { x: number; y: number };
  setTextPosition: (position: { x: number; y: number }) => void;
  sizeMode: "text" | "image";
  logoImage: string | null;
  setTextMode: (mode: "text" | "image") => void;
  setLogoImage: (image: string | null) => void;
  textAlign: "left" | "center" | "right";
  setTextAlign: (align: "left" | "center" | "right") => void;
  foregroundVisible: boolean;
  setForegroundVisible: (visible: boolean) => void;
  foregroundLocked: boolean;
  setForegroundLocked: (locked: boolean) => void;
  copyImage: () => void;
  isCopying: boolean;
  setIsCopying: (isCopying: boolean) => void;
  handlePaletteChange: () => void;
  resetPalette: () => void;
}
