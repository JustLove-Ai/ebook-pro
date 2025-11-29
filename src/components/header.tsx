"use client";

import { Button } from "./ui/button";
import { BookOpen, Download, Save, Palette, LayoutTemplate, PanelLeft } from "lucide-react";

interface Theme {
  id: string;
  name: string;
}

interface Ebook {
  id: string;
  title: string;
  theme: Theme;
}

interface HeaderProps {
  ebook: Ebook;
  onOpenThemePanel: () => void;
  onOpenLayoutPanel: () => void;
  onMobileSidebarToggle: () => void;
}

export function Header({
  ebook,
  onOpenThemePanel,
  onOpenLayoutPanel,
  onMobileSidebarToggle,
}: HeaderProps) {
  return (
    <header className="h-14 md:h-16 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl flex items-center justify-between px-3 sm:px-4 md:px-6 relative z-10">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 sm:h-8 sm:w-8 md:hidden"
          onClick={onMobileSidebarToggle}
        >
          <PanelLeft className="h-4 w-4" />
        </Button>
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-600/20 shrink-0">
          <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
        </div>
        <div className="hidden sm:block min-w-0">
          <h1 className="text-sm md:text-base font-semibold text-zinc-900 dark:text-zinc-100 truncate">
            {ebook.title}
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Ebook AI Builder
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1 sm:gap-2">
        <Button
          variant="outline"
          size="sm"
          className="gap-1 sm:gap-2 h-7 sm:h-8 text-xs sm:text-sm"
          onClick={onOpenLayoutPanel}
        >
          <LayoutTemplate className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span className="hidden sm:inline">Layout</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="gap-1 sm:gap-2 h-7 sm:h-8 text-xs sm:text-sm"
          onClick={onOpenThemePanel}
        >
          <Palette className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span className="hidden sm:inline">Theme</span>
        </Button>

        <div className="w-px h-4 sm:h-6 bg-zinc-200 dark:border-zinc-700 mx-0.5 sm:mx-1 hidden md:block" />

        <Button variant="ghost" size="sm" className="gap-1 sm:gap-2 h-7 sm:h-8 text-xs sm:text-sm hidden md:flex">
          <Save className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span className="hidden lg:inline">Save</span>
        </Button>
        <Button size="sm" className="gap-1 sm:gap-2 bg-blue-600 hover:bg-blue-700 h-7 sm:h-8 text-xs sm:text-sm">
          <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span className="hidden sm:inline">Export</span>
        </Button>
      </div>
    </header>
  );
}
