import { PrismaClient } from "@prisma/client";
import "dotenv/config";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create themes
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
      name: "Classic",
      primaryColor: "#1F2937",
      secondaryColor: "#6B7280",
      accentColor: "#10B981",
      backgroundColor: "#F9FAFB",
      textColor: "#111827",
      headingFont: "Georgia",
      bodyFont: "Georgia",
      h1Size: "3rem",
      h2Size: "2.25rem",
      h3Size: "1.75rem",
      bodySize: "1.125rem",
    },
    {
      name: "Elegant",
      primaryColor: "#18181B",
      secondaryColor: "#71717A",
      accentColor: "#F59E0B",
      backgroundColor: "#FAFAF9",
      textColor: "#27272A",
      headingFont: "Playfair Display",
      bodyFont: "Lora",
      h1Size: "3.5rem",
      h2Size: "2.5rem",
      h3Size: "2rem",
      bodySize: "1.125rem",
    },
    {
      name: "Minimalist",
      primaryColor: "#000000",
      secondaryColor: "#737373",
      accentColor: "#0EA5E9",
      backgroundColor: "#FFFFFF",
      textColor: "#171717",
      headingFont: "Inter",
      bodyFont: "Inter",
      h1Size: "2.25rem",
      h2Size: "1.875rem",
      h3Size: "1.5rem",
      bodySize: "1rem",
    },
  ];

  for (const theme of themes) {
    await prisma.theme.upsert({
      where: { name: theme.name },
      update: theme,
      create: theme,
    });
    console.log(`Created/Updated theme: ${theme.name}`);
  }

  console.log("Seeding completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
