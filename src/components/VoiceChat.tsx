"use client";

import { useState, useRef } from "react";
import RecordRTC from "recordrtc";

let recorder: any;

export default function VoiceChat() {
  const [isRecording, setIsRecording] = useState(false);
  const [messages, setMessages] = useState<{ role: string; content: string }[]>(
    []
  );
  const audioChunks = useRef<Blob[]>([]);

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      recorder = new RecordRTC(stream, {
        type: "audio",
        mimeType: "audio/webm",
        recorderType: RecordRTC.StereoAudioRecorder,
        timeSlice: 300, // Collect audio chunks every 300ms
        numberOfAudioChannels: 1, // Force mono audio
        desiredSampRate: 48000,
        ondataavailable: (blob: Blob) => {
          audioChunks.current.push(blob);
        },
      });

      recorder.startRecording();
      setIsRecording(true);
    } catch (error) {
      console.error("Failed to start recording:", error);
      alert(
        "Failed to start recording. Please check your microphone permissions."
      );
    }
  }

  async function stopRecording() {
    recorder.stopRecording(async () => {
      setIsRecording(false);

      const audioBlob = new Blob(audioChunks.current, { type: "audio/webm" });
      audioChunks.current = []; // Clear the audio chunks

      try {
        const arrayBuffer = await audioBlob.arrayBuffer();

        // Send audio data to the server
        const response = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/octet-stream" },
          body: arrayBuffer,
        });

        if (!response.ok) {
          throw new Error("Failed to process audio");
        }

        const { transcript, aiResponse } = await response.json();

        // Update messages with user and AI responses
        setMessages((prev) => [
          ...prev,
          { role: "user", content: transcript },
          { role: "agent", content: aiResponse },
        ]);
      } catch (error) {
        console.error("Error processing audio:", error);
        alert("An error occurred while processing your audio.");
      }
    });
  }

  return (
    <div className="voice-chat">
      <div className="messages">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`message ${message.role === "user" ? "user" : "agent"}`}>
            {message.content}
          </div>
        ))}
      </div>

      <button
        onClick={isRecording ? stopRecording : startRecording}
        className={`record-button ${isRecording ? "recording" : ""}`}>
        {isRecording ? "Stop Recording" : "Start Recording"}
      </button>
    </div>
  );
}
