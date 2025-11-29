"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Ebook Actions
export async function getCurrentEbook() {
  try {
    let ebook = await prisma.ebook.findFirst({
      include: {
        theme: true,
        pages: {
          orderBy: {
            order: "asc",
          },
        },
      },
    });

    // Create default theme if none exists
    if (!ebook) {
      const defaultTheme = await prisma.theme.upsert({
        where: { name: "Modern" },
        update: {},
        create: {
          name: "Modern",
          primaryColor: "#0F172A",
          secondaryColor: "#64748B",
          accentColor: "#3B82F6",
          backgroundColor: "#FFFFFF",
          textColor: "#1E293B",
          headingFont: "Inter",
          bodyFont: "Inter",
          h1Size: "2.5rem",
          h2Size: "2rem",
          h3Size: "1.5rem",
          bodySize: "1rem",
        },
      });

      // Create default ebook with a cover page
      ebook = await prisma.ebook.create({
        data: {
          title: "My Ebook",
          description: "Created with Ebook AI Builder",
          themeId: defaultTheme.id,
          pages: {
            create: [
              {
                title: "Cover Page",
                content: "<p>Start creating your amazing <span style=\"color: #EB5757\">ebook</span></p>",
                template: "cover-page",
                order: 0,
              },
            ],
          },
        },
        include: {
          theme: true,
          pages: {
            orderBy: {
              order: "asc",
            },
          },
        },
      });
    }

    return ebook;
  } catch (error) {
    console.error("Failed to get ebook:", error);
    throw new Error("Failed to get ebook");
  }
}

export async function updateEbook(id: string, data: { title?: string; description?: string }) {
  try {
    const ebook = await prisma.ebook.update({
      where: { id },
      data,
    });
    revalidatePath("/");
    return ebook;
  } catch (error) {
    console.error("Failed to update ebook:", error);
    throw new Error("Failed to update ebook");
  }
}

// Page Actions
export async function createPage(ebookId: string) {
  try {
    const lastPage = await prisma.page.findFirst({
      where: { ebookId },
      orderBy: { order: "desc" },
    });

    const newOrder = (lastPage?.order ?? -1) + 1;

    const page = await prisma.page.create({
      data: {
        ebookId,
        order: newOrder,
        title: "New Page",
        content: "<p>Start writing...</p>",
        template: "text-only",
      },
    });

    revalidatePath("/");
    return page;
  } catch (error) {
    console.error("Failed to create page:", error);
    throw new Error("Failed to create page");
  }
}

export async function updatePage(
  id: string,
  data: {
    title?: string;
    content?: string;
    template?: string;
    imageUrl?: string;
    customStyles?: any;
  }
) {
  try {
    const page = await prisma.page.update({
      where: { id },
      data,
    });
    revalidatePath("/");
    return page;
  } catch (error) {
    console.error("Failed to update page:", error);
    throw new Error("Failed to update page");
  }
}

export async function deletePage(id: string) {
  try {
    const page = await prisma.page.delete({
      where: { id },
    });
    revalidatePath("/");
    return page;
  } catch (error) {
    console.error("Failed to delete page:", error);
    throw new Error("Failed to delete page");
  }
}

export async function reorderPages(ebookId: string, pageIds: string[]) {
  try {
    await prisma.$transaction(
      pageIds.map((pageId, index) =>
        prisma.page.update({
          where: { id: pageId },
          data: { order: index },
        })
      )
    );
    revalidatePath("/");
  } catch (error) {
    console.error("Failed to reorder pages:", error);
    throw new Error("Failed to reorder pages");
  }
}

export async function deleteAllPages(ebookId: string) {
  try {
    await prisma.page.deleteMany({
      where: { ebookId },
    });
    revalidatePath("/");
  } catch (error) {
    console.error("Failed to delete all pages:", error);
    throw new Error("Failed to delete all pages");
  }
}

// Theme Actions
export async function getAllThemes() {
  try {
    const themes = await prisma.theme.findMany({
      orderBy: {
        createdAt: "asc",
      },
    });
    return themes;
  } catch (error) {
    console.error("Failed to get themes:", error);
    throw new Error("Failed to get themes");
  }
}

