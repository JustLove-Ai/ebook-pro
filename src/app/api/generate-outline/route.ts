import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { deleteAllPages } from "@/app/actions";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { description, ebookId } = await request.json();

    if (!description || !ebookId) {
      return NextResponse.json(
        { error: "Description and ebookId are required" },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 500 }
      );
    }

    // Delete all existing pages before generating new ones
    await deleteAllPages(ebookId);

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are an expert ebook outline creator. Create a detailed, well-structured outline for an ebook based on the user's description.

Return ONLY a JSON array of chapter/section titles. Each title should be clear, descriptive, and appropriate for the topic.

Format: ["Chapter 1: Introduction to...", "Chapter 2: Understanding...", ...]

Aim for 6-12 sections depending on the complexity of the topic.`,
        },
        {
          role: "user",
          content: `Create an ebook outline for: ${description}`,
        },
      ],
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from OpenAI");
    }

    const parsed = JSON.parse(content);
    const outline = parsed.outline || parsed.chapters || parsed.sections || Object.values(parsed)[0];

    if (!Array.isArray(outline)) {
      throw new Error("Invalid outline format received");
    }

    return NextResponse.json({ outline });
  } catch (error: any) {
    console.error("Error generating outline:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate outline" },
      { status: 500 }
    );
  }
}
