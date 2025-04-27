"use client";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Conversation from "@/components/Conversation";
import { buildConversationHistory } from "@/lib/gemini/conversationHistory";
import { ChevronDown, Info, Menu, Mic, Pause } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Scenario } from "./api/gemini/route";

export type Message = {
  role: "user" | "agent";
  content: string;
};

export default function Home() {
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [convoStarted, setConvoStarted] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [scenario, setScenario] = useState<Scenario>("bartender");

  const handleSendToGemini = async (messages: Message[]) => {
    const history = buildConversationHistory(messages);

    const response = await fetch("/api/gemini", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ history, scenario }),
    });

    const data = await response.json();

    setMessages((prev) => [
      ...prev,
      { role: "agent", content: data.transcript },
    ]);

    return data.transcript;
  };

  const startRecording = async () => {
    setConvoStarted(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream);

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunks.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        setIsLoading(true);

        try {
          const audioBlob = new Blob(audioChunks.current, {
            type: "audio/webm",
          });
          audioChunks.current = [];
          const arrayBuffer = await audioBlob.arrayBuffer();
          const response = await fetch("/api/stt", {
            method: "POST",
            body: arrayBuffer,
          });

          if (!response.ok) throw new Error("Failed to process speech-to-text");

          const { transcript } = await response.json();

          setMessages((prev) => [
            ...prev,
            { role: "user", content: transcript || " " },
          ]);

          console.log("Sending to Gemini...");

          const aiReply = await handleSendToGemini([
            ...messages,
            { role: "user", content: transcript },
          ]);

          console.log("Sending to TTS...");
          const ttsResponse = await fetch("/api/tts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: aiReply }),
          });

          if (!ttsResponse.ok) throw new Error("Failed to process TTS");
          const audioContent = await ttsResponse.arrayBuffer();
          const ttsAudioBlob = new Blob([audioContent], { type: "audio/mp3" });
          const audioUrl = URL.createObjectURL(ttsAudioBlob);
          const audio = new Audio(audioUrl);
          audio.play();
          audio.onended = () => {
            setIsLoading(false);
          };
          audio.onerror = (error) => {
            console.error("Audio playback error:", error);
            alert("An error occurred while playing the audio.");
          };
        } catch (error) {
          console.error(error);
          alert("An error occurred while processing your request.");
        } finally {
          setIsLoading(false);
        }
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);

      // Automatically stop recording after 10 seconds
      setTimeout(() => {
        if (mediaRecorder.state !== "inactive") {
          stopRecording();
        }
      }, 10000);
    } catch (error) {
      console.error(error);
      alert(
        "Failed to start recording. Please check your microphone permissions."
      );
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state !== "inactive") {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);

      // Stop all tracks of the MediaStream
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, isLoading]);

  return (
    <main className="h-screen flex flex-col items-center">
      <div className="text-white bg-black w-screen flex justify-between items-center px-4 py-2">
        <div className="flex gap-2 items-center">
          <h1 className="text-4xl font-bold">Convo</h1>
          <p className="text-neutral-400 text-sm mt-2">
            Practice speaking a new language with AI
          </p>
        </div>
        <Button size="default" variant="secondary">
          <Menu />
        </Button>
      </div>
      <div className="text-black w-screen pb-6 flex justify-center">
        <div className="border-neutral-200 border-x-2 border-b-2 rounded-b-lg p-4 flex gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Label className="text-black/70">Your Native Language</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-black/70 cursor-pointer" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Select the language you are most comfortable speaking</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <Select>
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="Select a language" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="english">English</SelectItem>
                  <SelectItem value="french">French</SelectItem>
                  <SelectItem value="spanish">Spanish</SelectItem>
                  <SelectItem value="german">German</SelectItem>
                  <SelectItem value="dutch">Dutch</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Label className="text-black/70">Language You're Learning</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-black/70 cursor-pointer" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Select the language you wish to have a conversation in</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <Select>
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="Select a language" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="english">English</SelectItem>
                  <SelectItem value="french">French</SelectItem>
                  <SelectItem value="spanish">Spanish</SelectItem>
                  <SelectItem value="german">German</SelectItem>
                  <SelectItem value="dutch">Dutch</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Label className="text-black/70">Conversation Scenario</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-black/70 cursor-pointer" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Select a scenario to have a conversation about</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <Select
              onValueChange={(value) => {
                setScenario(value as Scenario);
                setMessages([]);
              }}>
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="Select a scenario" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="bartender">Bartender</SelectItem>
                  <SelectItem value="lostTourist">A lost tourist</SelectItem>
                  <SelectItem value="curiousLocal">
                    An interesting local
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      <div ref={scrollRef} className="grow overflow-scroll px-5">
        <Conversation messages={messages} />

        {isLoading && (
          <p className="text-neutral-400 text-center animate-pulse">
            Processing...
          </p>
        )}
      </div>

      <div className="w-screen flex flex-col gap-5 justify-center items-center pt-10 pb-32">
        {!convoStarted && (
          <div className="text-neutral-400 flex flex-col justify-center gap-2 items-center text-sm animate-bounce">
            <p>Press to speak</p>
            <ChevronDown size={14} />
          </div>
        )}
        <button
          type="button"
          onClick={isRecording ? stopRecording : startRecording}
          className={cn(
            "rounded-full text-white flex justify-center items-center drop-shadow-2xl hover:cursor-pointer transition-all duration-300 ease-in-out",
            {
              "bg-red-600 hover:bg-red-500": isRecording,
              "bg-gradient-to-b from-indigo-800 to-indigo-600 hover:opacity-90":
                !isRecording,
              "animate-pulse": isLoading,
              "h-40 w-40": convoStarted,
              "h-52 w-52": !convoStarted,
            }
          )}
          disabled={isLoading}>
          {isRecording ? (
            <Pause size={48} strokeWidth={1.25} />
          ) : (
            <Mic size={48} strokeWidth={1.25} />
          )}
        </button>
      </div>
    </main>
  );
}
