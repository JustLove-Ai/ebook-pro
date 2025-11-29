"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { ScrollArea } from "./ui/scroll-area";
import { X, Sparkles, Upload, Loader2 } from "lucide-react";
import Image from "next/image";

interface ImagePanelProps {
  onClose: () => void;
  onSelectImage: (url: string) => void;
}

export function ImagePanel({ onClose, onSelectImage }: ImagePanelProps) {
  const [aiPrompt, setAiPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const handleGenerateImage = async () => {
    if (!aiPrompt.trim()) return;

    setGenerating(true);
    try {
      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: aiPrompt }),
      });

      const data = await response.json();
      if (data.imageUrl) {
        setGeneratedImage(data.imageUrl);
      }
    } catch (error) {
      console.error("Failed to generate image:", error);
      alert("Failed to generate image. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload-image", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (data.imageUrl) {
        setUploadedImage(data.imageUrl);
      } else {
        alert("Failed to upload image");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload image. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
        <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
          Add Image
        </h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <Tabs defaultValue="ai" className="flex-1 flex flex-col">
        <TabsList className="mx-4 mt-4">
          <TabsTrigger value="ai" className="flex-1">
            <Sparkles className="w-4 h-4 mr-2" />
            AI Generate
          </TabsTrigger>
          <TabsTrigger value="upload" className="flex-1">
            <Upload className="w-4 h-4 mr-2" />
            Upload
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ai" className="flex-1 p-4 space-y-4">
          <div>
            <Label htmlFor="ai-prompt">Describe your image</Label>
            <Input
              id="ai-prompt"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="A beautiful sunset over mountains..."
              className="mt-2"
            />
          </div>

          <Button
            onClick={handleGenerateImage}
            disabled={generating || !aiPrompt.trim()}
            className="w-full"
          >
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Image
              </>
            )}
          </Button>

          {generatedImage && (
            <div className="space-y-3">
              <div className="relative w-full h-64 bg-zinc-100 dark:bg-zinc-800 rounded-lg overflow-hidden">
                <Image
                  src={generatedImage}
                  alt="Generated image"
                  fill
                  className="object-cover"
                />
              </div>
              <Button
                onClick={() => onSelectImage(generatedImage)}
                className="w-full"
              >
                Use This Image
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="upload" className="flex-1 p-4 space-y-4">
          <div>
            <Label htmlFor="image-file">Upload Image</Label>
            <div className="mt-2">
              <label
                htmlFor="image-file"
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  {uploading ? (
                    <Loader2 className="w-8 h-8 text-zinc-400 animate-spin mb-2" />
                  ) : (
                    <Upload className="w-8 h-8 text-zinc-400 mb-2" />
                  )}
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    {uploading ? "Uploading..." : "Click to upload"}
                  </p>
                  <p className="text-xs text-zinc-400 dark:text-zinc-500">
                    PNG, JPG, WEBP (MAX. 10MB)
                  </p>
                </div>
                <input
                  id="image-file"
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={uploading}
                />
              </label>
            </div>
          </div>

          {uploadedImage && (
            <div className="space-y-3">
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Preview:</p>
              <div className="relative w-full h-64 bg-zinc-100 dark:bg-zinc-800 rounded-lg overflow-hidden">
                <Image
                  src={uploadedImage}
                  alt="Uploaded preview"
                  fill
                  className="object-cover"
                />
              </div>
              <Button
                onClick={() => onSelectImage(uploadedImage)}
                className="w-full"
              >
                Use This Image
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
