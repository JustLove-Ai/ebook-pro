"use client";

import { X } from "lucide-react";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { getAllThemes, updateEbookTheme, updatePage, createTheme } from "@/app/actions";
import { useEffect, useState } from "react";
import { useDebouncedCallback } from "use-debounce";

interface Theme {
  id: string;
  name: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  headingFont: string;
  bodyFont: string;
  h1Size: string;
  h2Size: string;
  h3Size: string;
  bodySize: string;
}

const FONT_OPTIONS = [
  "Inter",
  "Playfair Display",
  "Lora",
  "Montserrat",
  "Open Sans",
  "Poppins",
  "Roboto",
  "Merriweather",
  "Source Sans Pro",
  "Raleway",
  "Nunito",
  "Helvetica",
  "Arial",
  "Georgia",
  "Garamond",
  "Times New Roman",
];

interface Ebook {
  id: string;
  title: string;
  theme: Theme;
}

interface Page {
  id: string;
  template: string;
  customStyles?: PageStyles;
}

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  type: "theme" | "layout";
  ebook: Ebook;
  page: Page | null;
  onThemeUpdate: (theme: Theme) => void;
  onLayoutUpdate: (template: string, customStyles?: PageStyles) => void;
  onOpenImagePanel?: () => void;
}

// Cover Design Templates
const COVER_TEMPLATES = [
  { value: "cover-page", label: "Classic Cover", description: "Full background image with centered title" },
  { value: "cover-bold", label: "Bold Modern", description: "Large typography, striking design" },
  { value: "cover-minimal", label: "Minimalist", description: "Clean, elegant simplicity" },
  { value: "cover-split", label: "Split Design", description: "Half image, half color block" },
  { value: "cover-gradient", label: "Gradient Glow", description: "Vibrant gradients with floating elements" },
  { value: "cover-author", label: "Author Focus", description: "Showcase author with photo" },
  { value: "cover-magazine", label: "Magazine Style", description: "Editorial, professional look" },
  { value: "cover-3d", label: "3D Effect", description: "Depth and dimension" },
];

// Content Page Templates
const CONTENT_TEMPLATES = [
  { value: "text-only", label: "Text Only", description: "Simple text layout" },
  { value: "image-top", label: "Image Top", description: "Image above text" },
  { value: "image-bottom", label: "Image Bottom", description: "Image below text" },
  { value: "two-column", label: "Two Column", description: "Image left, text right" },
  { value: "blog-post", label: "Blog Post", description: "Small image, large text" },
  { value: "full-image", label: "Full Image", description: "Text over full image" },
  { value: "image-left", label: "Image Left", description: "Image wraps text on right" },
  { value: "image-right", label: "Image Right", description: "Image wraps text on left" },
  { value: "image-center", label: "Image Center", description: "Centered image with text above & below" },
];

const TEMPLATES = [...COVER_TEMPLATES, ...CONTENT_TEMPLATES];

// Professional header style presets
const HEADER_PRESETS = [
  {
    name: "Classic Underline",
    description: "Traditional underline accent",
    headingAccent: {
      enabled: true,
      position: "bottom" as const,
      thickness: 2,
      color: "#3B82F6",
    },
  },
  {
    name: "Modern Left Bar",
    description: "Bold left accent bar",
    headingAccent: {
      enabled: true,
      position: "left" as const,
      thickness: 4,
      color: "#10B981",
    },
  },
  {
    name: "Elegant Top Line",
    description: "Subtle top accent",
    headingAccent: {
      enabled: true,
      position: "top" as const,
      thickness: 1,
      color: "#8B5CF6",
    },
  },
  {
    name: "Bold Side Accent",
    description: "Thick left border",
    headingAccent: {
      enabled: true,
      position: "left" as const,
      thickness: 6,
      color: "#F59E0B",
    },
  },
  {
    name: "Minimal Bottom",
    description: "Clean bottom border",
    headingAccent: {
      enabled: true,
      position: "bottom" as const,
      thickness: 3,
      color: "#6B7280",
    },
  },
  {
    name: "Academic Style",
    description: "Right-aligned accent",
    headingAccent: {
      enabled: true,
      position: "right" as const,
      thickness: 3,
      color: "#1E40AF",
    },
  },
  {
    name: "No Accent",
    description: "Plain headings",
    headingAccent: {
      enabled: false,
      position: "left" as const,
      thickness: 4,
      color: "#000000",
    },
  },
];

// Footer style presets
const FOOTER_PRESETS = [
  {
    name: "Simple Line",
    description: "Clean single line",
    footer: {
      enabled: true,
      style: "line" as const,
      thickness: 1,
      color: "#E5E7EB",
      margin: 40,
      showPageNumber: true,
    },
  },
  {
    name: "Bold Divider",
    description: "Thick accent line",
    footer: {
      enabled: true,
      style: "line" as const,
      thickness: 3,
      color: "#3B82F6",
      margin: 40,
      showPageNumber: true,
    },
  },
  {
    name: "Double Line",
    description: "Classic book style",
    footer: {
      enabled: true,
      style: "double-line" as const,
      thickness: 2,
      color: "#6B7280",
      margin: 40,
      showPageNumber: true,
    },
  },
  {
    name: "Gradient Fade",
    description: "Elegant gradient",
    footer: {
      enabled: true,
      style: "gradient" as const,
      thickness: 2,
      color: "#8B5CF6",
      margin: 40,
      showPageNumber: true,
    },
  },
  {
    name: "Page Number Only",
    description: "No line, just number",
    footer: {
      enabled: true,
      style: "none" as const,
      thickness: 1,
      color: "#9CA3AF",
      margin: 40,
      showPageNumber: true,
    },
  },
  {
    name: "No Footer",
    description: "Hide footer",
    footer: {
      enabled: false,
      style: "line" as const,
      thickness: 1,
      color: "#E5E7EB",
      margin: 40,
      showPageNumber: false,
    },
  },
];

