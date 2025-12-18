import { GoogleGenerativeAI } from "@google/generative-ai";
import { Annotation } from "@/types";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function analyzeImageWithInstructions(
  imageBase64: string,
  mimeType: string,
  instructions: string[]
): Promise<Annotation[]> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const instructionsText = instructions
    .map((inst, i) => `${i + 1}. ${inst}`)
    .join("\n");

  const prompt = `You are an image annotation assistant. Analyze this image and the following correction instructions.
For each instruction, identify the location in the image where the correction should be made.

Instructions:
${instructionsText}

Return a JSON array of annotations. Each annotation should have:
- number: the instruction number (1, 2, 3, etc.)
- label: a short summary of the correction (max 20 characters in Japanese)
- targetX: the X coordinate (0-100 as percentage of image width) where the arrow should point
- targetY: the Y coordinate (0-100 as percentage of image height) where the arrow should point
- arrowStartX: the X coordinate (0-100) where the arrow label/number should be placed (should be outside the main content area, typically in margins)
- arrowStartY: the Y coordinate (0-100) where the arrow label/number should be placed

Important:
- Place arrow starting points in the margins or empty areas of the image
- Make sure arrows don't overlap each other
- Target coordinates should point to the exact location that needs correction
- Respond ONLY with a valid JSON array, no other text

Example response:
[
  {"number": 1, "label": "有機→コーヒー豆", "targetX": 45, "targetY": 25, "arrowStartX": 10, "arrowStartY": 25},
  {"number": 2, "label": "商品名追加", "targetX": 50, "targetY": 5, "arrowStartX": 10, "arrowStartY": 5}
]`;

  try {
    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: mimeType,
          data: imageBase64,
        },
      },
      { text: prompt },
    ]);

    const response = await result.response;
    const text = response.text();

    // Extract JSON from response (handle markdown code blocks)
    let jsonStr = text;
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1].trim();
    }

    const annotations: Annotation[] = JSON.parse(jsonStr);
    return annotations;
  } catch (error) {
    console.error("Error analyzing image:", error);
    throw error;
  }
}
