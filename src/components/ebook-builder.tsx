"use client";

import { useState } from "react";
import { PagesSidebar } from "./pages-sidebar";
import { PageEditor } from "./page-editor";
import { PagePreview } from "./page-preview";
import { ImagePanel } from "./image-panel";
import { Header } from "./header";
import { SettingsPanel } from "./settings-panel";
import { Sheet, SheetContent } from "./ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

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
  order: number;
  customStyles?: PageStyles;
}

interface Ebook {
  id: string;
  title: string;
  description: string | null;
  theme: Theme;
  pages: Page[];
}

interface EbookBuilderProps {
  initialEbook: Ebook;
}

export function EbookBuilder({ initialEbook }: EbookBuilderProps) {
  const [ebook, setEbook] = useState<Ebook>(initialEbook);
  const [selectedPageId, setSelectedPageId] = useState<string | null>(
    initialEbook.pages[0]?.id ?? null
  );
  const [imagePanelOpen, setImagePanelOpen] = useState(false);
  const [settingsPanelOpen, setSettingsPanelOpen] = useState(false);
  const [settingsPanelType, setSettingsPanelType] = useState<"theme" | "layout">("theme");
  const [logoSelectionMode, setLogoSelectionMode] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [mobileSidebarTab, setMobileSidebarTab] = useState<"pages" | "editor">("pages");

  const selectedPage = ebook.pages.find((p) => p.id === selectedPageId);

  const handlePageUpdate = (updates: Partial<Page>) => {
    setEbook((prev) => ({
      ...prev,
      pages: prev.pages.map((p) =>
        p.id === selectedPageId ? { ...p, ...updates } : p
      ),
    }));
  };

  const handleThemeUpdate = (theme: Theme) => {
    setEbook((prev) => ({
      ...prev,
      theme,
    }));
  };

  const handleLayoutUpdate = (template: string, customStyles?: PageStyles) => {
    if (selectedPage) {
      if (customStyles !== undefined) {
        handlePageUpdate({ template, customStyles });
      } else {
        handlePageUpdate({ template });
      }
    }
  };

  const handleOpenThemePanel = () => {
    setImagePanelOpen(false); // Close image panel
    setSettingsPanelType("theme");
    setSettingsPanelOpen(true);
  };

  const handleOpenLayoutPanel = () => {
    setImagePanelOpen(false); // Close image panel
    setSettingsPanelType("layout");
    setSettingsPanelOpen(true);
  };

  const handleOpenLogoPanel = () => {
    setLogoSelectionMode(true);
    setSettingsPanelOpen(false); // Close settings panel
    setImagePanelOpen(true);
  };

  const handleOpenImagePanel = () => {
    setLogoSelectionMode(false);
    setSettingsPanelOpen(false); // Close settings panel
    setImagePanelOpen(true);
  };

  const handleImageSelect = (url: string) => {
    if (logoSelectionMode) {
      // Update the branding logo URL in the current page's customStyles
      if (selectedPage) {
        const currentStyles = selectedPage.customStyles || {};
        const updatedStyles = {
          ...currentStyles,
          branding: {
            ...currentStyles.branding,
            enabled: currentStyles.branding?.enabled ?? true,
            type: currentStyles.branding?.type ?? "logo",
            text: currentStyles.branding?.text ?? "",
            logoUrl: url,
            position: currentStyles.branding?.position ?? "bottom-left",
            fontSize: currentStyles.branding?.fontSize ?? 10,
            color: currentStyles.branding?.color ?? ebook.theme.secondaryColor,
          },
        };
        handlePageUpdate({ customStyles: updatedStyles as PageStyles });
      }
      setLogoSelectionMode(false);
    } else {
      // Normal page image selection
      handlePageUpdate({ imageUrl: url });
    }
    setImagePanelOpen(false);
  };

  return (
    <div className="h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950">
      <Header
        ebook={ebook}
        onOpenThemePanel={handleOpenThemePanel}
        onOpenLayoutPanel={handleOpenLayoutPanel}
        onMobileSidebarToggle={() => setMobileSidebarOpen(true)}
      />

        <div className="flex-1 flex overflow-hidden">
          {/* Desktop: Two sidebars side-by-side | Mobile: Hidden, use Sheet instead */}
          <div className="hidden md:flex">
            {/* Left Sidebar - Pages */}
            <div className="w-64 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col">
              <PagesSidebar
                ebook={ebook}
                selectedPageId={selectedPageId}
                onSelectPage={setSelectedPageId}
                onPagesUpdate={(pages) => setEbook((prev) => ({ ...prev, pages }))}
              />
            </div>

            {/* Middle Sidebar - Editor */}
            <div className="w-96 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col">
              <PageEditor
                page={selectedPage}
                theme={ebook.theme}
                onUpdate={handlePageUpdate}
              />
            </div>
          </div>

          {/* Main Content - Preview */}
          <div className="flex-1 flex overflow-hidden min-w-0">
            <div className="flex-1 bg-zinc-100 dark:bg-zinc-950 overflow-auto">
              <PagePreview
                page={selectedPage}
                theme={ebook.theme}
                onOpenImagePanel={handleOpenImagePanel}
                pageIndex={selectedPage ? ebook.pages.findIndex(p => p.id === selectedPage.id) : 0}
                totalPages={ebook.pages.length}
              />
            </div>

            {/* Right Panels */}
            {imagePanelOpen && (
              <div className="w-[400px] border-l border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shrink-0">
                <ImagePanel
                  onClose={() => {
                    setImagePanelOpen(false);
                    setLogoSelectionMode(false);
                  }}
                  onSelectImage={handleImageSelect}
                />
              </div>
            )}

            {settingsPanelOpen && (
              <div className="w-[400px] border-l border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shrink-0">
                <SettingsPanel
                  isOpen={true}
                  onClose={() => setSettingsPanelOpen(false)}
                  type={settingsPanelType}
                  ebook={ebook}
                  page={selectedPage ?? null}
                  onThemeUpdate={handleThemeUpdate}
                  onLayoutUpdate={handleLayoutUpdate}
                  onOpenImagePanel={handleOpenLogoPanel}
                />
              </div>
            )}
          </div>
        </div>

        {/* Mobile Sheet with Tabs */}
        <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
          <SheetContent side="left" className="w-full sm:w-[400px] p-0">
            <Tabs value={mobileSidebarTab} onValueChange={(v) => setMobileSidebarTab(v as "pages" | "editor")} className="h-full flex flex-col">
              <TabsList className="w-full rounded-none border-b">
                <TabsTrigger value="pages" className="flex-1">Pages</TabsTrigger>
                <TabsTrigger value="editor" className="flex-1">Editor</TabsTrigger>
              </TabsList>
              <TabsContent value="pages" className="flex-1 m-0 overflow-hidden">
                <PagesSidebar
                  ebook={ebook}
                  selectedPageId={selectedPageId}
                  onSelectPage={(id) => {
                    setSelectedPageId(id);
                    setMobileSidebarTab("editor");
                  }}
                  onPagesUpdate={(pages) => setEbook((prev) => ({ ...prev, pages }))}
                />
              </TabsContent>
              <TabsContent value="editor" className="flex-1 m-0 overflow-hidden">
                <PageEditor
                  page={selectedPage}
                  theme={ebook.theme}
                  onUpdate={handlePageUpdate}
                />
              </TabsContent>
            </Tabs>
          </SheetContent>
        </Sheet>
      </div>
  );
}
