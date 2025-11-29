"use client";

import { useEffect, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Underline } from "@tiptap/extension-underline";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { ScrollArea } from "./ui/scroll-area";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Heading1,
  Heading2,
  Heading3,
  Code,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { updatePage } from "@/app/actions";
import { useDebouncedCallback } from "@/hooks/use-debounced-callback";

interface Page {
  id: string;
  title: string | null;
  content: string;
  template: string;
  imageUrl: string | null;
}

interface Theme {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
}

interface PageEditorProps {
  page: Page | undefined;
  theme: Theme;
  onUpdate: (updates: Partial<Page>) => void;
}

export function PageEditor({
  page,
  theme,
  onUpdate,
}: PageEditorProps) {
  const [title, setTitle] = useState(page?.title ?? "");
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [textColor, setTextColor] = useState("#000000");

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      Color,
    ],
    content: page?.content ?? "",
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      // Update preview immediately for real-time sync
      onUpdate({ content: html });
      // Save to database with debounce
      debouncedSave({ content: html });
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none focus:outline-none min-h-[400px] px-4 py-3",
      },
    },
  });

  const debouncedSave = useDebouncedCallback(
    async (updates: Partial<Page>) => {
      if (!page) return;
      await updatePage(page.id, updates);
    },
    1000
  );

  useEffect(() => {
    if (page) {
      setTitle(page.title ?? "");
      if (editor && editor.getHTML() !== page.content) {
        editor.commands.setContent(page.content);
      }
    }
  }, [page, editor]);

  const handleTitleChange = (value: string) => {
    setTitle(value);
    // Update preview immediately
    onUpdate({ title: value });
    // Save to database with debounce
    debouncedSave({ title: value });
  };

  const applyTextColor = (color: string) => {
    editor?.chain().focus().setColor(color).run();
    setTextColor(color);
  };

  if (!page || !editor) {
    return (
      <div className="h-full flex items-center justify-center text-zinc-500 dark:text-zinc-400">
        Select a page to edit
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Editor Header */}
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 space-y-4">
        <div>
          <Label htmlFor="page-title" className="text-xs text-zinc-600 dark:text-zinc-400">
            Page Title
          </Label>
          <Input
            id="page-title"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Enter page title..."
            className="mt-1.5"
          />
        </div>
      </div>

      {/* Toolbar */}
      <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 flex flex-wrap gap-1">
        <Button
          size="icon"
          variant={editor.isActive("bold") ? "default" : "ghost"}
          className="h-8 w-8"
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="w-4 h-4" />
        </Button>
        <Button
          size="icon"
          variant={editor.isActive("italic") ? "default" : "ghost"}
          className="h-8 w-8"
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="w-4 h-4" />
        </Button>
        <Button
          size="icon"
          variant={editor.isActive("underline") ? "default" : "ghost"}
          className="h-8 w-8"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <UnderlineIcon className="w-4 h-4" />
        </Button>

        <div className="w-px h-8 bg-zinc-200 dark:bg-zinc-700 mx-1" />

        <Button
          size="icon"
          variant={editor.isActive("heading", { level: 1 }) ? "default" : "ghost"}
          className="h-8 w-8"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        >
          <Heading1 className="w-4 h-4" />
        </Button>
        <Button
          size="icon"
          variant={editor.isActive("heading", { level: 2 }) ? "default" : "ghost"}
          className="h-8 w-8"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          <Heading2 className="w-4 h-4" />
        </Button>
        <Button
          size="icon"
          variant={editor.isActive("heading", { level: 3 }) ? "default" : "ghost"}
          className="h-8 w-8"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          <Heading3 className="w-4 h-4" />
        </Button>

        <div className="w-px h-8 bg-zinc-200 dark:bg-zinc-700 mx-1" />

        <Button
          size="icon"
          variant={editor.isActive("codeBlock") ? "default" : "ghost"}
          className="h-8 w-8"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        >
          <Code className="w-4 h-4" />
        </Button>

        <div className="w-px h-8 bg-zinc-200 dark:bg-zinc-700 mx-1" />

        <div className="flex items-center gap-1">
          <input
            type="color"
            value={textColor}
            onChange={(e) => applyTextColor(e.target.value)}
            className="h-8 w-8 rounded cursor-pointer border border-zinc-200 dark:border-zinc-700"
            title="Text Color"
          />
          <input
            type="text"
            value={textColor}
            onChange={(e) => {
              const hex = e.target.value;
              if (/^#[0-9A-Fa-f]{0,6}$/.test(hex)) {
                setTextColor(hex);
                if (hex.length === 7) {
                  applyTextColor(hex);
                }
              }
            }}
            className="h-8 w-20 px-2 text-xs font-mono rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
            placeholder="#000000"
            maxLength={7}
          />
        </div>
      </div>

      {/* Editor Content */}
      <ScrollArea className="flex-1">
        <EditorContent editor={editor} className="h-full" />
      </ScrollArea>
    </div>
  );
}
