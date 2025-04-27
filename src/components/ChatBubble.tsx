import { useState } from "react";
import { cn } from "@/lib/utils";
import { Message } from "@/app/page";
import { HeadphoneOff, Headphones, Languages } from "lucide-react";
import { Button } from "./ui/button";

type Props = {
  index: number;
  message: Message;
};

export default function ChatBubble({ message }: Props) {
  const [listening, setListening] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);

  return (
    <div>
      <div
        className={cn("flex gap-1 justify-end mb-1", {
          "justify-start": message.role === "agent",
          "justify-end": message.role === "user",
        })}>
        {message.role === "agent" && (
          <Button
            size={"sm"}
            type="button"
            variant={listening ? "destructive" : "ghost"}
            disabled={listening}>
            {listening ? <HeadphoneOff /> : <Headphones />}
          </Button>
        )}
        <Button
          size={"sm"}
          type="button"
          onClick={() => setShowTranslation(!showTranslation)}
          variant={showTranslation ? "secondary" : "ghost"}
          disabled={listening}>
          <Languages />
        </Button>
      </div>
      <div
        className={cn(
          "flex w-max max-w-[75%] flex-col gap-2 rounded-lg px-3 py-2 animate-fade-in",
          message.role === "user"
            ? "ml-auto bg-primary text-primary-foreground"
            : "bg-muted"
        )}>
        <p>{message.content}</p>
        {showTranslation && (
          <p className="text-sm opacity-70">{message.content || " "}</p>
        )}
      </div>
      <p
        className={cn("text-neutral-500 capitalize text-sm mt-1", {
          "text-right": message.role === "user",
          "text-left": message.role === "agent",
        })}>
        {message.role === "agent" ? "AI" : "You"}
      </p>
    </div>
  );
}
