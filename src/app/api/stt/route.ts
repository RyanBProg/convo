import { SpeechClient } from "@google-cloud/speech";
import serviceAccount from "@/config/google-service-account.json";
import type { protos } from "@google-cloud/speech";

const client = new SpeechClient({
  credentials: {
    client_email: serviceAccount.client_email,
    private_key: serviceAccount.private_key,
  },
  projectId: serviceAccount.project_id,
});

export async function POST(req: Request) {
  const audioBuffer = await req.arrayBuffer();

  const audio = {
    content: Buffer.from(audioBuffer).toString("base64"),
  };

  const config: Partial<protos.google.cloud.speech.v1.RecognitionConfig> = {
    encoding: "WEBM_OPUS",
    sampleRateHertz: 48000,
    languageCode: "en-US",
  };

  try {
    console.log("starting speech-to-text processing...");
    const [response] = await client.recognize({ audio, config });

    // Collect all transcripts into a single string
    const transcript = response.results
      ?.map((result) => result.alternatives?.[0]?.transcript || "")
      .join(" ");

    return new Response(JSON.stringify({ transcript }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error processing speech-to-text:", error);
    return new Response(
      JSON.stringify({ error: "Failed to process speech-to-text" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
