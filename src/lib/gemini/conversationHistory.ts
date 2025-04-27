import { Message } from "@/app/page";

export function buildConversationHistory(messages: Message[]): string {
  if (messages.length === 0) {
    return "There is no conversation history, please just reply: 'Sorry, I didn't quite get that, could you say it again?'";
  }

  let prompt =
    "The following is a previous conversation between a you (agent) and a user:\n\n";

  messages.forEach((message) => {
    prompt += `${message.role}: ${message.content}\n\n`;
  });

  prompt +=
    "Based on the context of the above conversation and the given scenario, what's your reply to the most recent message from the user? If There is no conversation history provided and/or there is an issue with the most recent message, please just ask the user to repeat their question.\n\n";

  return prompt;
}
