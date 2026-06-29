export type ChatRole = "user" | "assistant" | "system";

export type ChatMessageDto = {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: string;
};

export type ChatConversationDto = {
  id: string;
  title: string | null;
  createdAt: string;
  messages: ChatMessageDto[];
};

export type CreateConversationRequest = {
  title?: string | null;
};

export type SendMessageToBotRequest = {
  conversationId: string;
  message: string;
};
