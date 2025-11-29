import { NextResponse } from "next/server";
import { seedThemes } from "@/app/actions";

export async function GET() {
  try {
    await seedThemes();
    return NextResponse.json({ success: true, message: "Themes seeded successfully" });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json(
      { error: "Failed to seed themes" },
      { status: 500 }
    );
  }
}
