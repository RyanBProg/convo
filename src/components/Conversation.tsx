import ChatBubble from "./ChatBubble";
import { Message } from "@/app/page";

type Props = {
  messages: Message[];
};

export default function Conversation({ messages }: Props) {
  return (
    <div className="p-4 pt-10 space-y-4 w-[574px]">
      {messages.map((message, index) => (
        <ChatBubble key={index} index={index} message={message} />
      ))}
    </div>
  );
}
