import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { prisma } from "@/lib/prisma";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { ebookId, sectionTitle, sectionIndex, totalSections, description } = await request.json();

    if (!ebookId || !sectionTitle) {
      return NextResponse.json(
        { error: "ebookId and sectionTitle are required" },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 500 }
      );
    }

    // Generate content for this section
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are an expert ebook content writer. Create engaging, informative content for a specific section of an ebook.

The content should be:
- Well-structured with clear paragraphs
- Informative and valuable to readers
- Written in a professional yet accessible tone
- Between 250-400 words (keep it concise to fit on one page)
- Use <h2> or <h3> for subheadings within the section

Return the content as HTML with proper paragraph tags (<p>), headings (<h2>, <h3>), and formatting as needed.
DO NOT include the section title as an <h1> - that will be added separately.
IMPORTANT: Keep content concise to fit on a single ebook page.`,
        },
        {
          role: "user",
          content: `Ebook topic: ${description}

Section ${sectionIndex + 1} of ${totalSections}: "${sectionTitle}"

Write comprehensive content for this section.`,
        },
      ],
      temperature: 0.8,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from OpenAI");
    }

    // Determine template based on section
    let template = "text-only";
    if (sectionIndex === 0) {
      template = "cover-page"; // First section as cover
    } else if (sectionIndex % 4 === 0) {
      template = "image-top"; // Add variety every 4 sections
    }

    // Create the page in database
    const page = await prisma.page.create({
      data: {
        ebookId,
        title: sectionTitle,
        content,
        template,
        order: sectionIndex,
      },
    });

    return NextResponse.json({ success: true, page });
  } catch (error: any) {
    console.error("Error generating content:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate content" },
      { status: 500 }
    );
  }
}