export async function updateEbookTheme(ebookId: string, themeId: string) {
  try {
    const ebook = await prisma.ebook.update({
      where: { id: ebookId },
      data: { themeId },
      include: {
        theme: true,
      },
    });
    revalidatePath("/");
    return ebook;
  } catch (error) {
    console.error("Failed to update ebook theme:", error);
    throw new Error("Failed to update ebook theme");
  }
}

export async function createTheme(data: {
  name: string;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  backgroundColor?: string;
  textColor?: string;
  headingFont?: string;
  bodyFont?: string;
  h1Size?: string;
  h2Size?: string;
  h3Size?: string;
  bodySize?: string;
}) {
  try {
    const theme = await prisma.theme.create({
      data: {
        name: data.name,
        primaryColor: data.primaryColor ?? "#000000",
        secondaryColor: data.secondaryColor ?? "#666666",
        accentColor: data.accentColor ?? "#0066ff",
        backgroundColor: data.backgroundColor ?? "#ffffff",
        textColor: data.textColor ?? "#000000",
        headingFont: data.headingFont ?? "Inter",
        bodyFont: data.bodyFont ?? "Inter",
        h1Size: data.h1Size ?? "2.5rem",
        h2Size: data.h2Size ?? "2rem",
        h3Size: data.h3Size ?? "1.5rem",
        bodySize: data.bodySize ?? "1rem",
      },
    });
    revalidatePath("/");
    return theme;
  } catch (error) {
    console.error("Failed to create theme:", error);
    throw new Error("Failed to create theme");
  }
}

export async function updateTheme(
  id: string,
  data: {
    name?: string;
    primaryColor?: string;
    secondaryColor?: string;
    accentColor?: string;
    backgroundColor?: string;
    textColor?: string;
    headingFont?: string;
    bodyFont?: string;
    h1Size?: string;
    h2Size?: string;
    h3Size?: string;
    bodySize?: string;
  }
) {
  try {
    const theme = await prisma.theme.update({
      where: { id },
      data,
    });
    revalidatePath("/");
    return theme;
  } catch (error) {
    console.error("Failed to update theme:", error);
    throw new Error("Failed to update theme");
  }
}

