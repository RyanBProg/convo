import { replyGuide } from "@/lib/gemini/replyGuide";
import { GoogleGenAI } from "@google/genai";
import {
  bartenderScenario,
  curiousLocalScenario,
  lostTouristScenario,
} from "@/lib/gemini/scenarios";

export type Scenario = "bartender" | "curiousLocal" | "lostTourist";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const scenarioMap = {
  bartender: bartenderScenario,
  curiousLocal: curiousLocalScenario,
  lostTourist: lostTouristScenario,
};

export async function POST(req: Request) {
  const { history, scenario } = (await req.json()) as {
    history: string;
    scenario: Scenario;
  };

  const guide = replyGuide;
  const scenarioText = scenarioMap[scenario] || scenarioMap.bartender;

  const response = await ai.models.generateContent({
    model: "gemini-1.5-flash",
    contents: { text: scenarioText + history },
    config: {
      maxOutputTokens: 500,
      temperature: 0.1,
      systemInstruction: guide,
    },
  });

  return new Response(JSON.stringify({ transcript: response.text }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
