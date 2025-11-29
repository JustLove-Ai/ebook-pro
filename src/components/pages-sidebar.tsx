"use client";

import { ScrollArea } from "./ui/scroll-area";
import { Button } from "./ui/button";
import { Plus, GripVertical, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { createPage, deletePage, reorderPages } from "@/app/actions";
import { useState } from "react";
import { motion } from "framer-motion";

interface Page {
  id: string;
  title: string | null;
  content: string;
  template: string;
  imageUrl: string | null;
  order: number;
}

interface Ebook {
  id: string;
  pages: Page[];
}

interface PagesSidebarProps {
  ebook: Ebook;
  selectedPageId: string | null;
  onSelectPage: (id: string) => void;
  onPagesUpdate: (pages: Page[]) => void;
}

export function PagesSidebar({
  ebook,
  selectedPageId,
  onSelectPage,
  onPagesUpdate,
}: PagesSidebarProps) {
  const [loading, setLoading] = useState(false);

  const handleCreatePage = async () => {
    setLoading(true);
    try {
      const newPage = await createPage(ebook.id);
      onPagesUpdate([...ebook.pages, newPage]);
      onSelectPage(newPage.id);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePage = async (pageId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (ebook.pages.length === 1) {
      alert("Cannot delete the last page");
      return;
    }

    try {
      await deletePage(pageId);
      const updatedPages = ebook.pages.filter((p) => p.id !== pageId);
      onPagesUpdate(updatedPages);
      if (selectedPageId === pageId) {
        onSelectPage(updatedPages[0]?.id ?? "");
      }
    } catch (error) {
      console.error("Failed to delete page:", error);
    }
  };

  const handleMoveUp = async (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (index === 0) return;

    const newPages = [...ebook.pages];
    [newPages[index - 1], newPages[index]] = [newPages[index], newPages[index - 1]];

    newPages.forEach((page, i) => {
      page.order = i;
    });

    onPagesUpdate(newPages);
    await reorderPages(
      ebook.id,
      newPages.map((p) => p.id)
    );
  };

  const handleMoveDown = async (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (index === ebook.pages.length - 1) return;

    const newPages = [...ebook.pages];
    [newPages[index + 1], newPages[index]] = [newPages[index], newPages[index + 1]];

    newPages.forEach((page, i) => {
      page.order = i;
    });

    onPagesUpdate(newPages);
    await reorderPages(
      ebook.id,
      newPages.map((p) => p.id)
    );
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
        <Button
          onClick={handleCreatePage}
          disabled={loading}
          className="w-full gap-2"
          size="sm"
        >
          <Plus className="w-4 h-4" />
          Add Page
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-3 space-y-1.5">
          {ebook.pages.map((page, index) => (
            <motion.div
              key={page.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
            >
              <div
                onClick={() => onSelectPage(page.id)}
                className={cn(
                  "group relative rounded-lg p-3 cursor-pointer transition-all duration-150",
                  selectedPageId === page.id
                    ? "bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800"
                    : "bg-white dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600"
                )}
              >
                <div className="flex items-start gap-2 pr-24">
                  <GripVertical className="w-4 h-4 text-zinc-400 dark:text-zinc-500 mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 line-clamp-2 break-words">
                      {page.title || "Untitled"}
                    </p>
                  </div>
                </div>

                <div className="absolute right-2 top-2 flex gap-0.5 bg-white/90 dark:bg-zinc-800/90 rounded-md p-0.5 backdrop-blur-sm border border-zinc-200 dark:border-zinc-700">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6"
                    onClick={(e) => handleMoveUp(index, e)}
                    disabled={index === 0}
                  >
                    <ChevronUp className="w-3 h-3" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6"
                    onClick={(e) => handleMoveDown(index, e)}
                    disabled={index === ebook.pages.length - 1}
                  >
                    <ChevronDown className="w-3 h-3" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-950 dark:hover:text-red-400"
                    onClick={(e) => handleDeletePage(page.id, e)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
