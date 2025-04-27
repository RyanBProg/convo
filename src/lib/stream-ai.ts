import textToSpeech from "@google-cloud/text-to-speech";
import { GoogleGenAI } from "@google/genai";
import serviceAccount from "@/config/google-service-account.json";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const ttsClient = new textToSpeech.TextToSpeechClient({
  credentials: {
    client_email: serviceAccount.client_email,
    private_key: serviceAccount.private_key,
  },
  projectId: serviceAccount.project_id,
});

export async function streamConversation(userInput: string): Promise<string> {
  const chatStream = await ai.models.generateContentStream({
    model: "gemini-1.5-flash",
    contents: { text: userInput },
  });

  let response = "";

  for await (const chunk of chatStream.stream) {
    response += chunk.text || "";
  }

  return response.trim();
}