export async function seedThemes() {
  try {
    const themes = [
      {
        name: "Modern",
        primaryColor: "#0F172A",
        secondaryColor: "#64748B",
        accentColor: "#3B82F6",
        backgroundColor: "#FFFFFF",
        textColor: "#1E293B",
        headingFont: "Inter",
        bodyFont: "Inter",
        h1Size: "2.5rem",
        h2Size: "2rem",
        h3Size: "1.5rem",
        bodySize: "1rem",
      },
      {
        name: "Elegant",
        primaryColor: "#1C1C1C",
        secondaryColor: "#6B7280",
        accentColor: "#D4AF37",
        backgroundColor: "#FAFAFA",
        textColor: "#2D2D2D",
        headingFont: "Playfair Display",
        bodyFont: "Lora",
        h1Size: "3rem",
        h2Size: "2.25rem",
        h3Size: "1.75rem",
        bodySize: "1.125rem",
      },
      {
        name: "Ocean Blue",
        primaryColor: "#0C4A6E",
        secondaryColor: "#0891B2",
        accentColor: "#06B6D4",
        backgroundColor: "#F0F9FF",
        textColor: "#164E63",
        headingFont: "Montserrat",
        bodyFont: "Open Sans",
        h1Size: "2.75rem",
        h2Size: "2.125rem",
        h3Size: "1.625rem",
        bodySize: "1rem",
      },
      {
        name: "Sunset",
        primaryColor: "#7C2D12",
        secondaryColor: "#C2410C",
        accentColor: "#F97316",
        backgroundColor: "#FFF7ED",
        textColor: "#431407",
        headingFont: "Poppins",
        bodyFont: "Roboto",
        h1Size: "2.5rem",
        h2Size: "2rem",
        h3Size: "1.5rem",
        bodySize: "1rem",
      },
      {
        name: "Forest Green",
        primaryColor: "#14532D",
        secondaryColor: "#16A34A",
        accentColor: "#22C55E",
        backgroundColor: "#F0FDF4",
        textColor: "#052E16",
        headingFont: "Merriweather",
        bodyFont: "Source Sans Pro",
        h1Size: "2.625rem",
        h2Size: "2.125rem",
        h3Size: "1.625rem",
        bodySize: "1.0625rem",
      },
      {
        name: "Royal Purple",
        primaryColor: "#581C87",
        secondaryColor: "#7C3AED",
        accentColor: "#A855F7",
        backgroundColor: "#FAF5FF",
        textColor: "#3B0764",
        headingFont: "Raleway",
        bodyFont: "Nunito",
        h1Size: "2.75rem",
        h2Size: "2.25rem",
        h3Size: "1.75rem",
        bodySize: "1.0625rem",
      },
      {
        name: "Minimalist",
        primaryColor: "#000000",
        secondaryColor: "#525252",
        accentColor: "#737373",
        backgroundColor: "#FFFFFF",
        textColor: "#171717",
        headingFont: "Helvetica",
        bodyFont: "Arial",
        h1Size: "3rem",
        h2Size: "2.25rem",
        h3Size: "1.5rem",
        bodySize: "1rem",
      },
      {
        name: "Warm Beige",
        primaryColor: "#78350F",
        secondaryColor: "#92400E",
        accentColor: "#B45309",
        backgroundColor: "#FEF3C7",
        textColor: "#451A03",
        headingFont: "Georgia",
        bodyFont: "Garamond",
        h1Size: "2.875rem",
        h2Size: "2.25rem",
        h3Size: "1.75rem",
        bodySize: "1.125rem",
      },
      // Dark Themes
      {
        name: "Dark Modern",
        primaryColor: "#60A5FA",
        secondaryColor: "#94A3B8",
        accentColor: "#3B82F6",
        backgroundColor: "#0F172A",
        textColor: "#E2E8F0",
        headingFont: "Inter",
        bodyFont: "Inter",
        h1Size: "2.5rem",
        h2Size: "2rem",
        h3Size: "1.5rem",
        bodySize: "1rem",
      },
      {
        name: "Dark Elegant",
        primaryColor: "#F5D782",
        secondaryColor: "#9CA3AF",
        accentColor: "#D4AF37",
        backgroundColor: "#1C1C1C",
        textColor: "#F5F5F5",
        headingFont: "Playfair Display",
        bodyFont: "Lora",
        h1Size: "3rem",
        h2Size: "2.25rem",
        h3Size: "1.75rem",
        bodySize: "1.125rem",
      },
      {
        name: "Midnight Blue",
        primaryColor: "#38BDF8",
        secondaryColor: "#7DD3FC",
        accentColor: "#0EA5E9",
        backgroundColor: "#0C1222",
        textColor: "#CBD5E1",
        headingFont: "Montserrat",
        bodyFont: "Open Sans",
        h1Size: "2.75rem",
        h2Size: "2.125rem",
        h3Size: "1.625rem",
        bodySize: "1rem",
      },
      {
        name: "Dark Purple",
        primaryColor: "#C084FC",
        secondaryColor: "#A78BFA",
        accentColor: "#8B5CF6",
        backgroundColor: "#1E1033",
        textColor: "#E9D5FF",
        headingFont: "Raleway",
        bodyFont: "Nunito",
        h1Size: "2.75rem",
        h2Size: "2.25rem",
        h3Size: "1.75rem",
        bodySize: "1.0625rem",
      },
      {
        name: "Charcoal",
        primaryColor: "#F9FAFB",
        secondaryColor: "#D1D5DB",
        accentColor: "#9CA3AF",
        backgroundColor: "#18181B",
        textColor: "#E4E4E7",
        headingFont: "Helvetica",
        bodyFont: "Arial",
        h1Size: "3rem",
        h2Size: "2.25rem",
        h3Size: "1.5rem",
        bodySize: "1rem",
      },
      {
        name: "Dark Forest",
        primaryColor: "#4ADE80",
        secondaryColor: "#86EFAC",
        accentColor: "#22C55E",
        backgroundColor: "#0A1F0D",
        textColor: "#DCFCE7",
        headingFont: "Merriweather",
        bodyFont: "Source Sans Pro",
        h1Size: "2.625rem",
        h2Size: "2.125rem",
        h3Size: "1.625rem",
        bodySize: "1.0625rem",
      },
    ];

    for (const themeData of themes) {
      await prisma.theme.upsert({
        where: { name: themeData.name },
        update: themeData, // Update existing themes to restore defaults
        create: themeData,
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Failed to seed themes:", error);
    throw new Error("Failed to seed themes");
  }
}