// Branding presets
const BRANDING_PRESETS = [
  {
    name: "Text Only",
    description: "Company or ebook name",
    branding: {
      enabled: true,
      type: "text" as const,
      text: "",
      logoUrl: "",
      position: "bottom-left" as const,
      fontSize: 10,
      color: "#9CA3AF",
    },
  },
  {
    name: "Logo Only",
    description: "Your logo image",
    branding: {
      enabled: true,
      type: "logo" as const,
      text: "",
      logoUrl: "",
      position: "bottom-left" as const,
      fontSize: 10,
      color: "#9CA3AF",
    },
  },
  {
    name: "Logo + Text",
    description: "Logo with company name",
    branding: {
      enabled: true,
      type: "both" as const,
      text: "",
      logoUrl: "",
      position: "bottom-left" as const,
      fontSize: 10,
      color: "#9CA3AF",
    },
  },
  {
    name: "Centered Text",
    description: "Centered footer text",
    branding: {
      enabled: true,
      type: "text" as const,
      text: "",
      logoUrl: "",
      position: "bottom-center" as const,
      fontSize: 10,
      color: "#6B7280",
    },
  },
  {
    name: "Right Aligned",
    description: "Text on right side",
    branding: {
      enabled: true,
      type: "text" as const,
      text: "",
      logoUrl: "",
      position: "bottom-right" as const,
      fontSize: 10,
      color: "#9CA3AF",
    },
  },
  {
    name: "No Branding",
    description: "Hide branding",
    branding: {
      enabled: false,
      type: "text" as const,
      text: "",
      logoUrl: "",
      position: "bottom-left" as const,
      fontSize: 10,
      color: "#9CA3AF",
    },
  },
];

export interface PageStyles {
  headingAccent?: {
    enabled: boolean;
    position: "left" | "right" | "top" | "bottom";
    thickness: number;
    color: string;
  };
  imageStyle?: {
    borderEnabled: boolean;
    borderWidth: number;
    borderColor: string;
    borderRadius: number;
    shape: "square" | "rounded" | "circle";
  };
  footer?: {
    enabled: boolean;
    style: "line" | "double-line" | "gradient" | "none";
    thickness: number;
    color: string;
    margin: number;
    showPageNumber: boolean;
    pageNumberFormat?: "number" | "page-x" | "x-of-y";
    pageNumberColor?: string;
    startFrom?: number;
  };
  branding?: {
    enabled: boolean;
    type: "logo" | "text" | "both";
    text: string;
    logoUrl: string;
    position: "bottom-left" | "bottom-right" | "bottom-center";
    fontSize: number;
    color: string;
  };
  coverSettings?: {
    useThemeColors: boolean;
    useThemeFonts: boolean;
    // Custom overrides when not using theme
    customPrimaryColor?: string;
    customAccentColor?: string;
    customBackgroundColor?: string;
    customTextColor?: string;
    customHeadingFont?: string;
    customBodyFont?: string;
    // Overlay settings
    overlayEnabled?: boolean;
    overlayDarkness?: number; // 0-100
    // Editable cover text
    authorLabel?: string;
    authorName?: string;
    tagLine?: string;
    edition?: string;
  };
}

