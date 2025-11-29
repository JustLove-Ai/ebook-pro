"use client";

import { ScrollArea } from "./ui/scroll-area";
import Image from "next/image";
import { ImageIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface PageStyles {
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
    showPageNumber?: boolean;
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
    customPrimaryColor?: string;
    customAccentColor?: string;
    customBackgroundColor?: string;
    customTextColor?: string;
    customHeadingFont?: string;
    customBodyFont?: string;
    overlayEnabled?: boolean;
    overlayDarkness?: number;
    authorLabel?: string;
    authorName?: string;
    tagLine?: string;
    edition?: string;
  };
}

interface Page {
  id: string;
  title: string | null;
  content: string;
  template: string;
  imageUrl: string | null;
  customStyles?: PageStyles;
}

interface Theme {
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

interface PagePreviewProps {
  page: Page | undefined;
  theme: Theme;
  onOpenImagePanel: () => void;
  pageIndex?: number;
  totalPages?: number;
}

const PLACEHOLDER_CONTENT = `<h2>Your content here</h2><p>Start typing in the editor to see your content appear here. This is placeholder text to show the layout structure.</p><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>`;

const A4_WIDTH = 794;
const A4_HEIGHT = 1123;

export function PagePreview({ page, theme, onOpenImagePanel, pageIndex = 0, totalPages = 1 }: PagePreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const scaleFactor = Math.min(1, containerWidth / A4_WIDTH);
        setScale(scaleFactor);
      }
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);
  if (!page) {
    return (
      <div className="h-full flex items-center justify-center bg-zinc-100 dark:bg-zinc-950">
        <p className="text-zinc-400 dark:text-zinc-500">No page selected</p>
      </div>
    );
  }

  const hasContent = page.content && page.content !== "" && page.content !== "<p></p>";
  const displayContent = hasContent ? page.content : PLACEHOLDER_CONTENT;
  const hasImage = page.imageUrl !== null;

  // Get custom styles
  const headingAccent = page?.customStyles?.headingAccent;
  const imageStyle = page?.customStyles?.imageStyle;
  const footer = page?.customStyles?.footer;
  const branding = page?.customStyles?.branding;
  const coverSettings = page?.customStyles?.coverSettings;

  // Get effective cover colors (theme or custom)
  const getCoverColors = () => {
    const useThemeColors = coverSettings?.useThemeColors ?? true;
    return {
      primaryColor: useThemeColors ? theme.primaryColor : (coverSettings?.customPrimaryColor || theme.primaryColor),
      accentColor: useThemeColors ? theme.accentColor : (coverSettings?.customAccentColor || theme.accentColor),
      backgroundColor: useThemeColors ? theme.backgroundColor : (coverSettings?.customBackgroundColor || theme.backgroundColor),
      textColor: useThemeColors ? theme.textColor : (coverSettings?.customTextColor || "#ffffff"),
      secondaryColor: useThemeColors ? theme.secondaryColor : theme.secondaryColor,
    };
  };

  // Get effective cover fonts (theme or custom)
  const getCoverFonts = () => {
    const useThemeFonts = coverSettings?.useThemeFonts ?? true;
    return {
      headingFont: useThemeFonts ? theme.headingFont : (coverSettings?.customHeadingFont || theme.headingFont),
      bodyFont: useThemeFonts ? theme.bodyFont : (coverSettings?.customBodyFont || theme.bodyFont),
    };
  };

  const coverColors = getCoverColors();
  const coverFonts = getCoverFonts();

  // Get overlay settings
  const getOverlayOpacity = () => {
    const overlayEnabled = coverSettings?.overlayEnabled ?? true;
    if (!overlayEnabled) return 0;
    const darkness = coverSettings?.overlayDarkness ?? 50;
    return darkness / 100;
  };

  // Get editable cover text
  const getCoverText = () => ({
    authorLabel: coverSettings?.authorLabel || "Written by",
    authorName: coverSettings?.authorName || "Your Name Here",
    tagLine: coverSettings?.tagLine || "EXCLUSIVE",
    edition: coverSettings?.edition || "2024 EDITION",
  });

  const overlayOpacity = getOverlayOpacity();
  const coverText = getCoverText();

  // Format page number based on footer settings
  const getFormattedPageNumber = () => {
    if (!footer?.showPageNumber) return null;
    const actualPageNum = pageIndex + (footer.startFrom || 1);
    switch (footer.pageNumberFormat) {
      case "page-x":
        return `Page ${actualPageNum}`;
      case "x-of-y":
        return `${actualPageNum} of ${totalPages + (footer.startFrom || 1) - 1}`;
      default:
        return `${actualPageNum}`;
    }
  };

  // Get position classes for branding
  const getBrandingPosition = () => {
    if (!branding?.position) return "bottom-4 left-8";
    switch (branding.position) {
      case "bottom-left": return "bottom-4 left-8";
      case "bottom-right": return "bottom-4 right-8";
      case "bottom-center": return "bottom-4 left-1/2 -translate-x-1/2";
      default: return "bottom-4 left-8";
    }
  };

  // Generate accent bar styles for headings
  const getAccentBarStyles = () => {
    if (!headingAccent?.enabled) return "";

    const { position, thickness, color } = headingAccent;

    switch (position) {
      case "left":
        return `
          padding-left: ${thickness + 12}px;
          border-left: ${thickness}px solid ${color};
        `;
      case "right":
        return `
          padding-right: ${thickness + 12}px;
          border-right: ${thickness}px solid ${color};
        `;
      case "top":
        return `
          padding-top: ${thickness + 8}px;
          border-top: ${thickness}px solid ${color};
        `;
      case "bottom":
        return `
          padding-bottom: ${thickness + 8}px;
          border-bottom: ${thickness}px solid ${color};
        `;
      default:
        return "";
    }
  };

  const accentStyles = getAccentBarStyles();

  // Generate image container styles
  const getImageContainerStyles = (): React.CSSProperties => {
    if (!imageStyle) return {};

    const styles: React.CSSProperties = {};

    // Apply shape
    if (imageStyle.shape === "circle") {
      styles.borderRadius = "50%";
    } else if (imageStyle.shape === "rounded") {
      styles.borderRadius = `${imageStyle.borderRadius || 16}px`;
    } else {
      styles.borderRadius = "0px";
    }

    // Apply border
    if (imageStyle.borderEnabled) {
      styles.border = `${imageStyle.borderWidth}px solid ${imageStyle.borderColor}`;
    }

    return styles;
  };

  const imageContainerStyles = getImageContainerStyles();

  // Generate inline styles for page title headings (not inside preview-content)
  const getPageTitleStyles = (): React.CSSProperties => {
    const styles: React.CSSProperties = {};

    if (headingAccent?.enabled) {
      const { position, thickness, color } = headingAccent;

      switch (position) {
        case "left":
          styles.paddingLeft = `${thickness + 12}px`;
          styles.borderLeft = `${thickness}px solid ${color}`;
          break;
        case "right":
          styles.paddingRight = `${thickness + 12}px`;
          styles.borderRight = `${thickness}px solid ${color}`;
          break;
        case "top":
          styles.paddingTop = `${thickness + 8}px`;
          styles.borderTop = `${thickness}px solid ${color}`;
          break;
        case "bottom":
          styles.paddingBottom = `${thickness + 8}px`;
          styles.borderBottom = `${thickness}px solid ${color}`;
          break;
      }
    }

    return styles;
  };

  const pageTitleStyles = getPageTitleStyles();

  // Generate CSS for headings based on theme
  const headingStyles = `
    .preview-content h1 {
      font-family: ${theme.headingFont};
      font-size: ${theme.h1Size};
      color: ${theme.textColor};
      font-weight: 700;
      line-height: 1.2;
      margin-top: 1.5em;
      margin-bottom: 0.75em;
      ${accentStyles}
    }
    .preview-content h2 {
      font-family: ${theme.headingFont};
      font-size: ${theme.h2Size};
      color: ${theme.textColor};
      font-weight: 600;
      line-height: 1.3;
      margin-top: 1.25em;
      margin-bottom: 0.5em;
      ${accentStyles}
    }
    .preview-content h3 {
      font-family: ${theme.headingFont};
      font-size: ${theme.h3Size};
      color: ${theme.textColor};
      font-weight: 600;
      line-height: 1.4;
      margin-top: 1em;
      margin-bottom: 0.5em;
      ${accentStyles}
    }
    .preview-content p {
      font-family: ${theme.bodyFont};
      font-size: ${theme.bodySize};
      color: ${theme.textColor};
      line-height: 1.6;
      margin-bottom: 1em;
    }
  `;

  return (
    <ScrollArea className="h-full bg-zinc-100 dark:bg-zinc-950">
      <style>{headingStyles}</style>
      <div className="min-h-full p-4 sm:p-6 md:p-8 lg:p-12 flex items-start justify-center">
        {/* Container for scaling */}
        <div ref={containerRef} className="w-full max-w-[794px]">
          <div
            className="relative bg-white dark:bg-zinc-900 shadow-2xl origin-top-left"
            style={{
              width: `${A4_WIDTH}px`,
              height: `${A4_HEIGHT}px`,
              backgroundColor: theme.backgroundColor,
              color: theme.textColor,
              transform: `scale(${scale})`,
              transformOrigin: "top left",
            }}
          >
          {/* Template: Cover Page */}
          {page.template === "cover-page" && (
            <div
              onClick={onOpenImagePanel}
              className="relative w-full h-full overflow-hidden cursor-pointer group"
              style={{
                background: `linear-gradient(135deg, ${coverColors.primaryColor} 0%, ${coverColors.accentColor} 100%)`,
              }}
            >
              {/* Background Image with Overlay */}
              {hasImage ? (
                <>
                  <Image
                    src={page.imageUrl!}
                    alt={page.title || "Cover image"}
                    fill
                    className="object-cover"
                  />
                  {overlayOpacity > 0 && (
                    <div
                      className="absolute inset-0"
                      style={{
                        background: `linear-gradient(to bottom, rgba(0,0,0,${overlayOpacity * 0.8}), rgba(0,0,0,${overlayOpacity * 0.6}), rgba(0,0,0,${overlayOpacity * 0.9}))`,
                      }}
                    />
                  )}
                </>
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-black/5 to-black/10 group-hover:from-black/10 group-hover:to-black/15 transition-all" />
              )}

              {/* Content */}
              <div className="relative h-full flex flex-col items-center justify-center p-16 text-center">
                {/* Decorative Line */}
                <div className="w-24 h-1 bg-white/80 mb-8 rounded-full" />

                {/* Title */}
                <h1
                  className={`text-6xl font-bold mb-6 leading-tight ${!hasContent && !page.title ? "opacity-70" : ""}`}
                  style={{
                    color: hasImage ? "#ffffff" : coverColors.textColor,
                    fontFamily: coverFonts.headingFont,
                    textShadow: hasImage ? "0 4px 20px rgba(0,0,0,0.5)" : "none",
                  }}
                >
                  {page.title || "Your Book Title Here"}
                </h1>

                {/* Subtitle/Description - Better contrast */}
                <div
                  className={`preview-content prose prose-xl prose-invert max-w-2xl ${!hasContent ? "opacity-70" : ""}`}
                  dangerouslySetInnerHTML={{
                    __html: hasContent
                      ? page.content
                      : "<p>A captivating subtitle or description that draws readers in and sets the tone for your amazing content.</p>"
                  }}
                  style={{
                    color: hasImage ? "#ffffff" : coverColors.textColor,
                    fontFamily: coverFonts.bodyFont,
                    textShadow: hasImage ? "0 2px 10px rgba(0,0,0,0.5)" : "none",
                  }}
                />

                {/* Decorative Line */}
                <div className="w-24 h-1 bg-white/80 mt-8 rounded-full" />

                {/* Hint text when no image */}
                {!hasImage && (
                  <p className="mt-12 text-white/60 text-sm group-hover:text-white/80 transition-colors">
                    Click anywhere to add background image
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Template: Cover Bold - Large typography, striking design */}
          {page.template === "cover-bold" && (
            <div
              onClick={onOpenImagePanel}
              className="relative w-full h-full overflow-hidden cursor-pointer group"
              style={{ backgroundColor: coverColors.primaryColor }}
            >
              {/* Background Image */}
              {hasImage && (
                <>
                  <Image
                    src={page.imageUrl!}
                    alt={page.title || "Cover image"}
                    fill
                    className="object-cover"
                    style={{ opacity: 1 - overlayOpacity * 0.7 }}
                  />
                  {overlayOpacity > 0 && (
                    <div
                      className="absolute inset-0"
                      style={{
                        background: `linear-gradient(to top, rgba(0,0,0,${overlayOpacity}), transparent, rgba(0,0,0,${overlayOpacity * 0.5}))`,
                      }}
                    />
                  )}
                </>
              )}

              {/* Large diagonal accent */}
              <div
                className="absolute -right-32 -top-32 w-96 h-96 rounded-full opacity-20"
                style={{ backgroundColor: coverColors.accentColor }}
              />
              <div
                className="absolute -left-20 -bottom-20 w-64 h-64 rounded-full opacity-15"
                style={{ backgroundColor: coverColors.accentColor }}
              />

              {/* Content */}
              <div className="relative h-full flex flex-col justify-end p-16">
                {/* Accent bar */}
                <div
                  className="w-32 h-2 mb-8 rounded-full"
                  style={{ backgroundColor: coverColors.accentColor }}
                />

                {/* Title - Extra large */}
                <h1
                  className="text-7xl font-black mb-6 leading-none tracking-tight"
                  style={{
                    color: "#ffffff",
                    fontFamily: coverFonts.headingFont,
                  }}
                >
                  {page.title || "BOLD TITLE"}
                </h1>

                {/* Subtitle - Better contrast */}
                <div
                  className={`preview-content prose prose-xl prose-invert max-w-xl ${!hasContent ? "opacity-80" : ""}`}
                  dangerouslySetInnerHTML={{
                    __html: hasContent
                      ? page.content
                      : "<p>A powerful statement that captures attention</p>"
                  }}
                  style={{
                    color: "#ffffff",
                    fontFamily: coverFonts.bodyFont,
                    textShadow: "0 2px 4px rgba(0,0,0,0.3)",
                  }}
                />

                {!hasImage && (
                  <p className="mt-8 text-white/50 text-sm">Click to add background image</p>
                )}
              </div>
            </div>
          )}

          {/* Template: Cover Minimal - Clean, elegant simplicity */}
          {page.template === "cover-minimal" && (
            <div
              onClick={onOpenImagePanel}
              className="relative w-full h-full overflow-hidden cursor-pointer group"
              style={{ backgroundColor: coverColors.backgroundColor }}
            >
              {/* Subtle background pattern */}
              <div
                className="absolute inset-0 opacity-5"
                style={{
                  backgroundImage: `radial-gradient(${coverColors.primaryColor} 1px, transparent 1px)`,
                  backgroundSize: "20px 20px",
                }}
              />

              {/* Content centered */}
              <div className="relative h-full flex flex-col items-center justify-center p-16 text-center">
                {/* Small accent dot */}
                <div
                  className="w-3 h-3 rounded-full mb-12"
                  style={{ backgroundColor: coverColors.accentColor }}
                />

                {/* Title - Clean and spaced */}
                <h1
                  className="text-5xl font-light mb-8 tracking-widest uppercase"
                  style={{
                    color: coverColors.primaryColor,
                    fontFamily: coverFonts.headingFont,
                    letterSpacing: "0.2em",
                  }}
                >
                  {page.title || "Minimal"}
                </h1>

                {/* Thin line */}
                <div
                  className="w-16 h-px mb-8"
                  style={{ backgroundColor: coverColors.secondaryColor }}
                />

                {/* Subtitle - Better contrast */}
                <div
                  className={`preview-content prose max-w-md ${!hasContent ? "opacity-60" : ""}`}
                  dangerouslySetInnerHTML={{
                    __html: hasContent
                      ? page.content
                      : "<p>Less is more. Elegance in simplicity.</p>"
                  }}
                  style={{
                    color: coverColors.primaryColor,
                    fontFamily: coverFonts.bodyFont,
                    opacity: 0.8,
                  }}
                />

                {/* Small image circle at bottom */}
                {hasImage && (
                  <div
                    className="mt-16 w-24 h-24 rounded-full overflow-hidden border-2"
                    style={{ borderColor: coverColors.accentColor }}
                  >
                    <Image
                      src={page.imageUrl!}
                      alt="Cover"
                      width={96}
                      height={96}
                      className="object-cover w-full h-full"
                    />
                  </div>
                )}

                {!hasImage && (
                  <p className="mt-16 text-xs" style={{ color: coverColors.secondaryColor }}>Click to add image</p>
                )}
              </div>
            </div>
          )}

          {/* Template: Cover Split - Half image, half color block */}
          {page.template === "cover-split" && (
            <div className="relative w-full h-full overflow-hidden flex">
              {/* Left side - Color block with text */}
              <div
                className="w-1/2 h-full flex flex-col justify-center p-12"
                style={{ backgroundColor: coverColors.primaryColor }}
              >
                {/* Accent line */}
                <div
                  className="w-12 h-1 mb-8"
                  style={{ backgroundColor: coverColors.accentColor }}
                />

                {/* Title */}
                <h1
                  className="text-5xl font-bold mb-6 leading-tight"
                  style={{
                    color: "#ffffff",
                    fontFamily: coverFonts.headingFont,
                  }}
                >
                  {page.title || "Split Design"}
                </h1>

                {/* Subtitle - Better contrast */}
                <div
                  className={`preview-content prose prose-invert max-w-sm ${!hasContent ? "opacity-80" : ""}`}
                  dangerouslySetInnerHTML={{
                    __html: hasContent
                      ? page.content
                      : "<p>Balance of visual and text creates impact</p>"
                  }}
                  style={{
                    color: "#ffffff",
                    fontFamily: coverFonts.bodyFont,
                  }}
                />
              </div>

              {/* Right side - Image */}
              <div
                onClick={onOpenImagePanel}
                className="w-1/2 h-full cursor-pointer group relative"
                style={{ backgroundColor: coverColors.backgroundColor }}
              >
                {hasImage ? (
                  <Image
                    src={page.imageUrl!}
                    alt={page.title || "Cover image"}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-20" />
                      <p className="text-sm opacity-40">Click to add image</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Template: Cover Gradient - Vibrant gradients with floating elements */}
          {page.template === "cover-gradient" && (
            <div
              onClick={onOpenImagePanel}
              className="relative w-full h-full overflow-hidden cursor-pointer group"
              style={{
                background: `linear-gradient(135deg, ${coverColors.primaryColor} 0%, ${coverColors.accentColor} 50%, ${coverColors.secondaryColor} 100%)`,
              }}
            >
              {/* Floating shapes */}
              <div className="absolute top-20 right-20 w-40 h-40 rounded-full bg-white/10 blur-xl" />
              <div className="absolute bottom-40 left-10 w-60 h-60 rounded-full bg-white/10 blur-2xl" />
              <div className="absolute top-1/3 left-1/4 w-20 h-20 rounded-full bg-white/20 blur-lg" />

              {/* Background image overlay */}
              {hasImage && (
                <>
                  <Image
                    src={page.imageUrl!}
                    alt={page.title || "Cover image"}
                    fill
                    className="object-cover opacity-20 mix-blend-overlay"
                  />
                </>
              )}

              {/* Content */}
              <div className="relative h-full flex flex-col items-center justify-center p-16 text-center">
                {/* Glowing ring */}
                <div className="relative mb-8">
                  <div className="w-32 h-32 rounded-full border-2 border-white/30 flex items-center justify-center">
                    {hasImage ? (
                      <div className="w-28 h-28 rounded-full overflow-hidden">
                        <Image
                          src={page.imageUrl!}
                          alt="Icon"
                          width={112}
                          height={112}
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <span className="text-4xl">✨</span>
                    )}
                  </div>
                </div>

                {/* Title */}
                <h1
                  className="text-6xl font-bold mb-6 leading-tight"
                  style={{
                    color: "#ffffff",
                    fontFamily: coverFonts.headingFont,
                    textShadow: "0 4px 30px rgba(0,0,0,0.3)",
                  }}
                >
                  {page.title || "Gradient Glow"}
                </h1>

                {/* Subtitle - Better contrast */}
                <div
                  className={`preview-content prose prose-xl prose-invert max-w-xl ${!hasContent ? "opacity-80" : ""}`}
                  dangerouslySetInnerHTML={{
                    __html: hasContent
                      ? page.content
                      : "<p>Vibrant colors that capture attention and inspire action</p>"
                  }}
                  style={{
                    color: "#ffffff",
                    fontFamily: coverFonts.bodyFont,
                    textShadow: "0 2px 8px rgba(0,0,0,0.3)",
                  }}
                />
              </div>
            </div>
          )}

          {/* Template: Cover Author - Showcase author with photo */}
          {page.template === "cover-author" && (
            <div
              className="relative w-full h-full overflow-hidden"
              style={{ backgroundColor: coverColors.backgroundColor }}
            >
              {/* Decorative background */}
              <div
                className="absolute top-0 right-0 w-2/3 h-full"
                style={{
                  background: `linear-gradient(to left, ${coverColors.primaryColor}15, transparent)`,
                }}
              />

              {/* Content */}
              <div className="relative h-full flex flex-col justify-between p-16">
                {/* Top section - Title */}
                <div>
                  <h1
                    className="text-5xl font-bold mb-6 leading-tight max-w-lg"
                    style={{
                      color: coverColors.primaryColor,
                      fontFamily: coverFonts.headingFont,
                    }}
                  >
                    {page.title || "Author's Guide"}
                  </h1>

                  <div
                    className={`preview-content prose max-w-md ${!hasContent ? "opacity-70" : ""}`}
                    dangerouslySetInnerHTML={{
                      __html: hasContent
                        ? page.content
                        : "<p>Share your expertise with the world</p>"
                    }}
                    style={{
                      color: coverColors.primaryColor,
                      fontFamily: coverFonts.bodyFont,
                      opacity: 0.85,
                    }}
                  />
                </div>

                {/* Bottom section - Author info */}
                <div className="flex items-end gap-8">
                  {/* Author photo */}
                  <div
                    onClick={onOpenImagePanel}
                    className="w-48 h-48 rounded-full overflow-hidden cursor-pointer group border-4 shadow-2xl"
                    style={{ borderColor: coverColors.accentColor }}
                  >
                    {hasImage ? (
                      <Image
                        src={page.imageUrl!}
                        alt="Author"
                        width={192}
                        height={192}
                        className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-110"
                      />
                    ) : (
                      <div
                        className="w-full h-full flex items-center justify-center"
                        style={{ backgroundColor: coverColors.secondaryColor + "30" }}
                      >
                        <div className="text-center">
                          <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-30" />
                          <p className="text-xs opacity-50">Add photo</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Author name placeholder */}
                  <div className="pb-4">
                    <p className="text-sm uppercase tracking-widest mb-2" style={{ color: coverColors.secondaryColor }}>
                      {coverText.authorLabel}
                    </p>
                    <p className="text-2xl font-semibold" style={{ color: coverColors.primaryColor }}>
                      {coverText.authorName}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Template: Cover Magazine - Editorial, professional look */}
          {page.template === "cover-magazine" && (
            <div
              onClick={onOpenImagePanel}
              className="relative w-full h-full overflow-hidden cursor-pointer group"
              style={{ backgroundColor: "#000000" }}
            >
              {/* Full background image */}
              {hasImage ? (
                <>
                  <Image
                    src={page.imageUrl!}
                    alt={page.title || "Cover image"}
                    fill
                    className="object-cover"
                  />
                  {overlayOpacity > 0 && (
                    <div
                      className="absolute inset-0"
                      style={{
                        background: `linear-gradient(to top, rgba(0,0,0,${overlayOpacity}), rgba(0,0,0,${overlayOpacity * 0.3}), transparent)`,
                      }}
                    />
                  )}
                </>
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 to-black" />
              )}

              {/* Magazine-style header */}
              <div className="absolute top-0 left-0 right-0 p-8 flex justify-between items-start">
                <div
                  className="text-sm font-bold tracking-[0.3em] uppercase"
                  style={{ color: coverColors.accentColor }}
                >
                  {coverText.tagLine}
                </div>
                <div className="text-white/70 text-sm">
                  {coverText.edition}
                </div>
              </div>

              {/* Main title - Bottom positioned */}
              <div className="absolute bottom-0 left-0 right-0 p-12">
                {/* Category tag */}
                <div
                  className="inline-block px-4 py-1 mb-6 text-xs font-bold tracking-widest uppercase"
                  style={{
                    backgroundColor: coverColors.accentColor,
                    color: "#ffffff",
                  }}
                >
                  FEATURED
                </div>

                {/* Title */}
                <h1
                  className="text-6xl font-black mb-4 leading-none uppercase"
                  style={{
                    color: "#ffffff",
                    fontFamily: coverFonts.headingFont,
                  }}
                >
                  {page.title || "MAGAZINE"}
                </h1>

                {/* Subtitle - Better contrast */}
                <div
                  className={`preview-content prose prose-lg prose-invert max-w-xl ${!hasContent ? "opacity-80" : ""}`}
                  dangerouslySetInnerHTML={{
                    __html: hasContent
                      ? page.content
                      : "<p>The definitive guide you've been waiting for</p>"
                  }}
                  style={{
                    color: "#ffffff",
                    fontFamily: coverFonts.bodyFont,
                    textShadow: "0 2px 4px rgba(0,0,0,0.5)",
                  }}
                />

                {/* Bottom bar */}
                <div className="mt-8 pt-6 border-t border-white/30 flex gap-8 text-white/80 text-sm font-medium">
                  <span>Inside: 10 Chapters</span>
                  <span>Expert Insights</span>
                  <span>Bonus Content</span>
                </div>
              </div>

              {!hasImage && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-white/40 text-sm">Click to add cover image</p>
                </div>
              )}
            </div>
          )}

          {/* Template: Cover 3D - Depth and dimension */}
          {page.template === "cover-3d" && (
            <div
              className="relative w-full h-full overflow-hidden"
              style={{
                background: `linear-gradient(180deg, ${coverColors.backgroundColor} 0%, ${coverColors.primaryColor}20 100%)`,
              }}
            >
              {/* 3D perspective container */}
              <div className="absolute inset-0 flex items-center justify-center" style={{ perspective: "1000px" }}>
                {/* Floating card with 3D effect */}
                <div
                  onClick={onOpenImagePanel}
                  className="relative w-80 cursor-pointer group"
                  style={{
                    transform: "rotateY(-5deg) rotateX(5deg)",
                    transformStyle: "preserve-3d",
                  }}
                >
                  {/* Shadow */}
                  <div
                    className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-64 h-8 rounded-full blur-2xl opacity-30"
                    style={{ backgroundColor: coverColors.primaryColor }}
                  />

                  {/* Book cover */}
                  <div
                    className="relative aspect-[3/4] rounded-lg overflow-hidden shadow-2xl transition-transform duration-300 group-hover:scale-105"
                    style={{
                      boxShadow: `
                        20px 20px 60px ${coverColors.primaryColor}40,
                        -5px -5px 20px ${coverColors.backgroundColor}
                      `,
                    }}
                  >
                    {hasImage ? (
                      <Image
                        src={page.imageUrl!}
                        alt={page.title || "Cover"}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div
                        className="w-full h-full flex items-center justify-center"
                        style={{
                          background: `linear-gradient(135deg, ${coverColors.primaryColor}, ${coverColors.accentColor})`,
                        }}
                      >
                        <ImageIcon className="w-16 h-16 text-white/30" />
                      </div>
                    )}

                    {/* Spine effect */}
                    <div
                      className="absolute left-0 top-0 bottom-0 w-4"
                      style={{
                        background: `linear-gradient(to right, rgba(0,0,0,0.3), transparent)`,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Title below the 3D book */}
              <div className="absolute bottom-16 left-0 right-0 text-center px-16">
                <h1
                  className="text-4xl font-bold mb-4"
                  style={{
                    color: coverColors.primaryColor,
                    fontFamily: coverFonts.headingFont,
                  }}
                >
                  {page.title || "3D Book Cover"}
                </h1>

                <div
                  className={`preview-content prose max-w-md mx-auto ${!hasContent ? "opacity-70" : ""}`}
                  dangerouslySetInnerHTML={{
                    __html: hasContent
                      ? page.content
                      : "<p>Depth that draws readers in</p>"
                  }}
                  style={{
                    color: coverColors.primaryColor,
                    fontFamily: coverFonts.bodyFont,
                    opacity: 0.85,
                  }}
                />
              </div>
            </div>
          )}

          {/* Template: Text Only */}
          {page.template === "text-only" && (
            <div
              className="p-16 h-full relative"
              style={{
                backgroundImage: `
                  linear-gradient(to bottom, ${theme.backgroundColor}ee, ${theme.backgroundColor}),
                  repeating-linear-gradient(
                    0deg,
                    transparent,
                    transparent 2px,
                    ${theme.primaryColor}08 2px,
                    ${theme.primaryColor}08 4px
                  )
                `,
              }}
            >
              {/* Page Title if exists */}
              {page.title && (
                <h1
                  className="text-4xl font-bold mb-8 pb-4 border-b-2"
                  style={{
                    color: theme.primaryColor,
                    fontFamily: theme.headingFont,
                    borderColor: `${theme.accentColor}40`,
                    ...pageTitleStyles,
                  }}
                >
                  {page.title}
                </h1>
              )}
              <div
                className={`preview-content prose prose-lg max-w-none ${!hasContent ? "opacity-40" : ""}`}
                dangerouslySetInnerHTML={{ __html: displayContent }}
              />
            </div>
          )}

          {/* Template: Image Top */}
          {page.template === "image-top" && (
            <div className="h-full flex flex-col">
              <div
                className="relative w-full h-80 bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900 cursor-pointer group overflow-hidden"
                onClick={onOpenImagePanel}
                style={imageContainerStyles}
              >
                {hasImage ? (
                  <>
                    <Image
                      src={page.imageUrl!}
                      alt={page.title || "Page image"}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div
                      className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/30 to-transparent"
                    />
                  </>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center">
                        <ImageIcon className="w-8 h-8 text-zinc-400 dark:text-zinc-500" />
                      </div>
                      <p className="text-zinc-400 dark:text-zinc-500 text-sm font-medium group-hover:text-zinc-500 dark:group-hover:text-zinc-400 transition-colors">
                        Click to add image
                      </p>
                    </div>
                  </div>
                )}
              </div>
              <div className="p-16 flex-1">
                {page.title && (
                  <h1
                    className="text-4xl font-bold mb-6"
                    style={{
                      color: theme.primaryColor,
                      fontFamily: theme.headingFont,
                      ...pageTitleStyles,
                    }}
                  >
                    {page.title}
                  </h1>
                )}
                <div
                  className={`preview-content prose prose-lg max-w-none ${!hasContent ? "opacity-40" : ""}`}
                  dangerouslySetInnerHTML={{ __html: displayContent }}
                />
              </div>
            </div>
          )}

          {/* Template: Image Bottom */}
          {page.template === "image-bottom" && (
            <div className="h-full flex flex-col">
              <div className="p-16 flex-1">
                {page.title && (
                  <h1
                    className="text-4xl font-bold mb-6"
                    style={{
                      color: theme.primaryColor,
                      fontFamily: theme.headingFont,
                      ...pageTitleStyles,
                    }}
                  >
                    {page.title}
                  </h1>
                )}
                <div
                  className={`preview-content prose prose-lg max-w-none ${!hasContent ? "opacity-40" : ""}`}
                  dangerouslySetInnerHTML={{ __html: displayContent }}
                />
              </div>
              <div
                className="relative w-full h-80 bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900 cursor-pointer group overflow-hidden"
                onClick={onOpenImagePanel}
                style={imageContainerStyles}
              >
                {hasImage ? (
                  <>
                    <Image
                      src={page.imageUrl!}
                      alt={page.title || "Page image"}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div
                      className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/30 to-transparent"
                    />
                  </>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center">
                        <ImageIcon className="w-8 h-8 text-zinc-400 dark:text-zinc-500" />
                      </div>
                      <p className="text-zinc-400 dark:text-zinc-500 text-sm font-medium group-hover:text-zinc-500 dark:group-hover:text-zinc-400 transition-colors">
                        Click to add image
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Template: Two Column */}
          {page.template === "two-column" && (
            <div className="grid grid-cols-2 gap-10 p-16 h-full">
              <div
                className="relative h-full min-h-[500px] bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900 rounded-2xl overflow-hidden cursor-pointer group shadow-lg"
                onClick={onOpenImagePanel}
                style={{
                  boxShadow: `0 10px 40px ${theme.primaryColor}20`,
                  ...imageContainerStyles,
                }}
              >
                {hasImage ? (
                  <Image
                    src={page.imageUrl!}
                    alt={page.title || "Page image"}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div
                        className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center"
                        style={{
                          background: `linear-gradient(135deg, ${theme.primaryColor}30, ${theme.accentColor}30)`,
                        }}
                      >
                        <ImageIcon className="w-10 h-10 text-zinc-400 dark:text-zinc-500" />
                      </div>
                      <p className="text-zinc-400 dark:text-zinc-500 text-sm font-medium group-hover:text-zinc-500 dark:group-hover:text-zinc-400 transition-colors">
                        Click to add image
                      </p>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex flex-col justify-center">
                {page.title && (
                  <h1
                    className="text-3xl font-bold mb-6"
                    style={{
                      color: theme.primaryColor,
                      fontFamily: theme.headingFont,
                      ...pageTitleStyles,
                    }}
                  >
                    {page.title}
                  </h1>
                )}
                <div
                  className={`preview-content prose max-w-none ${!hasContent ? "opacity-40" : ""}`}
                  dangerouslySetInnerHTML={{ __html: displayContent }}
                />
              </div>
            </div>
          )}

          {/* Template: Blog Post */}
          {page.template === "blog-post" && (
            <div className="p-16 h-full">
              {page.title && (
                <h1
                  className="text-5xl font-bold mb-8"
                  style={{
                    color: theme.primaryColor,
                    fontFamily: theme.headingFont,
                    ...pageTitleStyles,
                  }}
                >
                  {page.title}
                </h1>
              )}
              <div className="grid grid-cols-3 gap-10 items-start">
                <div
                  className="relative h-72 bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900 rounded-xl overflow-hidden cursor-pointer group shadow-xl"
                  onClick={onOpenImagePanel}
                  style={{
                    boxShadow: `0 15px 50px ${theme.accentColor}25`,
                    ...imageContainerStyles,
                  }}
                >
                  {hasImage ? (
                    <Image
                      src={page.imageUrl!}
                      alt={page.title || "Page image"}
                      fill
                      className="object-cover transition-all duration-300 group-hover:scale-110 group-hover:rotate-1"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div
                          className="w-16 h-16 mx-auto mb-3 rounded-lg flex items-center justify-center"
                          style={{
                            background: `linear-gradient(135deg, ${theme.primaryColor}40, ${theme.accentColor}40)`,
                          }}
                        >
                          <ImageIcon className="w-8 h-8 text-zinc-400 dark:text-zinc-500" />
                        </div>
                        <p className="text-zinc-400 dark:text-zinc-500 text-xs font-medium group-hover:text-zinc-500 dark:group-hover:text-zinc-400 transition-colors">
                          Add image
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="col-span-2">
                  <div
                    className={`prose prose-lg max-w-none ${!hasContent ? "opacity-40" : ""}`}
                    dangerouslySetInnerHTML={{ __html: displayContent }}
                    style={{
                      color: theme.textColor,
                      fontFamily: theme.bodyFont,
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Template: Image Left */}
          {page.template === "image-left" && (
            <div className="p-16 h-full">
              {page.title && (
                <h1
                  className="text-4xl font-bold mb-6"
                  style={{
                    color: theme.primaryColor,
                    fontFamily: theme.headingFont,
                    ...pageTitleStyles,
                  }}
                >
                  {page.title}
                </h1>
              )}
              <div className="flex gap-8 items-start">
                <div
                  className="relative w-80 h-96 bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900 rounded-lg overflow-hidden cursor-pointer group shadow-lg shrink-0"
                  onClick={onOpenImagePanel}
                  style={{
                    boxShadow: `0 10px 40px ${theme.primaryColor}20`,
                    ...imageContainerStyles,
                  }}
                >
                  {hasImage ? (
                    <Image
                      src={page.imageUrl!}
                      alt={page.title || "Page image"}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div
                          className="w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center"
                          style={{
                            background: `linear-gradient(135deg, ${theme.primaryColor}30, ${theme.accentColor}30)`,
                          }}
                        >
                          <ImageIcon className="w-8 h-8 text-zinc-400 dark:text-zinc-500" />
                        </div>
                        <p className="text-zinc-400 dark:text-zinc-500 text-sm font-medium group-hover:text-zinc-500 dark:group-hover:text-zinc-400 transition-colors">
                          Click to add image
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div
                    className={`preview-content prose prose-lg max-w-none ${!hasContent ? "opacity-40" : ""}`}
                    dangerouslySetInnerHTML={{ __html: displayContent }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Template: Image Right */}
          {page.template === "image-right" && (
            <div className="p-16 h-full">
              {page.title && (
                <h1
                  className="text-4xl font-bold mb-6"
                  style={{
                    color: theme.primaryColor,
                    fontFamily: theme.headingFont,
                    ...pageTitleStyles,
                  }}
                >
                  {page.title}
                </h1>
              )}
              <div className="flex gap-8 items-start">
                <div className="flex-1">
                  <div
                    className={`preview-content prose prose-lg max-w-none ${!hasContent ? "opacity-40" : ""}`}
                    dangerouslySetInnerHTML={{ __html: displayContent }}
                  />
                </div>
                <div
                  className="relative w-80 h-96 bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900 rounded-lg overflow-hidden cursor-pointer group shadow-lg shrink-0"
                  onClick={onOpenImagePanel}
                  style={{
                    boxShadow: `0 10px 40px ${theme.primaryColor}20`,
                    ...imageContainerStyles,
                  }}
                >
                  {hasImage ? (
                    <Image
                      src={page.imageUrl!}
                      alt={page.title || "Page image"}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div
                          className="w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center"
                          style={{
                            background: `linear-gradient(135deg, ${theme.primaryColor}30, ${theme.accentColor}30)`,
                          }}
                        >
                          <ImageIcon className="w-8 h-8 text-zinc-400 dark:text-zinc-500" />
                        </div>
                        <p className="text-zinc-400 dark:text-zinc-500 text-sm font-medium group-hover:text-zinc-500 dark:group-hover:text-zinc-400 transition-colors">
                          Click to add image
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Template: Image Center */}
          {page.template === "image-center" && (
            <div className="p-16 h-full">
              {page.title && (
                <h1
                  className="text-4xl font-bold mb-8 text-center"
                  style={{
                    color: theme.primaryColor,
                    fontFamily: theme.headingFont,
                    ...pageTitleStyles,
                  }}
                >
                  {page.title}
                </h1>
              )}
              <div className="space-y-8">
                <div
                  className={`preview-content prose prose-lg max-w-none ${!hasContent ? "opacity-40" : ""}`}
                  dangerouslySetInnerHTML={{ __html: hasContent ? page.content.split('</p>')[0] + '</p>' : "<p>Your content here...</p>" }}
                />

                <div
                  className="relative w-full h-96 bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900 rounded-xl overflow-hidden cursor-pointer group shadow-xl mx-auto"
                  onClick={onOpenImagePanel}
                  style={{
                    maxWidth: "600px",
                    boxShadow: `0 15px 50px ${theme.accentColor}30`,
                    ...imageContainerStyles,
                  }}
                >
                  {hasImage ? (
                    <Image
                      src={page.imageUrl!}
                      alt={page.title || "Page image"}
                      fill
                      className="object-cover transition-all duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div
                          className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center"
                          style={{
                            background: `linear-gradient(135deg, ${theme.primaryColor}30, ${theme.accentColor}30)`,
                          }}
                        >
                          <ImageIcon className="w-10 h-10 text-zinc-400 dark:text-zinc-500" />
                        </div>
                        <p className="text-zinc-400 dark:text-zinc-500 text-sm font-medium group-hover:text-zinc-500 dark:group-hover:text-zinc-400 transition-colors">
                          Click to add image
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div
                  className={`preview-content prose prose-lg max-w-none ${!hasContent ? "opacity-40" : ""}`}
                  dangerouslySetInnerHTML={{ __html: hasContent && page.content.split('</p>').length > 1 ? page.content.split('</p>').slice(1).join('</p>') : "<p>More content here...</p>" }}
                />
              </div>
            </div>
          )}

          {/* Template: Full Image */}
          {page.template === "full-image" && (
            <div
              className="relative w-full h-full bg-gradient-to-br from-zinc-200 to-zinc-300 dark:from-zinc-800 dark:to-zinc-900 cursor-pointer group overflow-hidden"
              onClick={onOpenImagePanel}
            >
              {hasImage ? (
                <>
                  <Image
                    src={page.imageUrl!}
                    alt={page.title || "Page image"}
                    fill
                    className="object-cover"
                  />
                  <div
                    className="absolute inset-0"
                    style={{
                      background: `radial-gradient(circle at center, transparent 0%, ${theme.primaryColor}60 100%)`,
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/60" />
                </>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div
                      className="w-24 h-24 mx-auto mb-4 rounded-2xl flex items-center justify-center backdrop-blur-sm"
                      style={{
                        background: `linear-gradient(135deg, ${theme.primaryColor}50, ${theme.accentColor}50)`,
                      }}
                    >
                      <ImageIcon className="w-12 h-12 text-zinc-400 dark:text-zinc-500" />
                    </div>
                    <p className="text-zinc-400 dark:text-zinc-500 text-base font-medium group-hover:text-zinc-500 dark:group-hover:text-zinc-400 transition-colors">
                      Click to add full-page background image
                    </p>
                  </div>
                </div>
              )}
              <div className="absolute inset-0 flex items-center justify-center p-16">
                <div className="max-w-4xl text-center">
                  {page.title && (
                    <h1
                      className="text-6xl font-bold mb-8 drop-shadow-2xl"
                      style={{
                        color: hasImage ? "#ffffff" : theme.primaryColor,
                        fontFamily: theme.headingFont,
                        textShadow: hasImage ? "0 4px 30px rgba(0,0,0,0.7)" : "none",
                        ...pageTitleStyles,
                      }}
                    >
                      {page.title}
                    </h1>
                  )}
                  <div
                    className={`preview-content prose prose-xl prose-invert max-w-3xl mx-auto ${!hasContent ? "opacity-60" : ""}`}
                    dangerouslySetInnerHTML={{ __html: displayContent }}
                    style={{
                      color: hasImage ? "#ffffff" : theme.textColor,
                      textShadow: hasImage ? "0 2px 15px rgba(0,0,0,0.7)" : "none",
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Footer Line */}
          {footer?.enabled && (
            <div
              className="absolute left-8 right-8"
              style={{
                bottom: `${footer.margin}px`,
              }}
            >
              {footer.style === "line" && (
                <div
                  style={{
                    height: `${footer.thickness}px`,
                    backgroundColor: footer.color,
                  }}
                />
              )}
              {footer.style === "double-line" && (
                <div className="space-y-1">
                  <div
                    style={{
                      height: `${footer.thickness}px`,
                      backgroundColor: footer.color,
                    }}
                  />
                  <div
                    style={{
                      height: `${Math.max(1, footer.thickness - 1)}px`,
                      backgroundColor: footer.color,
                      opacity: 0.5,
                    }}
                  />
                </div>
              )}
              {footer.style === "gradient" && (
                <div
                  style={{
                    height: `${footer.thickness}px`,
                    background: `linear-gradient(to right, transparent, ${footer.color}, transparent)`,
                  }}
                />
              )}
            </div>
          )}

          {/* Page Number (now part of footer) */}
          {footer?.showPageNumber && (
            <div
              className="absolute bottom-3 left-1/2 -translate-x-1/2"
              style={{
                fontSize: "12px",
                color: footer.pageNumberColor || theme.textColor,
                fontFamily: theme.bodyFont,
              }}
            >
              {getFormattedPageNumber()}
            </div>
          )}

          {/* Branding */}
          {branding?.enabled && (
            <div
              className={`absolute ${getBrandingPosition()}`}
              style={{
                fontSize: `${branding.fontSize}px`,
                color: branding.color,
                fontFamily: theme.bodyFont,
              }}
            >
              {branding.type === "text" && branding.text}
              {branding.type === "logo" && branding.logoUrl && (
                <Image
                  src={branding.logoUrl}
                  alt="Logo"
                  width={60}
                  height={30}
                  className="object-contain"
                />
              )}
              {branding.type === "both" && (
                <div className="flex items-center gap-2">
                  {branding.logoUrl && (
                    <Image
                      src={branding.logoUrl}
                      alt="Logo"
                      width={40}
                      height={20}
                      className="object-contain"
                    />
                  )}
                  {branding.text && <span>{branding.text}</span>}
                </div>
              )}
            </div>
          )}
          </div>
        </div>
      </div>
    </ScrollArea>
  );
}
