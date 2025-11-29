"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Loader2, Sparkles, X, CheckCircle2 } from "lucide-react";
import { Progress } from "./ui/progress";

interface AIGenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (description: string) => Promise<void>;
  ebookId: string;
}

type GenerationStage = "idle" | "outline" | "expanding" | "complete";

export function AIGenerationModal({ isOpen, onClose, onGenerate, ebookId }: AIGenerationModalProps) {
  const [description, setDescription] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [stage, setStage] = useState<GenerationStage>("idle");
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState("");
  const [outline, setOutline] = useState<string[]>([]);
  const [abortController, setAbortController] = useState<AbortController | null>(null);

  const handleGenerate = async () => {
    if (!description.trim()) return;

    setIsGenerating(true);
    setStage("outline");
    setProgress(10);
    setCurrentStep("Creating outline...");

    const controller = new AbortController();
    setAbortController(controller);

    try {
      // Stage 1: Generate outline
      const outlineRes = await fetch("/api/generate-outline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description, ebookId }),
        signal: controller.signal,
      });

      if (!outlineRes.ok) throw new Error("Failed to generate outline");

      const outlineData = await outlineRes.json();
      setOutline(outlineData.outline);
      setProgress(30);
      setCurrentStep("Outline created! Generating content...");
      setStage("expanding");

      // Stage 2: Expand each section
      const totalSections = outlineData.outline.length;

      for (let i = 0; i < totalSections; i++) {
        if (controller.signal.aborted) {
          throw new Error("Generation cancelled");
        }

        setCurrentStep(`Writing section ${i + 1} of ${totalSections}: ${outlineData.outline[i]}`);

        const expandRes = await fetch("/api/generate-content", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ebookId,
            sectionTitle: outlineData.outline[i],
            sectionIndex: i,
            totalSections,
            description,
          }),
          signal: controller.signal,
        });

        if (!expandRes.ok) throw new Error(`Failed to generate section ${i + 1}`);

        const progressPercent = 30 + ((i + 1) / totalSections) * 65;
        setProgress(progressPercent);
      }

      setProgress(100);
      setStage("complete");
      setCurrentStep("Ebook generated successfully!");

      // Wait a bit before closing
      setTimeout(() => {
        handleClose();
        window.location.reload(); // Refresh to show new pages
      }, 2000);

    } catch (error: any) {
      if (error.name === "AbortError" || error.message === "Generation cancelled") {
        setCurrentStep("Generation cancelled");
      } else {
        console.error("Generation error:", error);
        setCurrentStep("Error generating ebook. Please try again.");
      }
      setIsGenerating(false);
      setStage("idle");
    }
  };

  const handleCancel = () => {
    if (abortController) {
      abortController.abort();
      setAbortController(null);
    }
    setIsGenerating(false);
    setStage("idle");
    setProgress(0);
    setCurrentStep("");
  };

  const handleClose = () => {
    if (isGenerating) {
      handleCancel();
    }
    setDescription("");
    setProgress(0);
    setStage("idle");
    setCurrentStep("");
    setOutline([]);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            AI Ebook Generator
          </DialogTitle>
          <DialogDescription>
            Describe your ebook topic and let AI create the content for you.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {!isGenerating ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="description">Ebook Description</Label>
                <Textarea
                  id="description"
                  placeholder="Example: A comprehensive guide to learning Python programming for beginners, covering basics, data structures, and practical projects..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={6}
                  className="resize-none"
                />
                <p className="text-xs text-zinc-500">
                  Be specific about your topic, target audience, and what you want to cover.
                </p>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button
                  onClick={handleGenerate}
                  disabled={!description.trim()}
                  className="gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Generate Ebook
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-4">
                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-zinc-700 dark:text-zinc-300">
                      {currentStep}
                    </span>
                    <span className="text-zinc-500">{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>

                {/* Outline Preview */}
                {outline.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Outline:</Label>
                    <div className="bg-zinc-50 dark:bg-zinc-900 rounded-lg p-4 space-y-1 max-h-[200px] overflow-y-auto">
                      {outline.map((item, index) => (
                        <div key={index} className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                          <span className="text-zinc-700 dark:text-zinc-300">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Stage Indicator */}
                <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {stage === "outline" && "Analyzing your topic and creating outline..."}
                  {stage === "expanding" && "Writing detailed content for each section..."}
                  {stage === "complete" && "Finalizing your ebook..."}
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  className="gap-2"
                  disabled={stage === "complete"}
                >
                  <X className="w-4 h-4" />
                  Cancel Generation
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
