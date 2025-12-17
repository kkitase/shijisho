import { NextRequest, NextResponse } from "next/server";
import { analyzeImageWithInstructions } from "@/lib/gemini";
import { AnalyzeResponse } from "@/types";

export async function POST(request: NextRequest): Promise<NextResponse<AnalyzeResponse>> {
  try {
    const { image, mimeType, instructions } = await request.json();

    if (!image || !instructions || !Array.isArray(instructions)) {
      return NextResponse.json(
        { annotations: [], error: "Invalid request: image and instructions are required" },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { annotations: [], error: "GEMINI_API_KEY is not configured" },
        { status: 500 }
      );
    }

    const annotations = await analyzeImageWithInstructions(
      image,
      mimeType || "image/png",
      instructions
    );

    return NextResponse.json({ annotations });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { annotations: [], error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
