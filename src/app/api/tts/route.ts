import textToSpeech from "@google-cloud/text-to-speech";
import serviceAccount from "@/config/google-service-account.json";

const ttsClient = new textToSpeech.TextToSpeechClient({
  credentials: {
    client_email: serviceAccount.client_email,
    private_key: serviceAccount.private_key,
  },
  projectId: serviceAccount.project_id,
});

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    const [response] = await ttsClient.synthesizeSpeech({
      input: { text },
      voice: {
        languageCode: "en-US",
        ssmlGender: "NEUTRAL",
        name: "en-US-Wavenet-D",
      },
      audioConfig: {
        audioEncoding: "MP3",
      },
    });

    if (!response.audioContent) {
      throw new Error("Audio content is undefined");
    }

    const audioBuffer =
      typeof response.audioContent === "string"
        ? Buffer.from(response.audioContent, "base64")
        : Buffer.from(response.audioContent);

    return new Response(audioBuffer, {
      status: 200,
      headers: { "Content-Type": "audio/mpeg" },
    });
  } catch (error) {
    console.error("Error processing audio:", error);
    return new Response(JSON.stringify({ error: "Failed to process audio" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