export function SettingsPanel({
  isOpen,
  onClose,
  type,
  ebook,
  page,
  onThemeUpdate,
  onLayoutUpdate,
  onOpenImagePanel,
}: SettingsPanelProps) {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [customTheme, setCustomTheme] = useState<Theme>(ebook.theme);
  const [pageStyles, setPageStyles] = useState<PageStyles>({
    headingAccent: {
      enabled: false,
      position: "left",
      thickness: 4,
      color: ebook.theme.accentColor,
    },
    imageStyle: {
      borderEnabled: false,
      borderWidth: 2,
      borderColor: ebook.theme.primaryColor,
      borderRadius: 16,
      shape: "square",
    },
    footer: {
      enabled: false,
      style: "line",
      thickness: 1,
      color: ebook.theme.accentColor,
      margin: 40,
      showPageNumber: false,
      pageNumberFormat: "number",
      pageNumberColor: ebook.theme.textColor,
      startFrom: 1,
    },
    branding: {
      enabled: false,
      type: "text",
      text: ebook.title || "My Ebook",
      logoUrl: "",
      position: "bottom-left",
      fontSize: 10,
      color: ebook.theme.secondaryColor,
    },
  });

  // Debounced save to database
  const debouncedSaveStyles = useDebouncedCallback(async (styles: PageStyles) => {
    if (!page) return;
    try {
      await updatePage(page.id, { customStyles: styles });
    } catch (error) {
      console.error("Failed to save page styles:", error);
    }
  }, 500);

  useEffect(() => {
    getAllThemes().then(setThemes);
  }, []);

  useEffect(() => {
    setCustomTheme(ebook.theme);
  }, [ebook.theme]);

  useEffect(() => {
    if (page?.customStyles) {
      setPageStyles(page.customStyles as PageStyles);
    } else {
      // Reset to defaults when switching pages
      setPageStyles({
        headingAccent: {
          enabled: false,
          position: "left",
          thickness: 4,
          color: ebook.theme.accentColor,
        },
        imageStyle: {
          borderEnabled: false,
          borderWidth: 2,
          borderColor: ebook.theme.primaryColor,
          borderRadius: 16,
          shape: "square",
        },
        footer: {
          enabled: false,
          style: "line",
          thickness: 1,
          color: ebook.theme.accentColor,
          margin: 40,
          showPageNumber: false,
          pageNumberFormat: "number",
          pageNumberColor: ebook.theme.textColor,
          startFrom: 1,
        },
        branding: {
          enabled: false,
          type: "text",
          text: ebook.title || "My Ebook",
          logoUrl: "",
          position: "bottom-left",
          fontSize: 10,
          color: ebook.theme.secondaryColor,
        },
      });
    }
  }, [page, ebook.theme, ebook.title]);

  // Update preview immediately and debounce save
  const handlePageStylesChange = (newStyles: PageStyles) => {
    setPageStyles(newStyles);
    // Update preview immediately
    if (page) {
      onLayoutUpdate(page.template, newStyles);
    }
    // Save to database with debounce
    debouncedSaveStyles(newStyles);
  };

  const handleThemeChange = async (themeId: string) => {
    const updatedEbook = await updateEbookTheme(ebook.id, themeId);
    onThemeUpdate(updatedEbook.theme);
  };

  const handleLayoutChange = async (template: string) => {
    if (!page) return;
    await updatePage(page.id, { template });
    onLayoutUpdate(template, pageStyles);
  };

  const handleCustomThemeUpdate = async (field: keyof Theme, value: string) => {
    setCustomTheme((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveCustomTheme = async () => {
    try {
      let customName = "Custom Theme";
      let counter = 1;
      while (themes.some(t => t.name === customName)) {
        customName = `Custom Theme ${counter}`;
        counter++;
      }

      const newTheme = await createTheme({
        name: customName,
        primaryColor: customTheme.primaryColor,
        secondaryColor: customTheme.secondaryColor,
        accentColor: customTheme.accentColor,
        backgroundColor: customTheme.backgroundColor,
        textColor: customTheme.textColor,
        headingFont: customTheme.headingFont,
        bodyFont: customTheme.bodyFont,
        h1Size: customTheme.h1Size,
        h2Size: customTheme.h2Size,
        h3Size: customTheme.h3Size,
        bodySize: customTheme.bodySize,
      });

      const updatedEbook = await updateEbookTheme(ebook.id, newTheme.id);
      onThemeUpdate(updatedEbook.theme);

      const allThemes = await getAllThemes();
      setThemes(allThemes);
    } catch (error) {
      console.error("Failed to save theme:", error);
      alert("Failed to save custom theme");
    }
  };

  const applyHeaderPreset = (preset: typeof HEADER_PRESETS[0]) => {
    const newStyles = {
      ...pageStyles,
      headingAccent: { ...preset.headingAccent },
    };
    handlePageStylesChange(newStyles);
  };

  const applyFooterPreset = (preset: typeof FOOTER_PRESETS[0]) => {
    const newStyles = {
      ...pageStyles,
      footer: {
        ...preset.footer,
        pageNumberFormat: pageStyles.footer?.pageNumberFormat || "number",
        pageNumberColor: pageStyles.footer?.pageNumberColor || ebook.theme.textColor,
        startFrom: pageStyles.footer?.startFrom || 1,
      },
    };
    handlePageStylesChange(newStyles);
  };

  const applyBrandingPreset = (preset: typeof BRANDING_PRESETS[0]) => {
    const newStyles = {
      ...pageStyles,
      branding: {
        ...preset.branding,
        text: pageStyles.branding?.text || ebook.title || "My Ebook",
        logoUrl: pageStyles.branding?.logoUrl || "",
      },
    };
    handlePageStylesChange(newStyles);
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-zinc-900">
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
        <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
          {type === "theme" ? "Theme & Styling" : "Page Layout"}
        </h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-hidden">
        {type === "theme" && (
          <Tabs defaultValue="presets" className="h-full flex flex-col">
            <div className="mx-4 mt-4 space-y-2">
              <TabsList className="grid grid-cols-4 w-full">
                <TabsTrigger value="presets" className="text-xs">Themes</TabsTrigger>
                <TabsTrigger value="custom" className="text-xs">Custom</TabsTrigger>
                <TabsTrigger value="headers" className="text-xs">Headers</TabsTrigger>
                <TabsTrigger value="styling" className="text-xs">Images</TabsTrigger>
              </TabsList>
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="footer" className="text-xs">Footer</TabsTrigger>
                <TabsTrigger value="branding" className="text-xs">Branding</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="presets" className="flex-1 overflow-y-auto p-4 space-y-3">
              <Label className="text-xs text-zinc-600 dark:text-zinc-400">
                Select Theme
              </Label>
              {themes.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => handleThemeChange(theme.id)}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                    theme.id === ebook.theme.id
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30"
                      : "border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600"
                  }`}
                >
                  <div className="font-medium text-sm text-zinc-900 dark:text-zinc-100 mb-2">
                    {theme.name}
                  </div>
                  <div className="flex gap-2">
                    <div
                      className="w-6 h-6 rounded border border-zinc-300 dark:border-zinc-600"
                      style={{ backgroundColor: theme.primaryColor }}
                    />
                    <div
                      className="w-6 h-6 rounded border border-zinc-300 dark:border-zinc-600"
                      style={{ backgroundColor: theme.accentColor }}
                    />
                    <div
                      className="w-6 h-6 rounded border border-zinc-300 dark:border-zinc-600"
                      style={{ backgroundColor: theme.backgroundColor }}
                    />
                  </div>
                </button>
              ))}
            </TabsContent>

            <TabsContent value="custom" className="flex-1 overflow-y-auto p-4 space-y-4">
              <div>
                <Label className="text-xs text-zinc-600 dark:text-zinc-400 mb-2 block">Colors</Label>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="primary-color" className="text-xs">Primary Color</Label>
                    <div className="flex gap-2 mt-1">
                      <input
                        type="color"
                        value={customTheme.primaryColor}
                        onChange={(e) => handleCustomThemeUpdate("primaryColor", e.target.value)}
                        className="h-9 w-16 rounded border border-zinc-200 dark:border-zinc-700 cursor-pointer"
                      />
                      <Input
                        value={customTheme.primaryColor}
                        onChange={(e) => handleCustomThemeUpdate("primaryColor", e.target.value)}
                        className="flex-1 font-mono text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="accent-color" className="text-xs">Accent Color</Label>
                    <div className="flex gap-2 mt-1">
                      <input
                        type="color"
                        value={customTheme.accentColor}
                        onChange={(e) => handleCustomThemeUpdate("accentColor", e.target.value)}
                        className="h-9 w-16 rounded border border-zinc-200 dark:border-zinc-700 cursor-pointer"
                      />
                      <Input
                        value={customTheme.accentColor}
                        onChange={(e) => handleCustomThemeUpdate("accentColor", e.target.value)}
                        className="flex-1 font-mono text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="bg-color" className="text-xs">Background Color</Label>
                    <div className="flex gap-2 mt-1">
                      <input
                        type="color"
                        value={customTheme.backgroundColor}
                        onChange={(e) => handleCustomThemeUpdate("backgroundColor", e.target.value)}
                        className="h-9 w-16 rounded border border-zinc-200 dark:border-zinc-700 cursor-pointer"
                      />
                      <Input
                        value={customTheme.backgroundColor}
                        onChange={(e) => handleCustomThemeUpdate("backgroundColor", e.target.value)}
                        className="flex-1 font-mono text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="text-color" className="text-xs">Text Color</Label>
                    <div className="flex gap-2 mt-1">
                      <input
                        type="color"
                        value={customTheme.textColor}
                        onChange={(e) => handleCustomThemeUpdate("textColor", e.target.value)}
                        className="h-9 w-16 rounded border border-zinc-200 dark:border-zinc-700 cursor-pointer"
                      />
                      <Input
                        value={customTheme.textColor}
                        onChange={(e) => handleCustomThemeUpdate("textColor", e.target.value)}
                        className="flex-1 font-mono text-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-xs text-zinc-600 dark:text-zinc-400 mb-2 block">Fonts</Label>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="heading-font" className="text-xs">Heading Font</Label>
                    <select
                      value={customTheme.headingFont}
                      onChange={(e) => handleCustomThemeUpdate("headingFont", e.target.value)}
                      className="w-full mt-1 h-9 px-3 rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm"
                    >
                      {FONT_OPTIONS.map((font) => (
                        <option key={font} value={font}>{font}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="body-font" className="text-xs">Body Font</Label>
                    <select
                      value={customTheme.bodyFont}
                      onChange={(e) => handleCustomThemeUpdate("bodyFont", e.target.value)}
                      className="w-full mt-1 h-9 px-3 rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm"
                    >
                      {FONT_OPTIONS.map((font) => (
                        <option key={font} value={font}>{font}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleSaveCustomTheme}
                className="w-full"
              >
                Create & Apply Custom Theme
              </Button>
            </TabsContent>

            <TabsContent value="headers" className="flex-1 overflow-y-auto p-4 space-y-4">
              <Label className="text-xs text-zinc-600 dark:text-zinc-400 block">
                Header Style Presets
              </Label>
              <div className="space-y-2">
                {HEADER_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => applyHeaderPreset(preset)}
                    className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                      pageStyles.headingAccent?.enabled === preset.headingAccent.enabled &&
                      pageStyles.headingAccent?.position === preset.headingAccent.position &&
                      pageStyles.headingAccent?.thickness === preset.headingAccent.thickness
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30"
                        : "border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Preview of the heading style */}
                      <div
                        className="w-20 h-8 flex items-center justify-center text-xs font-bold bg-zinc-100 dark:bg-zinc-800 rounded"
                        style={{
                          borderLeft: preset.headingAccent.enabled && preset.headingAccent.position === "left"
                            ? `${preset.headingAccent.thickness}px solid ${preset.headingAccent.color}` : undefined,
                          borderRight: preset.headingAccent.enabled && preset.headingAccent.position === "right"
                            ? `${preset.headingAccent.thickness}px solid ${preset.headingAccent.color}` : undefined,
                          borderTop: preset.headingAccent.enabled && preset.headingAccent.position === "top"
                            ? `${preset.headingAccent.thickness}px solid ${preset.headingAccent.color}` : undefined,
                          borderBottom: preset.headingAccent.enabled && preset.headingAccent.position === "bottom"
                            ? `${preset.headingAccent.thickness}px solid ${preset.headingAccent.color}` : undefined,
                          paddingLeft: preset.headingAccent.position === "left" ? "8px" : undefined,
                          paddingRight: preset.headingAccent.position === "right" ? "8px" : undefined,
                        }}
                      >
                        Heading
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-sm text-zinc-900 dark:text-zinc-100">
                          {preset.name}
                        </div>
                        <div className="text-xs text-zinc-500 dark:text-zinc-400">
                          {preset.description}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Custom header settings */}
              <div className="pt-4 border-t border-zinc-200 dark:border-zinc-700">
                <Label className="text-xs text-zinc-600 dark:text-zinc-400 mb-3 block">Custom Header Style</Label>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="accent-enabled" className="text-xs">Enable Accent Bar</Label>
                    <input
                      id="accent-enabled"
                      type="checkbox"
                      checked={pageStyles.headingAccent?.enabled}
                      onChange={(e) => handlePageStylesChange({
                        ...pageStyles,
                        headingAccent: { ...pageStyles.headingAccent!, enabled: e.target.checked }
                      })}
                      className="h-4 w-4 rounded border-zinc-300"
                    />
                  </div>

                  {pageStyles.headingAccent?.enabled && (
                    <>
                      <div>
                        <Label htmlFor="accent-position" className="text-xs">Position</Label>
                        <select
                          id="accent-position"
                          value={pageStyles.headingAccent.position}
                          onChange={(e) => handlePageStylesChange({
                            ...pageStyles,
                            headingAccent: { ...pageStyles.headingAccent!, position: e.target.value as any }
                          })}
                          className="w-full mt-1 h-9 px-3 rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm"
                        >
                          <option value="left">Left</option>
                          <option value="right">Right</option>
                          <option value="top">Top</option>
                          <option value="bottom">Bottom</option>
                        </select>
                      </div>

                      <div>
                        <Label htmlFor="accent-thickness" className="text-xs">Thickness (px)</Label>
                        <Input
                          id="accent-thickness"
                          type="number"
                          value={pageStyles.headingAccent.thickness}
                          onChange={(e) => handlePageStylesChange({
                            ...pageStyles,
                            headingAccent: { ...pageStyles.headingAccent!, thickness: parseInt(e.target.value) || 1 }
                          })}
                          className="mt-1"
                          min="1"
                          max="20"
                        />
                      </div>

                      <div>
                        <Label htmlFor="accent-color" className="text-xs">Color</Label>
                        <div className="flex gap-2 mt-1">
                          <input
                            type="color"
                            value={pageStyles.headingAccent.color}
                            onChange={(e) => handlePageStylesChange({
                              ...pageStyles,
                              headingAccent: { ...pageStyles.headingAccent!, color: e.target.value }
                            })}
                            className="h-9 w-16 rounded border border-zinc-200 dark:border-zinc-700 cursor-pointer"
                          />
                          <Input
                            value={pageStyles.headingAccent.color}
                            onChange={(e) => handlePageStylesChange({
                              ...pageStyles,
                              headingAccent: { ...pageStyles.headingAccent!, color: e.target.value }
                            })}
                            className="flex-1 font-mono text-xs"
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="styling" className="flex-1 overflow-y-auto p-4 space-y-4">
              <Label className="text-xs text-zinc-600 dark:text-zinc-400 mb-3 block">Image Styling</Label>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="image-shape" className="text-xs">Shape</Label>
                  <select
                    id="image-shape"
                    value={pageStyles.imageStyle?.shape}
                    onChange={(e) => handlePageStylesChange({
                      ...pageStyles,
                      imageStyle: { ...pageStyles.imageStyle!, shape: e.target.value as any }
                    })}
                    className="w-full mt-1 h-9 px-3 rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm"
                  >
                    <option value="square">Square</option>
                    <option value="rounded">Rounded</option>
                    <option value="circle">Circle</option>
                  </select>
                </div>

                {pageStyles.imageStyle?.shape === "rounded" && (
                  <div>
                    <Label htmlFor="border-radius" className="text-xs">Border Radius (px)</Label>
                    <Input
                      id="border-radius"
                      type="number"
                      value={pageStyles.imageStyle.borderRadius}
                      onChange={(e) => handlePageStylesChange({
                        ...pageStyles,
                        imageStyle: { ...pageStyles.imageStyle!, borderRadius: parseInt(e.target.value) || 0 }
                      })}
                      className="mt-1"
                      min="0"
                      max="100"
                    />
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <Label htmlFor="border-enabled" className="text-xs">Enable Border</Label>
                  <input
                    id="border-enabled"
                    type="checkbox"
                    checked={pageStyles.imageStyle?.borderEnabled}
                    onChange={(e) => handlePageStylesChange({
                      ...pageStyles,
                      imageStyle: { ...pageStyles.imageStyle!, borderEnabled: e.target.checked }
                    })}
                    className="h-4 w-4 rounded border-zinc-300"
                  />
                </div>

                {pageStyles.imageStyle?.borderEnabled && (
                  <>
                    <div>
                      <Label htmlFor="border-width" className="text-xs">Border Width (px)</Label>
                      <Input
                        id="border-width"
                        type="number"
                        value={pageStyles.imageStyle.borderWidth}
                        onChange={(e) => handlePageStylesChange({
                          ...pageStyles,
                          imageStyle: { ...pageStyles.imageStyle!, borderWidth: parseInt(e.target.value) || 1 }
                        })}
                        className="mt-1"
                        min="1"
                        max="20"
                      />
                    </div>

                    <div>
                      <Label htmlFor="border-color" className="text-xs">Border Color</Label>
                      <div className="flex gap-2 mt-1">
                        <input
                          type="color"
                          value={pageStyles.imageStyle.borderColor}
                          onChange={(e) => handlePageStylesChange({
                            ...pageStyles,
                            imageStyle: { ...pageStyles.imageStyle!, borderColor: e.target.value }
                          })}
                          className="h-9 w-16 rounded border border-zinc-200 dark:border-zinc-700 cursor-pointer"
                        />
                        <Input
                          value={pageStyles.imageStyle.borderColor}
                          onChange={(e) => handlePageStylesChange({
                            ...pageStyles,
                            imageStyle: { ...pageStyles.imageStyle!, borderColor: e.target.value }
                          })}
                          className="flex-1 font-mono text-xs"
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>
            </TabsContent>

            {/* Footer Tab */}
            <TabsContent value="footer" className="flex-1 overflow-y-auto p-4 space-y-4">
              <Label className="text-xs text-zinc-600 dark:text-zinc-400 block">
                Footer Style Presets
              </Label>
              <div className="space-y-2">
                {FOOTER_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => applyFooterPreset(preset)}
                    className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                      pageStyles.footer?.enabled === preset.footer.enabled &&
                      pageStyles.footer?.style === preset.footer.style &&
                      pageStyles.footer?.showPageNumber === preset.footer.showPageNumber
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30"
                        : "border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Preview of the footer style */}
                      <div className="w-20 h-8 flex flex-col items-center justify-end bg-zinc-100 dark:bg-zinc-800 rounded p-1">
                        {preset.footer.enabled && preset.footer.style === "line" && (
                          <div
                            className="w-full"
                            style={{ height: `${preset.footer.thickness}px`, backgroundColor: preset.footer.color }}
                          />
                        )}
                        {preset.footer.enabled && preset.footer.style === "double-line" && (
                          <div className="w-full space-y-0.5">
                            <div style={{ height: `${preset.footer.thickness}px`, backgroundColor: preset.footer.color }} />
                            <div style={{ height: `${preset.footer.thickness}px`, backgroundColor: preset.footer.color }} />
                          </div>
                        )}
                        {preset.footer.enabled && preset.footer.style === "gradient" && (
                          <div
                            className="w-full"
                            style={{
                              height: `${preset.footer.thickness}px`,
                              background: `linear-gradient(90deg, transparent, ${preset.footer.color}, transparent)`,
                            }}
                          />
                        )}
                        {preset.footer.showPageNumber && (
                          <span className="text-[8px] text-zinc-500 mt-0.5">1</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-sm text-zinc-900 dark:text-zinc-100">
                          {preset.name}
                        </div>
                        <div className="text-xs text-zinc-500 dark:text-zinc-400">
                          {preset.description}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Page Number Settings */}
              <div className="pt-4 border-t border-zinc-200 dark:border-zinc-700">
                <Label className="text-xs text-zinc-600 dark:text-zinc-400 mb-3 block">Page Number Options</Label>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="pagenum-enabled" className="text-xs">Show Page Numbers</Label>
                    <input
                      id="pagenum-enabled"
                      type="checkbox"
                      checked={pageStyles.footer?.showPageNumber}
                      onChange={(e) => handlePageStylesChange({
                        ...pageStyles,
                        footer: { ...pageStyles.footer!, showPageNumber: e.target.checked }
                      })}
                      className="h-4 w-4 rounded border-zinc-300"
                    />
                  </div>

                  {pageStyles.footer?.showPageNumber && (
                    <>
                      <div>
                        <Label htmlFor="pagenum-format" className="text-xs">Format</Label>
                        <select
                          id="pagenum-format"
                          value={pageStyles.footer?.pageNumberFormat || "number"}
                          onChange={(e) => handlePageStylesChange({
                            ...pageStyles,
                            footer: { ...pageStyles.footer!, pageNumberFormat: e.target.value as any }
                          })}
                          className="w-full mt-1 h-9 px-3 rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm"
                        >
                          <option value="number">1, 2, 3...</option>
                          <option value="page-x">Page 1, Page 2...</option>
                          <option value="x-of-y">1 of 10, 2 of 10...</option>
                        </select>
                      </div>

                      <div>
                        <Label htmlFor="pagenum-start" className="text-xs">Start From</Label>
                        <Input
                          id="pagenum-start"
                          type="number"
                          value={pageStyles.footer?.startFrom || 1}
                          onChange={(e) => handlePageStylesChange({
                            ...pageStyles,
                            footer: { ...pageStyles.footer!, startFrom: parseInt(e.target.value) || 1 }
                          })}
                          className="mt-1"
                          min="0"
                        />
                      </div>

                      <div>
                        <Label htmlFor="pagenum-color" className="text-xs">Color</Label>
                        <div className="flex gap-2 mt-1">
                          <input
                            type="color"
                            value={pageStyles.footer?.pageNumberColor || ebook.theme.textColor}
                            onChange={(e) => handlePageStylesChange({
                              ...pageStyles,
                              footer: { ...pageStyles.footer!, pageNumberColor: e.target.value }
                            })}
                            className="h-9 w-16 rounded border border-zinc-200 dark:border-zinc-700 cursor-pointer"
                          />
                          <Input
                            value={pageStyles.footer?.pageNumberColor || ebook.theme.textColor}
                            onChange={(e) => handlePageStylesChange({
                              ...pageStyles,
                              footer: { ...pageStyles.footer!, pageNumberColor: e.target.value }
                            })}
                            className="flex-1 font-mono text-xs"
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Custom Footer Settings */}
              {pageStyles.footer?.enabled && pageStyles.footer?.style !== "none" && (
                <div className="pt-4 border-t border-zinc-200 dark:border-zinc-700">
                  <Label className="text-xs text-zinc-600 dark:text-zinc-400 mb-3 block">Custom Line Settings</Label>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="footer-thickness" className="text-xs">Thickness (px)</Label>
                      <Input
                        id="footer-thickness"
                        type="number"
                        value={pageStyles.footer.thickness}
                        onChange={(e) => handlePageStylesChange({
                          ...pageStyles,
                          footer: { ...pageStyles.footer!, thickness: parseInt(e.target.value) || 1 }
                        })}
                        className="mt-1"
                        min="1"
                        max="10"
                      />
                    </div>

                    <div>
                      <Label htmlFor="footer-color" className="text-xs">Color</Label>
                      <div className="flex gap-2 mt-1">
                        <input
                          type="color"
                          value={pageStyles.footer.color}
                          onChange={(e) => handlePageStylesChange({
                            ...pageStyles,
                            footer: { ...pageStyles.footer!, color: e.target.value }
                          })}
                          className="h-9 w-16 rounded border border-zinc-200 dark:border-zinc-700 cursor-pointer"
                        />
                        <Input
                          value={pageStyles.footer.color}
                          onChange={(e) => handlePageStylesChange({
                            ...pageStyles,
                            footer: { ...pageStyles.footer!, color: e.target.value }
                          })}
                          className="flex-1 font-mono text-xs"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Branding Tab */}
            <TabsContent value="branding" className="flex-1 overflow-y-auto p-4 space-y-4">
              <Label className="text-xs text-zinc-600 dark:text-zinc-400 block">
                Branding Style Presets
              </Label>
              <div className="space-y-2">
                {BRANDING_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => applyBrandingPreset(preset)}
                    className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                      pageStyles.branding?.enabled === preset.branding.enabled &&
                      pageStyles.branding?.type === preset.branding.type &&
                      pageStyles.branding?.position === preset.branding.position
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30"
                        : "border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Preview of the branding style */}
                      <div className="w-20 h-8 flex items-end bg-zinc-100 dark:bg-zinc-800 rounded p-1 relative">
                        {preset.branding.enabled && (
                          <div
                            className={`absolute bottom-1 ${
                              preset.branding.position === "bottom-left" ? "left-1" :
                              preset.branding.position === "bottom-right" ? "right-1" :
                              "left-1/2 -translate-x-1/2"
                            }`}
                          >
                            {(preset.branding.type === "text" || preset.branding.type === "both") && (
                              <span className="text-[6px] text-zinc-500">Text</span>
                            )}
                            {preset.branding.type === "logo" && (
                              <div className="w-3 h-3 bg-zinc-400 rounded" />
                            )}
                            {preset.branding.type === "both" && (
                              <div className="flex items-center gap-0.5">
                                <div className="w-2 h-2 bg-zinc-400 rounded" />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-sm text-zinc-900 dark:text-zinc-100">
                          {preset.name}
                        </div>
                        <div className="text-xs text-zinc-500 dark:text-zinc-400">
                          {preset.description}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Branding Content */}
              {pageStyles.branding?.enabled && (
                <div className="pt-4 border-t border-zinc-200 dark:border-zinc-700">
                  <Label className="text-xs text-zinc-600 dark:text-zinc-400 mb-3 block">Branding Content</Label>
                  <div className="space-y-3">
                    {/* Text Input - Always show for text and both types */}
                    {(pageStyles.branding.type === "text" || pageStyles.branding.type === "both") && (
                      <div>
                        <Label htmlFor="branding-text" className="text-xs">Branding Text</Label>
                        <Input
                          id="branding-text"
                          value={pageStyles.branding.text}
                          onChange={(e) => handlePageStylesChange({
                            ...pageStyles,
                            branding: { ...pageStyles.branding!, text: e.target.value }
                          })}
                          className="mt-1"
                          placeholder="Company name or ebook title"
                        />
                      </div>
                    )}

                    {/* Logo Input - Show for logo and both types */}
                    {(pageStyles.branding.type === "logo" || pageStyles.branding.type === "both") && (
                      <div>
                        <Label className="text-xs">Logo Image</Label>
                        <button
                          onClick={() => onOpenImagePanel?.()}
                          className="w-full mt-1 p-4 rounded-lg border-2 border-dashed border-zinc-300 dark:border-zinc-600 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-all flex flex-col items-center justify-center gap-2"
                        >
                          {pageStyles.branding.logoUrl ? (
                            <img
                              src={pageStyles.branding.logoUrl}
                              alt="Logo"
                              className="h-8 max-w-full object-contain"
                            />
                          ) : (
                            <>
                              <div className="w-10 h-10 rounded-lg bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center">
                                <span className="text-zinc-500 text-lg">+</span>
                              </div>
                              <span className="text-xs text-zinc-500">Click to select logo</span>
                            </>
                          )}
                        </button>
                        {pageStyles.branding.logoUrl && (
                          <button
                            onClick={() => handlePageStylesChange({
                              ...pageStyles,
                              branding: { ...pageStyles.branding!, logoUrl: "" }
                            })}
                            className="text-xs text-red-500 hover:text-red-600 mt-1"
                          >
                            Remove logo
                          </button>
                        )}
                      </div>
                    )}

                    {/* Text styling options */}
                    {(pageStyles.branding.type === "text" || pageStyles.branding.type === "both") && (
                      <>
                        <div>
                          <Label htmlFor="branding-size" className="text-xs">Font Size (px)</Label>
                          <Input
                            id="branding-size"
                            type="number"
                            value={pageStyles.branding.fontSize}
                            onChange={(e) => handlePageStylesChange({
                              ...pageStyles,
                              branding: { ...pageStyles.branding!, fontSize: parseInt(e.target.value) || 10 }
                            })}
                            className="mt-1"
                            min="8"
                            max="20"
                          />
                        </div>

                        <div>
                          <Label htmlFor="branding-color" className="text-xs">Text Color</Label>
                          <div className="flex gap-2 mt-1">
                            <input
                              type="color"
                              value={pageStyles.branding.color}
                              onChange={(e) => handlePageStylesChange({
                                ...pageStyles,
                                branding: { ...pageStyles.branding!, color: e.target.value }
                              })}
                              className="h-9 w-16 rounded border border-zinc-200 dark:border-zinc-700 cursor-pointer"
                            />
                            <Input
                              value={pageStyles.branding.color}
                              onChange={(e) => handlePageStylesChange({
                                ...pageStyles,
                                branding: { ...pageStyles.branding!, color: e.target.value }
                              })}
                              className="flex-1 font-mono text-xs"
                            />
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}

        {type === "layout" && page && (
          <Tabs defaultValue="pages" className="h-full flex flex-col">
            <div className="px-4 pt-4">
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="pages" className="text-xs">Content Pages</TabsTrigger>
                <TabsTrigger value="covers" className="text-xs">Cover Designs</TabsTrigger>
              </TabsList>
            </div>

            {/* Content Pages Tab */}
            <TabsContent value="pages" className="flex-1 overflow-y-auto p-4 space-y-2">
              {CONTENT_TEMPLATES.map((template) => (
                <button
                  key={template.value}
                  onClick={() => handleLayoutChange(template.value)}
                  className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                    template.value === page.template
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30"
                      : "border-zinc-200 dark:border-zinc-700 hover:border-blue-300 dark:hover:border-blue-600"
                  }`}
                >
                  <div className="font-medium text-sm text-zinc-900 dark:text-zinc-100">
                    {template.label}
                  </div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                    {template.description}
                  </div>
                </button>
              ))}
            </TabsContent>

            {/* Cover Designs Tab */}
            <TabsContent value="covers" className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="grid grid-cols-2 gap-2">
                {COVER_TEMPLATES.map((template) => (
                  <button
                    key={template.value}
                    onClick={() => handleLayoutChange(template.value)}
                    className={`p-3 rounded-lg border-2 text-left transition-all ${
                      template.value === page.template
                        ? "border-purple-500 bg-purple-50 dark:bg-purple-950/30"
                        : "border-zinc-200 dark:border-zinc-700 hover:border-purple-300 dark:hover:border-purple-600"
                    }`}
                  >
                    <div className="font-medium text-xs text-zinc-900 dark:text-zinc-100">
                      {template.label}
                    </div>
                    <div className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                      {template.description}
                    </div>
                  </button>
                ))}
              </div>

              {/* Cover Theme Settings */}
              {page.template.startsWith("cover-") && (
                <div className="pt-4 border-t border-zinc-200 dark:border-zinc-700">
                  <Label className="text-xs text-zinc-600 dark:text-zinc-400 mb-3 block">
                    Cover Theme Settings
                  </Label>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-xs">Use Theme Colors</Label>
                        <p className="text-[10px] text-zinc-500">Apply selected theme colors to cover</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={pageStyles.coverSettings?.useThemeColors ?? true}
                        onChange={(e) => handlePageStylesChange({
                          ...pageStyles,
                          coverSettings: {
                            ...pageStyles.coverSettings,
                            useThemeColors: e.target.checked,
                            useThemeFonts: pageStyles.coverSettings?.useThemeFonts ?? true,
                          }
                        })}
                        className="h-4 w-4 rounded border-zinc-300"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-xs">Use Theme Fonts</Label>
                        <p className="text-[10px] text-zinc-500">Apply selected theme fonts to cover</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={pageStyles.coverSettings?.useThemeFonts ?? true}
                        onChange={(e) => handlePageStylesChange({
                          ...pageStyles,
                          coverSettings: {
                            ...pageStyles.coverSettings,
                            useThemeColors: pageStyles.coverSettings?.useThemeColors ?? true,
                            useThemeFonts: e.target.checked,
                          }
                        })}
                        className="h-4 w-4 rounded border-zinc-300"
                      />
                    </div>

                    {/* Custom Color Options when not using theme */}
                    {!pageStyles.coverSettings?.useThemeColors && (
                      <div className="pt-3 space-y-3 border-t border-zinc-100 dark:border-zinc-800">
                        <p className="text-[10px] text-zinc-500 font-medium">Custom Cover Colors</p>

                        <div>
                          <Label className="text-xs">Primary Color</Label>
                          <div className="flex gap-2 mt-1">
                            <input
                              type="color"
                              value={pageStyles.coverSettings?.customPrimaryColor || ebook.theme.primaryColor}
                              onChange={(e) => handlePageStylesChange({
                                ...pageStyles,
                                coverSettings: {
                                  ...pageStyles.coverSettings!,
                                  customPrimaryColor: e.target.value,
                                }
                              })}
                              className="h-8 w-12 rounded border border-zinc-200 dark:border-zinc-700 cursor-pointer"
                            />
                            <Input
                              value={pageStyles.coverSettings?.customPrimaryColor || ebook.theme.primaryColor}
                              onChange={(e) => handlePageStylesChange({
                                ...pageStyles,
                                coverSettings: {
                                  ...pageStyles.coverSettings!,
                                  customPrimaryColor: e.target.value,
                                }
                              })}
                              className="flex-1 font-mono text-xs h-8"
                            />
                          </div>
                        </div>

                        <div>
                          <Label className="text-xs">Accent Color</Label>
                          <div className="flex gap-2 mt-1">
                            <input
                              type="color"
                              value={pageStyles.coverSettings?.customAccentColor || ebook.theme.accentColor}
                              onChange={(e) => handlePageStylesChange({
                                ...pageStyles,
                                coverSettings: {
                                  ...pageStyles.coverSettings!,
                                  customAccentColor: e.target.value,
                                }
                              })}
                              className="h-8 w-12 rounded border border-zinc-200 dark:border-zinc-700 cursor-pointer"
                            />
                            <Input
                              value={pageStyles.coverSettings?.customAccentColor || ebook.theme.accentColor}
                              onChange={(e) => handlePageStylesChange({
                                ...pageStyles,
                                coverSettings: {
                                  ...pageStyles.coverSettings!,
                                  customAccentColor: e.target.value,
                                }
                              })}
                              className="flex-1 font-mono text-xs h-8"
                            />
                          </div>
                        </div>

                        <div>
                          <Label className="text-xs">Text Color</Label>
                          <div className="flex gap-2 mt-1">
                            <input
                              type="color"
                              value={pageStyles.coverSettings?.customTextColor || "#ffffff"}
                              onChange={(e) => handlePageStylesChange({
                                ...pageStyles,
                                coverSettings: {
                                  ...pageStyles.coverSettings!,
                                  customTextColor: e.target.value,
                                }
                              })}
                              className="h-8 w-12 rounded border border-zinc-200 dark:border-zinc-700 cursor-pointer"
                            />
                            <Input
                              value={pageStyles.coverSettings?.customTextColor || "#ffffff"}
                              onChange={(e) => handlePageStylesChange({
                                ...pageStyles,
                                coverSettings: {
                                  ...pageStyles.coverSettings!,
                                  customTextColor: e.target.value,
                                }
                              })}
                              className="flex-1 font-mono text-xs h-8"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Custom Font Options when not using theme */}
                    {!pageStyles.coverSettings?.useThemeFonts && (
                      <div className="pt-3 space-y-3 border-t border-zinc-100 dark:border-zinc-800">
                        <p className="text-[10px] text-zinc-500 font-medium">Custom Cover Fonts</p>

                        <div>
                          <Label className="text-xs">Heading Font</Label>
                          <select
                            value={pageStyles.coverSettings?.customHeadingFont || ebook.theme.headingFont}
                            onChange={(e) => handlePageStylesChange({
                              ...pageStyles,
                              coverSettings: {
                                ...pageStyles.coverSettings!,
                                customHeadingFont: e.target.value,
                              }
                            })}
                            className="w-full mt-1 h-8 px-2 rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs"
                          >
                            {FONT_OPTIONS.map((font) => (
                              <option key={font} value={font}>{font}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <Label className="text-xs">Body Font</Label>
                          <select
                            value={pageStyles.coverSettings?.customBodyFont || ebook.theme.bodyFont}
                            onChange={(e) => handlePageStylesChange({
                              ...pageStyles,
                              coverSettings: {
                                ...pageStyles.coverSettings!,
                                customBodyFont: e.target.value,
                              }
                            })}
                            className="w-full mt-1 h-8 px-2 rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs"
                          >
                            {FONT_OPTIONS.map((font) => (
                              <option key={font} value={font}>{font}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}

                    {/* Overlay Settings */}
                    <div className="pt-3 space-y-3 border-t border-zinc-100 dark:border-zinc-800">
                      <p className="text-[10px] text-zinc-500 font-medium">Image Overlay</p>

                      <div className="flex items-center justify-between">
                        <Label className="text-xs">Enable Overlay</Label>
                        <input
                          type="checkbox"
                          checked={pageStyles.coverSettings?.overlayEnabled ?? true}
                          onChange={(e) => handlePageStylesChange({
                            ...pageStyles,
                            coverSettings: {
                              ...pageStyles.coverSettings,
                              useThemeColors: pageStyles.coverSettings?.useThemeColors ?? true,
                              useThemeFonts: pageStyles.coverSettings?.useThemeFonts ?? true,
                              overlayEnabled: e.target.checked,
                            }
                          })}
                          className="h-4 w-4 rounded border-zinc-300"
                        />
                      </div>

                      {(pageStyles.coverSettings?.overlayEnabled ?? true) && (
                        <div>
                          <div className="flex justify-between items-center">
                            <Label className="text-xs">Overlay Darkness</Label>
                            <span className="text-xs text-zinc-500">{pageStyles.coverSettings?.overlayDarkness ?? 50}%</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={pageStyles.coverSettings?.overlayDarkness ?? 50}
                            onChange={(e) => handlePageStylesChange({
                              ...pageStyles,
                              coverSettings: {
                                ...pageStyles.coverSettings,
                                useThemeColors: pageStyles.coverSettings?.useThemeColors ?? true,
                                useThemeFonts: pageStyles.coverSettings?.useThemeFonts ?? true,
                                overlayDarkness: parseInt(e.target.value),
                              }
                            })}
                            className="w-full mt-1 h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer dark:bg-zinc-700"
                          />
                        </div>
                      )}
                    </div>

                    {/* Editable Cover Text */}
                    <div className="pt-3 space-y-3 border-t border-zinc-100 dark:border-zinc-800">
                      <p className="text-[10px] text-zinc-500 font-medium">Cover Text</p>

                      <div>
                        <Label className="text-xs">Author Label</Label>
                        <Input
                          value={pageStyles.coverSettings?.authorLabel ?? "Written by"}
                          onChange={(e) => handlePageStylesChange({
                            ...pageStyles,
                            coverSettings: {
                              ...pageStyles.coverSettings,
                              useThemeColors: pageStyles.coverSettings?.useThemeColors ?? true,
                              useThemeFonts: pageStyles.coverSettings?.useThemeFonts ?? true,
                              authorLabel: e.target.value,
                            }
                          })}
                          className="mt-1 h-8 text-xs"
                          placeholder="Written by"
                        />
                      </div>

                      <div>
                        <Label className="text-xs">Author Name</Label>
                        <Input
                          value={pageStyles.coverSettings?.authorName ?? ""}
                          onChange={(e) => handlePageStylesChange({
                            ...pageStyles,
                            coverSettings: {
                              ...pageStyles.coverSettings,
                              useThemeColors: pageStyles.coverSettings?.useThemeColors ?? true,
                              useThemeFonts: pageStyles.coverSettings?.useThemeFonts ?? true,
                              authorName: e.target.value,
                            }
                          })}
                          className="mt-1 h-8 text-xs"
                          placeholder="Your Name Here"
                        />
                      </div>

                      <div>
                        <Label className="text-xs">Tag Line</Label>
                        <Input
                          value={pageStyles.coverSettings?.tagLine ?? ""}
                          onChange={(e) => handlePageStylesChange({
                            ...pageStyles,
                            coverSettings: {
                              ...pageStyles.coverSettings,
                              useThemeColors: pageStyles.coverSettings?.useThemeColors ?? true,
                              useThemeFonts: pageStyles.coverSettings?.useThemeFonts ?? true,
                              tagLine: e.target.value,
                            }
                          })}
                          className="mt-1 h-8 text-xs"
                          placeholder="EXCLUSIVE, FEATURED, etc."
                        />
                      </div>

                      <div>
                        <Label className="text-xs">Edition</Label>
                        <Input
                          value={pageStyles.coverSettings?.edition ?? ""}
                          onChange={(e) => handlePageStylesChange({
                            ...pageStyles,
                            coverSettings: {
                              ...pageStyles.coverSettings,
                              useThemeColors: pageStyles.coverSettings?.useThemeColors ?? true,
                              useThemeFonts: pageStyles.coverSettings?.useThemeFonts ?? true,
                              edition: e.target.value,
                            }
                          })}
                          className="mt-1 h-8 text-xs"
                          placeholder="2024 EDITION"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
